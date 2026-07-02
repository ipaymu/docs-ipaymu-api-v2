import { z } from 'zod';
import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config';

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema.extend({
      postman: z.string().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const plugins = defineDocs({
  dir: 'content/docs-plugins',
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const verification = defineDocs({
  dir: 'content/verification',
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// Close API (private). Only emitted in the private build (PRIVATE_BUILD=1)
// and served behind ipaymu-core's access control. See INTEGRATION-close-api.md.
export const closeApi = defineDocs({
  dir: 'content/close-api',
  docs: {
    schema: frontmatterSchema.extend({
      postman: z.string().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

import remarkMermaid from "remark-mermaid-dataurl";

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      [
        remarkMermaid,
        {
          mermaidCli: {
            puppeteerConfigFile: {
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
            },
          },
        },
      ],
    ],
  },
});
