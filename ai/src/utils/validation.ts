import { IssueManagementPayload, ErrorResponse } from "../types";

export function validatePayload(
	payload: IssueManagementPayload,
): ErrorResponse | null {
	if (!payload.repository || !payload.issues) {
		return {
			success: false,
			error: "Invalid payload. Expected repository and issues fields.",
			timestamp: new Date().toISOString(),
		};
	}
	return null;
}

export function createErrorResponse(
	error: string,
	status: number = 500,
): Response {
	const errorResponse: ErrorResponse = {
		success: false,
		error,
		timestamp: new Date().toISOString(),
	};

	return new Response(JSON.stringify(errorResponse), {
		status,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}

export function createSuccessResponse(data: any): Response {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}
