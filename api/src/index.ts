import { Hono } from "hono";
import { fromHono } from "chanfana";

const app = new Hono<{ Bindings: Env }>();

const openapi = fromHono(app, {
  docs_url: "/",
});

export default app;
