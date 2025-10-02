/**
 * Test file for the AI Worker
 * Tests the repository analysis functionality
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import { IssueManagementPayload } from "../src/types";

vi.mock("openai", () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			chat: {
				completions: {
					create: vi.fn().mockResolvedValue({
						choices: [
							{
								message: {
									content:
										"Mock analysis for repository: mastra. This is a test analysis showing the repository has good health with active development.",
								},
							},
						],
					}),
				},
			},
		})),
	};
});

const mockEnv = {
	OPENAI_API_KEY: "test-api-key",
};

const samplePayload: IssueManagementPayload = {
	repository: {
		name: "mastra",
		owner: "mastra-ai",
		description:
			"The TypeScript AI agent framework. ⚡ Assistants, RAG, observability. Supports any LLM: GPT-4, Claude, Gemini, Llama.",
		stars: 16953,
		forks: 1129,
		openIssues: 325,
		url: "https://github.com/mastra-ai/mastra",
	},
	issues: [
		{
			issue_number: 8087,
			title: "chore(deps): update dependency @storybook/react-vite to ^9.1.8",
			state: "open",
			labels: [],
			author: "dane-ai-mastra[bot]",
			created_at: "2025-09-22T18:20:03Z",
			updated_at: "2025-09-30T00:36:37Z",
			body: "This PR contains the following updates:\n\n| Package | Type | Update | Change |\n|---|---|---|---|\n| [@storybook/react-vite](https://redirect.github.com/storybookjs/storybook/tree/next/code/frameworks/react-vite)",
			url: "https://github.com/mastra-ai/mastra/pull/8087",
		},
		{
			issue_number: 8281,
			title: "Agent with tools returns no text output",
			state: "open",
			labels: [],
			author: "Igorgro",
			created_at: "2025-09-29T23:19:26Z",
			updated_at: "2025-09-29T23:19:26Z",
			body: "I'm trying to build an agent that is able to call tool or workflow. I started with simple example from docs and encountered the following issue: while the agent perform the tool call it doesn't provide any text output.",
			url: "https://github.com/mastra-ai/mastra/issues/8281",
		},
	],
};

describe("AI Worker", () => {
	let worker: any;

	beforeAll(async () => {
		const workerModule = await import("../src/index");
		worker = workerModule.default;
	});

	it("should handle OPTIONS request for CORS", async () => {
		const request = new Request("https://example.com", { method: "OPTIONS" });
		const response = await worker.fetch(
			request,
			mockEnv,
			{} as ExecutionContext,
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
	});

	it("should reject non-POST requests", async () => {
		const request = new Request("https://example.com", { method: "GET" });
		const response = await worker.fetch(
			request,
			mockEnv,
			{} as ExecutionContext,
		);

		expect(response.status).toBe(405);

		const body = (await response.json()) as any;
		expect(body.success).toBe(false);
		expect(body.error).toContain("Method not allowed");
	});

	it("should reject invalid payload", async () => {
		const request = new Request("https://example.com", {
			method: "POST",
			body: JSON.stringify({ invalid: "payload" }),
			headers: { "Content-Type": "application/json" },
		});

		const response = await worker.fetch(
			request,
			mockEnv,
			{} as ExecutionContext,
		);

		expect(response.status).toBe(400);

		const body = (await response.json()) as any;
		expect(body.success).toBe(false);
		expect(body.error).toContain("Invalid payload");
	});

	it("should process valid payload and return processed issues", async () => {
		const request = new Request("https://example.com", {
			method: "POST",
			body: JSON.stringify(samplePayload),
			headers: { "Content-Type": "application/json" },
		});

		const response = await worker.fetch(
			request,
			mockEnv,
			{} as ExecutionContext,
		);

		expect(response.status).toBe(200);

		const body = (await response.json()) as any;
		expect(body.success).toBe(true);
		expect(Array.isArray(body.issues)).toBe(true);
		expect(body.issues.length).toBeGreaterThan(0);
		expect(body.repository?.name).toBe("mastra");
		expect(body.timestamp).toBeDefined();
	});

	it("should handle AI service errors gracefully", async () => {
		const errorEnv = {
			OPENAI_API_KEY: "invalid-key",
		};

		const request = new Request("https://example.com", {
			method: "POST",
			body: JSON.stringify(samplePayload),
			headers: { "Content-Type": "application/json" },
		});

		const response = await worker.fetch(
			request,
			errorEnv,
			{} as ExecutionContext,
		);

		expect(response.status).toBe(500);

		const body = await response.json();
		expect(body.success).toBe(false);
		expect(body.error).toContain("Failed to generate analysis");
	});
});
