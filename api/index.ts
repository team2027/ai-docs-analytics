import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  TINYBIRD_TOKEN: string;
  TINYBIRD_DATASOURCE?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

app.post("/track", async (c) => {
  const body = await c.req.json();

  const event = {
    ts: body.ts || new Date().toISOString().slice(0, 19).replace("T", " "),
    host: body.host || "unknown",
    path: body.path || "/",
    accept: body.accept?.slice(0, 500) || "",
    ua: body.ua?.slice(0, 500) || "",
    country: body.country || "unknown",
    city: body.city || "unknown",
    agent_type: body.agent_type || "unknown-ai",
    is_ai: body.is_ai ?? 1,
  };

  const datasource = c.env.TINYBIRD_DATASOURCE || "ai_agent_events";
  const endpoint = `https://api.us-east.aws.tinybird.co/v0/events?name=${datasource}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.env.TINYBIRD_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    console.error("tinybird error:", await response.text());
    return c.json({ error: "failed to track" }, 500);
  }

  return c.json({ ok: true });
});

app.get("/health", (c) => c.json({ ok: true }));

export default app;
