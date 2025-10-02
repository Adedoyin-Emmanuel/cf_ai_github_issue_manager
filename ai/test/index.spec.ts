import {
	env,
	SELF,
	createExecutionContext,
	waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("AI Worker basic routing", () => {
	it("rejects GET with 405 and JSON error (unit style)", async () => {
		const request = new IncomingRequest("http://example.com");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(405);
		const body = (await response.json()) as any;
		expect(body.success).toBe(false);
		expect(body.error).toContain("Method not allowed");
	});

	it("rejects GET with 405 and JSON error (integration style)", async () => {
		const response = await SELF.fetch("https://example.com");
		expect(response.status).toBe(405);
		const body = (await response.json()) as any;
		expect(body.success).toBe(false);
		expect(body.error).toContain("Method not allowed");
	});
});
