import { Hono } from "hono";
import { cors } from "hono/cors";
import { fromHono } from "chanfana";

import { analyzeRepo } from "./endpoints/analyze";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return origin || "*";
      }
      return null;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

const baseUrl = "/v1";

const openapi = fromHono(app, {
  docs_url: "/",
});

app.get(`${baseUrl}`, (c) => c.json({ message: "API is up and running" }));

openapi.post(`${baseUrl}/analyze-repo`, analyzeRepo);

export default app;
