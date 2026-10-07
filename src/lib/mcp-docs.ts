import {
  McpServer,
  type McpRequestContext,
} from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import { source, pluginsSource, verificationSource } from "@/lib/source";
import { withBasePath } from "@/lib/utils";

// Explicit allowlist: Close API is private and must never be exposed by MCP.
async function loadPublicPages() {
  const pages = [source, pluginsSource, verificationSource].flatMap((loader) =>
    loader.getPages(),
  );
  return Promise.all(
    pages.map(async (page) => ({
      path: withBasePath(page.url),
      language: page.locale ?? "id",
      title: page.data.title,
      description: page.data.description ?? "",
      content: await page.data.getText("processed"),
    })),
  );
}

let publicPages: ReturnType<typeof loadPublicPages> | undefined;
function getPublicPages() {
  publicPages ??= loadPublicPages().catch((error) => {
    publicPages = undefined;
    throw error;
  });
  return publicPages;
}

const readOnly = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

export function createDocsMcpServer(context: McpRequestContext) {
  const origin = new URL(
    process.env.DOCS_PUBLIC_URL ||
      context.requestInfo?.url ||
      "http://localhost:3000",
  ).origin;
  const server = new McpServer({
    name: "ipaymu-docs",
    title: "iPaymu Documentation",
    version: "1.0.0",
  });

  server.registerTool(
    "searchDocumentation",
    {
      title: "Search iPaymu documentation",
      description:
        "Search public iPaymu API, plugin, and verification guides. Returns matching excerpts and page URLs; use getPage for the full content.",
      inputSchema: z.object({
        query: z.string().trim().min(1).max(500),
        language: z.enum(["id", "en"]).default("id"),
        limit: z.number().int().min(1).max(10).default(5),
      }),
      annotations: readOnly,
    },
    async ({ query, language, limit }) => {
      const terms = [...new Set(query.toLowerCase().split(/\s+/))];
      const matches = (await getPublicPages())
        .filter((page) => page.language === language)
        .map((page) => {
          const title = page.title.toLowerCase();
          const body = `${page.description}\n${page.content}`.toLowerCase();
          const score = terms.reduce(
            (sum, term) =>
              sum +
              (title.includes(term) ? 5 : 0) +
              (body.includes(term) ? 1 : 0),
            0,
          );
          const position = Math.max(
            0,
            page.content.toLowerCase().indexOf(terms[0]) - 120,
          );
          return {
            title: page.title,
            url: new URL(page.path, origin).href,
            excerpt: page.content.slice(position, position + 1000),
            score,
          };
        })
        .filter((page) => page.score > 0)
        .sort((a, b) => b.score - a.score || a.url.localeCompare(b.url))
        .slice(0, limit);
      return {
        resultType: "complete",
        content: [{ type: "text", text: JSON.stringify(matches) }],
      };
    },
  );

  server.registerTool(
    "getPage",
    {
      title: "Read an iPaymu documentation page",
      description:
        "Read a full public documentation page using its URL or pathname from searchDocumentation. Does not fetch external websites or private Close API documentation.",
      inputSchema: z.object({ url: z.string().trim().min(1).max(2048) }),
      annotations: readOnly,
    },
    async ({ url }) => {
      let target: URL;
      try {
        target = new URL(url, origin);
      } catch {
        return {
          resultType: "complete",
          isError: true,
          content: [{ type: "text", text: "Invalid documentation URL." }],
        };
      }
      const page =
        target.origin === origin
          ? (await getPublicPages()).find(
              (page) =>
                page.path.replace(/\/$/, "") ===
                target.pathname.replace(/\/$/, ""),
            )
          : undefined;
      if (!page) {
        return {
          resultType: "complete",
          isError: true,
          content: [
            {
              type: "text",
              text: "Public documentation page not found. Use searchDocumentation to find a valid URL.",
            },
          ],
        };
      }
      return {
        resultType: "complete",
        content: [
          {
            type: "text",
            text: `# ${page.title}\n\nSource: ${new URL(page.path, origin).href}\n\n${page.content}`,
          },
        ],
      };
    },
  );

  return server;
}
