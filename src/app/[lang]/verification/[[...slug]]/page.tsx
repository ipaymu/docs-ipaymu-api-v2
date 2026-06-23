import { getPageImage, verificationSource } from "@/lib/source";
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
import { PostmanButton } from "@/components/mdx/postman-button";
import { AIChatButton } from "@/components/mdx/ai-chat-button";

const FeedbackBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="my-4 p-4 border rounded-lg bg-secondary/10">{children}</div>
);

const CodeBlockTabs = Tabs;
const CodeBlockTabsList = TabsList;
const CodeBlockTabsTrigger = TabsTrigger;
const CodeBlockTab = TabsContent;

export default async function VerificationPage(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}) {
  const params = await props.params;
  const page = verificationSource.getPage(params.slug, params.lang);

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
      <div className="flex flex-col md:flex-row md:items-start md:justify-between pt-12 gap-4 mb-4">
        <DocsTitle className="mb-0">{page.data.title}</DocsTitle>
        <div className="flex items-center gap-2 shrink-0">
          <AIChatButton />
        </div>
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...getMDXComponents({
              a: createRelativeLink(verificationSource, page),
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
  const params = await verificationSource.generateParams();
  return params.map((p) => ({
    ...p,
    lang: p.lang || "id",
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = verificationSource.getPage(params.slug, params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
