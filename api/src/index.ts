import { Hono } from "hono";
import { cors } from "hono/cors";
import { fromHono } from "chanfana";

import { analyzeRepo } from "./endpoints/analyze";

const app = new Hono<{ Bindings: Env }>();

// Add CORS middleware
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow localhost for development
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return origin || "*";
      }
      // Add your production domains here when ready
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);
const baseUrl = "/v1";

const openapi = fromHono(app, {
  docs_url: "/",
});

openapi.get(`${baseUrl}`, (c) => c.json({ message: "API is up and running" }));
openapi.post(`${baseUrl}/analyze-repo`, analyzeRepo);

export default app;
