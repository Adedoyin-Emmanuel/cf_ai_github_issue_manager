export const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export function handleOptionsRequest(): Response {
	return new Response(null, {
		status: 200,
		headers: corsHeaders,
	});
}

export function handleMethodNotAllowed(): Response {
	return new Response(
		JSON.stringify({
			success: false,
			error: "Method not allowed. Only POST requests are supported.",
			timestamp: new Date().toISOString(),
		}),
		{
			status: 405,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders,
			},
		},
	);
}
