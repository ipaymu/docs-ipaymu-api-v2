import { getPageImage, verificationSource } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";

// 1. IMPORT KOMPONEN UI FUMADOCS
import { File, Folder, Files } from "fumadocs-ui/components/files";

import { Card, Cards } from "@/components/mdx/card";
import { Callout } from "@/components/mdx/callout";
import { Step, Steps } from "@/components/mdx/steps";
import { Accordion, Accordions } from "@/components/mdx/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/mdx/tabs";

// 2. IMPORT ICON YANG ERROR DARI LUCIDE-REACT
import { CpuIcon, PanelsTopLeft, Database, Terminal } from "lucide-react";

// 3. BUAT DUMMY COMPONENT UNTUK FEEDBACKBLOCK (Supaya tidak error)
const FeedbackBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="my-4 p-4 border rounded-lg bg-secondary/10">{children}</div>
);

// 4. MAPPING UNTUK CodeBlockTabs (Karena di MDX Anda pakai nama lama/custom)
const CodeBlockTabs = Tabs;
const CodeBlockTabsList = TabsList;
const CodeBlockTabsTrigger = TabsTrigger;
const CodeBlockTab = TabsContent;

export default async function VerificationPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  const page = verificationSource.getPage([], lang); // Empty array for index page

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
              a: createRelativeLink(verificationSource, page),
            }),
            // --- DAFTARKAN SEMUA DISINI ---
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
            // Icon
            CpuIcon,
            PanelsTopLeft,
            Database,
            Terminal,
            // Custom/Legacy mapping
            FeedbackBlock,
            CodeBlockTabs,
            CodeBlockTabsList,
            CodeBlockTabsTrigger,
            CodeBlockTab,
            // -----------------------------
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
    lang: p.lang || "id", // Ensure lang is always present
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await props.params;
  const page = verificationSource.getPage([], lang);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
