import { Hono } from "hono";
import { fromHono } from "chanfana";

import { analyzeRepo } from "./endpoints/analyze";

const app = new Hono<{ Bindings: Env }>();
const baseUrl = "/v1";

const openapi = fromHono(app, {
  docs_url: "/",
});

openapi.get(`${baseUrl}`, (c) => c.json({ message: "API is up and running" }));
openapi.post(`${baseUrl}/analyze-repo`, analyzeRepo);

export default app;
