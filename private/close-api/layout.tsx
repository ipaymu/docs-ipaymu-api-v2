// NOTE: This route is intentionally staged OUTSIDE of `src/app`.
// The public build (`npm run build`) must never contain the Close API, so the
// route is copied into `src/app/[lang]/close-api/` only by the private build
// (`npm run build:private` → scripts/with-close-api.mjs). See INTEGRATION-close-api.md.
import { closeApiSource } from "@/lib/source";
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
      tree={closeApiSource.pageTree[lang]}
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
