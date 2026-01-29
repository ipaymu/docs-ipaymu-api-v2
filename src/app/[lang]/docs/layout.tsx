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
    <div className="min-h-screen">
      {/* Custom Horizontal Navbar */}
      <HorizontalNavbar lang={lang} />
      
      {/* Fumadocs DocsLayout */}
      <DocsLayout
        tree={source.pageTree[lang]}
        {...{
          ...baseOptions(lang),
          nav: undefined, // Disable default nav karena kita pakai custom navbar
        }}
        // Enable i18n compatibility mode
        // This will assume the first path segment is the locale (e.g. /id/docs/...)
        i18n
      >
        {children}
      </DocsLayout>
    </div>
  );
}
