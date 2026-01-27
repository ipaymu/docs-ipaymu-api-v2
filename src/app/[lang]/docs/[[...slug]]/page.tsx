import { getPageImage, source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

// 1. IMPORT KOMPONEN UI FUMADOCS
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'; // Perhatikan: di MDX Anda tertulis CodeBlockTabs, tapi kita mapping ke Tabs
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { File, Folder, Files } from 'fumadocs-ui/components/files';

// 2. IMPORT ICON YANG ERROR DARI LUCIDE-REACT
import { CpuIcon, PanelsTopLeft, Database, Terminal } from 'lucide-react';

// 3. BUAT DUMMY COMPONENT UNTUK FEEDBACKBLOCK (Supaya tidak error)
const FeedbackBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="my-4 p-4 border rounded-lg bg-secondary/10">
    {children}
  </div>
);

// 4. MAPPING UNTUK CodeBlockTabs (Karena di MDX Anda pakai nama lama/custom)
const CodeBlockTabs = Tabs;
const CodeBlockTabsList = ({ children }: any) => <>{children}</>;
const CodeBlockTabsTrigger = Tab;
const CodeBlockTab = ({ children }: any) => <>{children}</>;


export default async function Page(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
        single: false
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...getMDXComponents({
              a: createRelativeLink(source, page),
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
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}