// optimized-process-issues.ts
import OpenAI from "openai";
import pLimit from "p-limit";

import { IssueManagementPayload, ProcessedIssue } from "../types";

/**
 * Optimized processIssues:
 * - Heuristic first (fast, local) for category/priority/duplicates/order
 * - Only call LLM for ambiguous items (small batches)
 * - Limit concurrency and use per-request timeouts
 */

const LLM_MODEL = "gpt-4o-mini"; // faster & cheaper than full gpt-4 (swap if desired)
const LLM_BATCH = 6; // number of ambiguous issues per LLM request
const MAX_LL_CONCURRENCY = 2;
const LLM_TIMEOUT_MS = 15000; // 15s per LLM call

export async function processIssues(
	payload: IssueManagementPayload,
	env: Env,
): Promise<ProcessedIssue[]> {
	const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
	const { issues: rawIssues } = payload;

	console.log(`Processing ${rawIssues.length} issues (optimized)`);

	// 1) Sort once (open first, newest first)
	const issues = [...rawIssues].sort((a, b) => {
		if (a.state === "open" && b.state !== "open") return -1;
		if (a.state !== "open" && b.state === "open") return 1;
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});

	// 2) Cap issues (if you want)
	const MAX = 100;
	const limited = issues.slice(0, Math.min(issues.length, MAX));

	// 3) Preliminary heuristic pass
	const heuristicResults = limited.map((issue) => {
		const h = heuristicClassify(issue);
		return { issue, heuristic: h, final: null as any };
	});

	// 4) Detect duplicates by normalized titles (cheap)
	const titleMap: Record<string, number[]> = {};
	heuristicResults.forEach(({ issue }, idx) => {
		const norm = normalizeTitle(issue.title);
		(titleMap[norm] ??= []).push(idx);
	});

	// Attach duplicates from title clusters (only obvious duplicates)
	heuristicResults.forEach((r, idx) => {
		const norm = normalizeTitle(r.issue.title);
		const cluster = titleMap[norm] || [];
		r.heuristic.duplicates = cluster
			.filter((i) => i !== idx)
			.map((i) => heuristicResults[i].issue.issue_number);
	});

	// 5) Force ALL issues through LLM for debugging
	const ambiguous = heuristicResults.map((r, idx) => ({ ...r, idx }));

	console.log(
		`Heuristic resolved ${heuristicResults.length - ambiguous.length} issues; ${ambiguous.length} ambiguous.`,
	);
	console.log(
		"Ambiguous issues:",
		ambiguous.map((a) => ({
			issue: a.issue.issue_number,
			title: a.issue.title,
			confidence: a.heuristic.confidence,
			category: a.heuristic.category,
		})),
	);

	// 6) If nothing ambiguous, finalize and return
	if (ambiguous.length === 0) {
		return finalizeFromHeuristics(heuristicResults);
	}

	// 7) Build LLM batches for ambiguous issues only
	const batches: Array<{ indices: number[]; issues: any[] }> = [];
	for (let i = 0; i < ambiguous.length; i += LLM_BATCH) {
		const slice = ambiguous.slice(i, i + LLM_BATCH);
		batches.push({
			indices: slice.map((s) => s.idx),
			issues: slice.map((s) => toSmallIssue(s.issue)),
		});
	}

	// Concurrency limiter
	const limit = pLimit(MAX_LL_CONCURRENCY);

	// call LLM only for ambiguous batches
	const llmResults = await Promise.all(
		batches.map((b, i) =>
			limit(async () => {
				try {
					return await withTimeout(
						callLLMForBatch(openai, payload.repository, b.issues),
						LLM_TIMEOUT_MS,
					);
				} catch (e) {
					console.error(`LLM batch ${i} failed:`, e);
					return { issues: [] as any[] };
				}
			}),
		),
	);

	// 8) Merge LLM results back into heuristicResults
	llmResults.forEach((res, batchIndex) => {
		const batch = batches[batchIndex];
		(res.issues || []).forEach((p: any, i: number) => {
			const globalIdx = batch.indices[i];
			if (!globalIdx && globalIdx !== 0) return; // safety
			// Merge: prefer LLM values for ambiguous fields, fall back to heuristic
			heuristicResults[globalIdx].final = mergeHeuristicAndLLM(
				heuristicResults[globalIdx].heuristic,
				p,
			);
		});
	});

	// any ambiguous items that didn't get LLM output -> fallback to heuristic
	heuristicResults.forEach((r) => {
		if (!r.final) r.final = finalizeHeuristic(r.heuristic);
	});

	// 9) Compose final ProcessedIssue[] and compute implementation order
	const processed = heuristicResults.map((r) =>
		toProcessedIssue(r.issue, r.final),
	);

	// Implementation order: sort by priority (critical -> low), then by open and recency
	processed.sort(
		(a, b) => implementationOrderScore(a) - implementationOrderScore(b),
	);

	// Assign implementationOrder 1..N
	processed.forEach((p, i) => (p.implementationOrder = i + 1));

	return processed;
}

/* ---------------------------
   Helper / Heuristic functions
   --------------------------- */

function normalizeTitle(title: string) {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function toSmallIssue(issue: any) {
	return {
		issue_number: issue.issue_number,
		title: issue.title,
		labels: (issue.labels || []).slice(0, 4),
		body: (issue.body || "").slice(0, 140),
		url: issue.url,
		state: issue.state,
		created_at: issue.created_at,
	};
}

type HeuristicResult = {
	category:
		| "Bug"
		| "Feature"
		| "Enhancement"
		| "Chore"
		| "Documentation"
		| "unknown";
	priority: "Critical" | "High" | "Medium" | "Low";
	confidence: number; // 0..1
	duplicates: number[]; // issue_numbers
	reasoning?: string;
};

function heuristicClassify(issue: any): HeuristicResult {
	const title = (issue.title || "").toLowerCase();
	const labels = ((issue.labels || []) as string[]).map((s) => s.toLowerCase());
	const body = (issue.body || "").toLowerCase();

	// candidate category by label priority
	if (labels.some((l) => l.includes("bug") || l === "bug")) {
		return {
			category: "Bug",
			priority: labelToPriority(labels) || "High",
			confidence: 0.95,
			duplicates: [],
		};
	}
	if (
		labels.some(
			(l) =>
				l.includes("feature") ||
				l.includes("enhancement") ||
				l.includes("proposal"),
		)
	) {
		return {
			category: "Feature",
			priority: labelToPriority(labels) || "Medium",
			confidence: 0.9,
			duplicates: [],
		};
	}
	if (labels.some((l) => l.includes("docs") || l.includes("documentation"))) {
		return {
			category: "Documentation",
			priority: "Low",
			confidence: 0.95,
			duplicates: [],
		};
	}
	// title keyword heuristics
	if (
		/\b(error|exception|crash|bug|fail|fails|panic)\b/.test(title) ||
		/\b(error|exception|crash|bug)\b/.test(body)
	) {
		return {
			category: "Bug",
			priority: "High",
			confidence: 0.8,
			duplicates: [],
		};
	}
	if (/\b(feature request|feature|add support|support for)\b/.test(title)) {
		return {
			category: "Feature",
			priority: "Medium",
			confidence: 0.8,
			duplicates: [],
		};
	}
	// fallback: unknown but produce a default priority based on labels/keywords
	const defaultPriority =
		labelToPriority(labels) || titlePriorityGuess(title) || "Medium";
	return {
		category: "unknown",
		priority: defaultPriority,
		confidence: 0.5,
		duplicates: [],
	};
}

function labelToPriority(
	labels: string[],
): "Critical" | "High" | "Medium" | "Low" | undefined {
	if (
		labels.some(
			(l) =>
				l.includes("p: urgent") || l.includes("p: high") || l === "critical",
		)
	)
		return "Critical";
	if (labels.some((l) => l.includes("p: high") || l.includes("p: h")))
		return "High";
	if (labels.some((l) => l.includes("p: low") || l.includes("low")))
		return "Low";
	return undefined;
}
function titlePriorityGuess(title: string) {
	if (/\b(blocker|urgent|hotfix|critical)\b/.test(title)) return "Critical";
	if (/\b(high|major|important)\b/.test(title)) return "High";
	if (/\b(minor|low)\b/.test(title)) return "Low";
	return undefined;
}

function finalizeFromHeuristics(heuristics: any[]) {
	const processed = heuristics.map((r: any) => {
		const p = r.heuristic;
		return toProcessedIssue(r.issue, finalizeHeuristic(p));
	});
	processed.sort(
		(a, b) => implementationOrderScore(a) - implementationOrderScore(b),
	);
	processed.forEach((p, i) => (p.implementationOrder = i + 1));
	return processed;
}

function finalizeHeuristic(h: HeuristicResult) {
	return {
		category: h.category === "unknown" ? "Enhancement" : h.category,
		priority: h.priority,
		duplicates: h.duplicates || [],
		reasoning: "Auto-classified using labels/title heuristics",
		implementationOrder: 0,
	};
}

/* ---------------------------
   LLM call + merging logic
   --------------------------- */

async function callLLMForBatch(openai: OpenAI, repo: any, issues: any[]) {
	// Very short prompt: issues only include small snippets
	const system = `You are an expert GitHub issue triage assistant. For each issue provided, return JSON array "issues" where each item:
  { "issue_number": number, "category": "Bug"|"Feature"|"Enhancement"|"Chore"|"Documentation", "priority":"Critical"|"High"|"Medium"|"Low", "duplicates": [issue_numbers], "reasoning": "short explanation" }.
  Return only valid JSON.`;

	const userText =
		`Repo: ${repo.name} (${repo.owner || "unknown"})\nIssues: ${issues.length}\n` +
		issues
			.map(
				(it) =>
					`#${it.issue_number}: ${it.title}\nLabels: ${it.labels.join(", ")}\nBody: ${it.body.slice(0, 80)}\n`,
			)
			.join("\n");

	console.log("LLM Input:", userText);

	const res = await openai.chat.completions.create({
		model: LLM_MODEL,
		messages: [
			{ role: "system", content: system },
			{ role: "user", content: userText },
		],
		max_tokens: 400,
		temperature: 0.0,
	});

	const content = res.choices?.[0]?.message?.content || "";
	console.log("LLM Response:", content);

	const parsed = safeJsonExtract(content);
	console.log("Parsed LLM Response:", parsed);

	// normalize parsed to object { issues: [...] }
	return parsed && parsed.issues ? { issues: parsed.issues } : { issues: [] };
}

function mergeHeuristicAndLLM(h: HeuristicResult, llm: any) {
	// If LLM returned nothing, keep heuristic.
	if (!llm || Object.keys(llm).length === 0) return finalizeHeuristic(h);

	// prefer LLM category/priority but fallback to heuristic where missing
	return {
		category:
			llm.category || (h.category === "unknown" ? "Enhancement" : h.category),
		priority: llm.priority || h.priority,
		duplicates: llm.duplicates || h.duplicates || [],
		reasoning: llm.reasoning || h.reasoning || "Combined heuristic + LLM",
		implementationOrder: 0,
	};
}

/* ---------------------------
   Utilities
   --------------------------- */

function toProcessedIssue(issue: any, final: any): ProcessedIssue {
	return {
		issue_number: issue.issue_number,
		title: issue.title,
		category: final.category,
		priority: final.priority,
		duplicates: final.duplicates || [],
		reasoning: final.reasoning || "",
		implementationOrder: final.implementationOrder || 0,
	} as ProcessedIssue;
}

function implementationOrderScore(p: ProcessedIssue) {
	const prioScore = priorityToScore(p.priority);
	const openScore = p.priority ? 0 : 1; // open issues get slightly higher priority
	// recency is not available here; ideally use created_at to tie-break
	return prioScore * 1000 + openScore;
}

function priorityToScore(p: string | undefined) {
	switch (p) {
		case "Critical":
			return 1;
		case "High":
			return 2;
		case "Medium":
			return 3;
		case "Low":
			return 4;
		default:
			return 5;
	}
}

function safeJsonExtract(content: string) {
	// attempt to find first { ... } or [ ... ] block and parse
	const objMatch =
		content.match(/\{[\s\S]*\}$/m) || content.match(/\{[\s\S]*?\}/m);
	const arrMatch = content.match(/\[[\s\S]*\]/m);
	const candidate = objMatch
		? objMatch[0]
		: arrMatch
			? `{"issues": ${arrMatch[0]}}`
			: null;
	if (!candidate) return null;
	try {
		return JSON.parse(candidate);
	} catch (e) {
		console.error("safeJsonExtract parse failed:", e);
		return null;
	}
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error("Timeout")), ms),
		),
	]);
}
