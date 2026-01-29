import { pluginsSource } from "@/lib/source";
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
      tree={pluginsSource.pageTree[lang]}
      {...baseOptions(lang)}
      nav={{
        ...baseOptions(lang).nav,
        component: <HorizontalNavbar lang={lang} />,
      }}
      // Enable i18n compatibility mode
      i18n
    >
      {children}
    </DocsLayout>
  );
}
