import { createMcpHandler } from "@modelcontextprotocol/server";
import { createDocsMcpServer } from "@/lib/mcp-docs";

export const runtime = "nodejs";

const handler = createMcpHandler(createDocsMcpServer, {
  legacy: "stateless",
  responseMode: "json",
  maxRequestBodySize: 64 * 1024,
});

// Only POST is exposed. Static export cannot provide a functioning MCP server.
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = (process.env.MCP_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }
  if (origin && !allowedOrigins.includes(origin)) {
    return Response.json({ error: "Origin not allowed" }, { status: 403 });
  }
  const response = await handler.fetch(request);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
