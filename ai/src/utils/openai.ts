import OpenAI from "openai";
import pLimit from "p-limit";

import {
	withTimeout,
	toSmallIssue,
	normalizeTitle,
	safeJsonExtract,
	toProcessedIssue,
	finalizeHeuristic,
	heuristicClassify,
	mergeHeuristicAndLLM,
	finalizeFromHeuristics,
	implementationOrderScore,
} from "./issue-processing";
import { IssueManagementPayload, ProcessedIssue } from "../types";

const LLM_BATCH = 6;
const LLM_TIMEOUT_MS = 15000;
const MAX_LL_CONCURRENCY = 2;
const LLM_MODEL = "gpt-4o-mini";

export async function processIssues(
	payload: IssueManagementPayload,
	env: Env,
): Promise<ProcessedIssue[]> {
	const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
	const { issues: rawIssues } = payload;

	const issues = [...rawIssues].sort((a, b) => {
		if (a.state === "open" && b.state !== "open") return -1;
		if (a.state !== "open" && b.state === "open") return 1;
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});

	const MAX = 100;
	const limited = issues.slice(0, Math.min(issues.length, MAX));

	const heuristicResults = limited.map((issue) => {
		const h = heuristicClassify(issue);
		return { issue, heuristic: h, final: null as any };
	});

	const titleMap: Record<string, number[]> = {};
	heuristicResults.forEach(({ issue }, idx) => {
		const norm = normalizeTitle(issue.title);
		(titleMap[norm] ??= []).push(idx);
	});

	heuristicResults.forEach((r, idx) => {
		const norm = normalizeTitle(r.issue.title);
		const cluster = titleMap[norm] || [];
		r.heuristic.duplicates = cluster
			.filter((i) => i !== idx)
			.map((i) => heuristicResults[i].issue.issue_number);
	});

	const ambiguous = heuristicResults.map((r, idx) => ({ ...r, idx }));

	if (ambiguous.length === 0) {
		return finalizeFromHeuristics(heuristicResults);
	}

	const batches: Array<{ indices: number[]; issues: any[] }> = [];
	for (let i = 0; i < ambiguous.length; i += LLM_BATCH) {
		const slice = ambiguous.slice(i, i + LLM_BATCH);
		batches.push({
			indices: slice.map((s) => s.idx),
			issues: slice.map((s) => toSmallIssue(s.issue)),
		});
	}

	const limit = pLimit(MAX_LL_CONCURRENCY);

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

	llmResults.forEach((res, batchIndex) => {
		const batch = batches[batchIndex];
		(res.issues || []).forEach((p: any, i: number) => {
			const globalIdx = batch.indices[i];
			if (!globalIdx && globalIdx !== 0) return;
			heuristicResults[globalIdx].final = mergeHeuristicAndLLM(
				heuristicResults[globalIdx].heuristic,
				p,
			);
		});
	});

	heuristicResults.forEach((r) => {
		if (!r.final) r.final = finalizeHeuristic(r.heuristic);
	});

	const processed = heuristicResults.map((r) =>
		toProcessedIssue(r.issue, r.final),
	);

	processed.sort(
		(a, b) => implementationOrderScore(a) - implementationOrderScore(b),
	);

	processed.forEach((p, i) => (p.implementationOrder = i + 1));

	return processed;
}

async function callLLMForBatch(openai: OpenAI, repo: any, issues: any[]) {
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

	const parsed = safeJsonExtract(content);

	return parsed && parsed.issues ? { issues: parsed.issues } : { issues: [] };
}
