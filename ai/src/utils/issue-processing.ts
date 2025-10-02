import type { ProcessedIssue } from "../types";

export function normalizeTitle(title: string) {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export function toSmallIssue(issue: any) {
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

export type HeuristicResult = {
	category:
		| "Bug"
		| "Chore"
		| "unknown"
		| "Feature"
		| "Enhancement"
		| "Documentation";

	reasoning?: string;
	confidence: number;
	duplicates: number[];
	priority: "Critical" | "High" | "Medium" | "Low";
};

export function heuristicClassify(issue: any): HeuristicResult {
	const title = (issue.title || "").toLowerCase();
	const labels = ((issue.labels || []) as string[]).map((s) => s.toLowerCase());
	const body = (issue.body || "").toLowerCase();

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
	const defaultPriority =
		labelToPriority(labels) || titlePriorityGuess(title) || "Medium";
	return {
		category: "unknown",
		priority: defaultPriority,
		confidence: 0.5,
		duplicates: [],
	};
}

export function labelToPriority(
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

export function titlePriorityGuess(title: string) {
	if (/\b(blocker|urgent|hotfix|critical)\b/.test(title)) return "Critical";
	if (/\b(high|major|important)\b/.test(title)) return "High";
	if (/\b(minor|low)\b/.test(title)) return "Low";
	return undefined;
}

export function finalizeFromHeuristics(heuristics: any[]) {
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

export function finalizeHeuristic(h: HeuristicResult) {
	return {
		category: h.category === "unknown" ? "Enhancement" : h.category,
		priority: h.priority,
		duplicates: h.duplicates || [],
		reasoning: "Auto-classified using labels/title heuristics",
		implementationOrder: 0,
	};
}

export function mergeHeuristicAndLLM(h: HeuristicResult, llm: any) {
	if (!llm || Object.keys(llm).length === 0) return finalizeHeuristic(h);

	return {
		category:
			llm.category || (h.category === "unknown" ? "Enhancement" : h.category),
		priority: llm.priority || h.priority,
		duplicates: llm.duplicates || h.duplicates || [],
		reasoning: llm.reasoning || h.reasoning || "Combined heuristic + LLM",
		implementationOrder: 0,
	};
}

export function toProcessedIssue(issue: any, final: any): ProcessedIssue {
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

export function implementationOrderScore(p: ProcessedIssue) {
	const prioScore = priorityToScore(p.priority);
	const openScore = p.priority ? 0 : 1;
	return prioScore * 1000 + openScore;
}

export function priorityToScore(p: string | undefined) {
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

export function safeJsonExtract(content: string) {
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
		return null;
	}
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error("Timeout")), ms),
		),
	]);
}
