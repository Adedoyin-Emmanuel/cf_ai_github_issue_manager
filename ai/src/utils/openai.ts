import OpenAI from "openai";

import { IssueManagementPayload, ProcessedIssue } from "../types";

export async function processIssues(payload: IssueManagementPayload, env: Env): Promise<ProcessedIssue[]> {
	try {
		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
		});

		const { issues } = payload;

		console.log(`Processing ${issues.length} issues`);

		if (issues.length > 100) {
			const limitedIssues = issues
				.sort((a, b) => {
					if (a.state === "open" && b.state !== "open") return -1;
					if (a.state !== "open" && b.state === "open") return 1;
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
				})
				.slice(0, 100);

			const limitedPayload = { ...payload, issues: limitedIssues };
			return await processIssuesInBatches(limitedPayload, openai);
		}

		if (issues.length > 20) {
			return await processIssuesInBatches(payload, openai);
		}

		const prompt = buildIssueManagementPrompt(payload);

		const response = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content: `You are an expert GitHub issue manager. Analyze issues and return JSON with:
- category: Bug|Feature|Enhancement|Chore|Documentation
- priority: Critical|High|Medium|Low
- duplicates: [issue_numbers]
- reasoning: brief explanation
- implementationOrder: number

Return valid JSON array: {"issues": [{"issue_number": number, "title": string, "category": string, "priority": string, "duplicates": number[], "reasoning": string, "implementationOrder": number}]}`,
				},
				{
					role: "user",
					content: prompt,
				},
			],
			max_tokens: 1500, // Reduced for faster processing
			temperature: 0.2, // Lower temperature for more consistent results
		});

		if (response && response.choices && response.choices[0] && response.choices[0].message) {
			const content = response.choices[0].message.content;
			if (!content) {
				throw new Error("No response content from GPT-4");
			}

			const parsedResponse = JSON.parse(content);
			return parsedResponse.issues || [];
		} else {
			throw new Error("Invalid response format from GPT-4");
		}
	} catch (error) {
		throw new Error(`Failed to process issues: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
}

async function processIssuesInBatches(payload: IssueManagementPayload, openai: OpenAI): Promise<ProcessedIssue[]> {
	const { repository, issues } = payload;
	const batchSize = 10; // Reduced batch size for better reliability

	const batches: IssueManagementPayload[] = [];
	for (let i = 0; i < issues.length; i += batchSize) {
		const batch = issues.slice(i, i + batchSize);
		batches.push({ repository, issues: batch });
	}

	const batchPromises = batches.map(async (batchPayload, index) => {
		console.log(`Starting batch ${index + 1}/${batches.length} (${batchPayload.issues.length} issues)`);

		const prompt = buildIssueManagementPrompt(batchPayload);

		// Retry logic for failed batches
		for (let attempt = 1; attempt <= 2; attempt++) {
			try {
				const response = await openai.chat.completions.create({
					model: "gpt-4",
					messages: [
						{
							role: "system",
							content: `You are an expert GitHub issue manager. Analyze issues and return JSON with:
- category: Bug|Feature|Enhancement|Chore|Documentation
- priority: Critical|High|Medium|Low
- duplicates: [issue_numbers]
- reasoning: brief explanation
- implementationOrder: number

Return valid JSON array: {"issues": [{"issue_number": number, "title": string, "category": string, "priority": string, "duplicates": number[], "reasoning": string, "implementationOrder": number}]}`,
						},
						{
							role: "user",
							content: prompt,
						},
					],
					max_tokens: 600, // Further reduced for batch processing reliability
					temperature: 0.2, // Lower temperature for consistency
				});

				if (response && response.choices && response.choices[0] && response.choices[0].message) {
					const content = response.choices[0].message.content;
					if (content) {
						try {
							const parsedResponse = JSON.parse(content);
							console.log(`Batch ${index + 1} completed successfully with ${parsedResponse.issues?.length || 0} issues`);
							return parsedResponse.issues || [];
						} catch (parseError) {
							console.error(`Batch ${index + 1} JSON parse error (attempt ${attempt}):`, parseError);
							if (attempt === 2) return [];
							continue;
						}
					}
				}
				console.warn(`Batch ${index + 1} returned empty response (attempt ${attempt})`);
				if (attempt === 2) return [];
			} catch (error) {
				console.error(`Batch ${index + 1} failed (attempt ${attempt}):`, error);
				if (attempt === 2) return [];
				// Wait a bit before retry
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}
		return [];
	});

	const timeoutPromise = new Promise<ProcessedIssue[]>((_, reject) => {
		setTimeout(() => reject(new Error("Processing timeout - too many issues")), 60000); // Increased timeout for reliability
	});

	try {
		const results = await Promise.race([Promise.all(batchPromises), timeoutPromise]);
		const allIssues = results.flat();

		console.log(`Batch processing completed. Processed ${allIssues.length} issues from ${batches.length} batches`);

		if (allIssues.length === 0) {
			console.log("No issues processed successfully. This might be due to API rate limits or errors.");
			throw new Error("Failed to process any issues. Please try again with a smaller repository or check API limits.");
		}

		return allIssues;
	} catch (error) {
		console.error("Batch processing failed:", error);
		throw error;
	}
}

function buildIssueManagementPrompt(payload: IssueManagementPayload): string {
	const { repository, issues } = payload;

	// Use all issues since we're already capped at 100
	const prioritizedIssues = issues.sort((a, b) => {
		if (a.state === "open" && b.state !== "open") return -1;
		if (a.state !== "open" && b.state === "open") return 1;
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});

	let prompt = `Repo: ${repository.name} (${repository.owner}) - ${repository.description || "No description"}
Stats: ${repository.stars}⭐ ${repository.forks}🍴 ${repository.openIssues} issues

Issues (${prioritizedIssues.length}):
`;

	prioritizedIssues.forEach((issue, index) => {
		prompt += `${index + 1}. #${issue.issue_number}: ${issue.title}
   Author: ${issue.author} | Labels: ${issue.labels.join(", ") || "None"}
   Body: ${issue.body.substring(0, 80)}${issue.body.length > 80 ? "..." : ""}
`;
	});

	prompt += `
Return JSON with category, priority, duplicates, reasoning, implementationOrder.`;

	return prompt;
}
