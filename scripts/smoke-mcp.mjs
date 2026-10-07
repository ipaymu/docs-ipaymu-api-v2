import assert from "node:assert/strict";

const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3030";
let id = 0;
const metadata = {
  "io.modelcontextprotocol/protocolVersion": "2026-07-28",
  "io.modelcontextprotocol/clientInfo": { name: "ipaymu-ci", version: "1.0.0" },
  "io.modelcontextprotocol/clientCapabilities": {},
};

async function rpc(method, params = {}) {
  const response = await fetch(`${base}/api/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2026-07-28",
      "Mcp-Method": method,
      ...(params.name ? { "Mcp-Name": params.name } : {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: ++id,
      method,
      params: { ...params, _meta: metadata },
    }),
  });
  assert.equal(response.status, 200, await response.clone().text());
  const message = await response.json();
  assert.equal(message.error, undefined, JSON.stringify(message.error));
  return message.result;
}

const health = await fetch(`${base}/healthz`);
assert.equal(health.status, 200);
const discovery = await rpc("server/discover");
assert.ok(discovery.supportedVersions.includes("2026-07-28"));
const legacy = await fetch(`${base}/api/mcp`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: ++id,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "ipaymu-legacy-check", version: "1.0.0" },
    },
  }),
});
assert.equal(legacy.status, 200);
const legacyText = await legacy.text();
const legacyMessage = JSON.parse(
  legacy.headers.get("content-type")?.includes("text/event-stream")
    ? legacyText
        .split("\n")
        .find((line) => line.startsWith("data: "))
        .slice(6)
    : legacyText,
);
assert.equal(legacyMessage.result.protocolVersion, "2025-03-26");
assert.equal(legacyMessage.result.serverInfo.name, "ipaymu-docs");
const { tools } = await rpc("tools/list");
assert.deepEqual(tools.map((tool) => tool.name).sort(), [
  "getPage",
  "searchDocumentation",
]);
for (const language of ["id", "en"]) {
  const search = await rpc("tools/call", {
    name: "searchDocumentation",
    arguments: { query: "signature", language },
  });
  const pages = JSON.parse(search.content[0].text);
  assert.ok(pages.length > 0);
  assert.ok(
    pages.every((page) =>
      new URL(page.url).pathname.startsWith(`/${language}/`),
    ),
  );
  const page = await rpc("tools/call", {
    name: "getPage",
    arguments: { url: pages[0].url },
  });
  assert.notEqual(page.isError, true);
  assert.ok(
    page.content[0].text.includes("signature") ||
      page.content[0].text.includes("Signature"),
  );
}
for (const url of [
  "/id/close-api/transfer-va",
  "https://example.com/id/docs/signature",
]) {
  const result = await rpc("tools/call", {
    name: "getPage",
    arguments: { url },
  });
  assert.equal(result.isError, true);
}
const rejected = await fetch(`${base}/api/mcp`, {
  method: "POST",
  headers: {
    Origin: "https://example.com",
    "Content-Type": "application/json",
  },
  body: "{}",
});
assert.equal(rejected.status, 403);
assert.equal((await fetch(`${base}/api/mcp`)).status, 405);
console.log(
  "MCP smoke check passed: modern discovery, legacy initialization, tools, ID/EN search, page content, private/external exclusion, Origin, GET.",
);
