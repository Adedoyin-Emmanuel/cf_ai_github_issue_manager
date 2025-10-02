import {
	validatePayload,
	createErrorResponse,
	createSuccessResponse,
} from "./utils/validation";
import { processIssues } from "./utils/openai";
import { IssueManagementPayload, IssueManagementResponse } from "./types";
import { handleOptionsRequest, handleMethodNotAllowed } from "./utils/cors";

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		if (request.method === "OPTIONS") {
			return handleOptionsRequest();
		}

		if (request.method !== "POST") {
			return handleMethodNotAllowed();
		}

		try {
			const payload: IssueManagementPayload = await request.json();

			const validationError = validatePayload(payload);

			if (validationError) {
				return createErrorResponse(validationError.error, 400);
			}

			console.log(`Open AI API key: ${env.OPENAI_API_KEY}`);

			const processedIssues = await processIssues(payload, env);

			const response: IssueManagementResponse = {
				success: true,
				repository: payload.repository,
				issues: processedIssues,
				timestamp: new Date().toISOString(),
			};

			return createSuccessResponse(response);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Internal server error";
			return createErrorResponse(errorMessage);
		}
	},
};
