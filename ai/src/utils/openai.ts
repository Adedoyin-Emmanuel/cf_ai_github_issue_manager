import OpenAI from "openai";

import { IssueManagementPayload, ProcessedIssue } from "../types";

export async function processIssues(payload: IssueManagementPayload, env: Env): Promise<ProcessedIssue[]> {
	try {
		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
		});

		const { issues } = payload;

		if (issues.length > 50) {
			const limitedIssues = issues
				.sort((a, b) => {
					if (a.state === "open" && b.state !== "open") return -1;
					if (a.state !== "open" && b.state === "open") return 1;
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
				})
				.slice(0, 50);

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
					content: `You are an expert GitHub issue manager. Your task is to:
1. Detect duplicate issues by analyzing titles, descriptions, and content
2. Group related issues that address similar problems
3. Categorize each issue by type (Bug, Feature, Enhancement, Chore, Documentation)
4. Assign priority levels (Critical, High, Medium, Low) based on impact and urgency
5. Provide reasoning for categorization and priority decisions
6. Suggest implementation order for efficient development workflow

Return your response as a valid JSON array of processed issues with the following structure:
{
  "issues": [
    {
      "issue_number": number,
      "title": string,
      "category": "Bug" | "Feature" | "Enhancement" | "Chore" | "Documentation",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "duplicates": number[],
      "reasoning": string,
      "implementationOrder": number
    }
  ]
}`,
				},
				{
					role: "user",
					content: prompt,
				},
			],
			max_tokens: 2000,
			temperature: 0.3,
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
	const batchSize = 10;

	const batches: IssueManagementPayload[] = [];
	for (let i = 0; i < issues.length; i += batchSize) {
		const batch = issues.slice(i, i + batchSize);
		batches.push({ repository, issues: batch });
	}

	const batchPromises = batches.map(async (batchPayload, index) => {
		console.log(`Starting batch ${index + 1}/${batches.length} (${batchPayload.issues.length} issues)`);

		const prompt = buildIssueManagementPrompt(batchPayload);

		try {
			const response = await openai.chat.completions.create({
				model: "gpt-4",
				messages: [
					{
						role: "system",
						content: `You are an expert GitHub issue manager. Your task is to:
1. Detect duplicate issues by analyzing titles, descriptions, and content
2. Group related issues that address similar problems
3. Categorize each issue by type (Bug, Feature, Enhancement, Chore, Documentation)
4. Assign priority levels (Critical, High, Medium, Low) based on impact and urgency
5. Provide reasoning for categorization and priority decisions
6. Suggest implementation order for efficient development workflow

Return your response as a valid JSON array of processed issues with the following structure:
{
  "issues": [
    {
      "issue_number": number,
      "title": string,
      "category": "Bug" | "Feature" | "Enhancement" | "Chore" | "Documentation",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "duplicates": number[],
      "reasoning": string,
      "implementationOrder": number
    }
  ]
}`,
					},
					{
						role: "user",
						content: prompt,
					},
				],
				max_tokens: 1000,
				temperature: 0.3,
			});

			if (response && response.choices && response.choices[0] && response.choices[0].message) {
				const content = response.choices[0].message.content;
				if (content) {
					try {
						const parsedResponse = JSON.parse(content);
						return parsedResponse.issues || [];
					} catch (parseError) {
						return [];
					}
				}
			}
			return [];
		} catch (error) {
			return [];
		}
	});

	const timeoutPromise = new Promise<ProcessedIssue[]>((_, reject) => {
		setTimeout(() => reject(new Error("Processing timeout - too many issues")), 60000);
	});

	const results = await Promise.race([Promise.all(batchPromises), timeoutPromise]);

	const allIssues = results.flat();

	if (allIssues.length === 0) {
		console.log("No issues processed successfully. This might be due to API rate limits or errors.");
		throw new Error("Failed to process any issues. Please try again with a smaller repository or check API limits.");
	}

	return allIssues;
}

function buildIssueManagementPrompt(payload: IssueManagementPayload): string {
	const { repository, issues } = payload;

	const prioritizedIssues = issues
		.sort((a, b) => {
			if (a.state === "open" && b.state !== "open") return -1;
			if (a.state !== "open" && b.state === "open") return 1;
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		})
		.slice(0, 20);

	let prompt = `Please process the following GitHub repository issues for management:

REPOSITORY INFORMATION:
- Name: ${repository.name}
- Owner: ${repository.owner}
- Description: ${repository.description}
- Stars: ${repository.stars}
- Forks: ${repository.forks}
- Open Issues: ${repository.openIssues}
- URL: ${repository.url}

ISSUES TO PROCESS (${prioritizedIssues.length} of ${issues.length} total):
`;

	prioritizedIssues.forEach((issue, index) => {
		prompt += `
${index + 1}. Issue #${issue.issue_number}: ${issue.title}
   - State: ${issue.state}
   - Author: ${issue.author}
   - Created: ${issue.created_at}
   - Labels: ${issue.labels.join(", ") || "None"}
   - Body: ${issue.body.substring(0, 200)}${issue.body.length > 200 ? "..." : ""}
   - URL: ${issue.url}
`;
	});

	prompt += `

Please analyze these issues and return a JSON response with the following for each issue:
1. **Category**: Classify as Bug, Feature, Enhancement, Chore, or Documentation
2. **Priority**: Assign Critical, High, Medium, or Low based on impact and urgency
3. **Duplicates**: List issue numbers that are duplicates or very similar
4. **Reasoning**: Brief explanation for the categorization and priority
5. **Implementation Order**: Suggested order for addressing (1 = highest priority)

Focus on:
- Detecting duplicate issues by analyzing titles and content
- Grouping related issues that address similar problems
- Prioritizing based on user impact, system stability, and business value
- Considering the repository's context and description

Return only valid JSON with the structure specified in the system message.`;

	return prompt;
}
