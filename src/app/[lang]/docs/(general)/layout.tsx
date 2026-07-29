import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { type ReactNode } from "react";
import { HorizontalNavbar } from "@/components/layout/horizontal-navbar";

export function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <DocsLayout
      tree={source.pageTree[lang]}
      {...baseOptions(lang, "docs")}
      nav={{
        ...baseOptions(lang, "docs").nav,
        component: <HorizontalNavbar lang={lang} current="docs" />,
      }}
      // Enable i18n compatibility mode
      i18n
    >
      {children}
    </DocsLayout>
  );
}
