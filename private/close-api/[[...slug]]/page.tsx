// NOTE: This route is intentionally staged OUTSIDE of `src/app`.
// It is copied into `src/app/[lang]/close-api/` only by the private build
// (`npm run build:private` → scripts/with-close-api.mjs). See INTEGRATION-close-api.md.
import { getPageImage, closeApiSource } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";

import { File, Folder, Files } from "fumadocs-ui/components/files";

import { Card, Cards } from "@/components/mdx/card";
import { Callout } from "@/components/mdx/callout";
import { Step, Steps } from "@/components/mdx/steps";
import { Accordion, Accordions } from "@/components/mdx/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/mdx/tabs";

import { CpuIcon, PanelsTopLeft, Database, Terminal } from "lucide-react";

const FeedbackBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="my-4 p-4 border rounded-lg bg-secondary/10">{children}</div>
);

const CodeBlockTabs = Tabs;
const CodeBlockTabsList = TabsList;
const CodeBlockTabsTrigger = TabsTrigger;
const CodeBlockTab = TabsContent;

export default async function Page(props: { params: Promise<{ slug?: string[]; lang: string }> }) {
  const params = await props.params;
  const page = closeApiSource.getPage(params.slug, params.lang);

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: "clerk",
        single: false,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...getMDXComponents({
              a: createRelativeLink(closeApiSource, page),
            }),
            Accordion,
            Accordions,
            Callout,
            Card,
            Cards,
            Step,
            Steps,
            File,
            Folder,
            Files,
            CpuIcon,
            PanelsTopLeft,
            Database,
            Terminal,
            FeedbackBlock,
            CodeBlockTabs,
            CodeBlockTabsList,
            CodeBlockTabsTrigger,
            CodeBlockTab,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  // Fail-safe: only emit Close API pages in the private build. If this route is
  // ever present during a public build (e.g. a leftover copy), returning [] makes
  // `output: export` fail loudly instead of silently publishing private docs.
  if (!process.env.PRIVATE_BUILD) return [];

  const params = await closeApiSource.generateParams();
  return params.map((p) => ({
    ...p,
    lang: p.lang || "id",
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = closeApiSource.getPage(params.slug, params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    robots: { index: false, follow: false },
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
