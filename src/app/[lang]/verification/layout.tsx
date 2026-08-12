import { verificationSource } from "@/lib/source";
import { type ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { HorizontalNavbar } from "@/components/layout/horizontal-navbar";
import { UnifiedSidebarFooter } from "@/components/layout/unified-sidebar-footer";

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
      tree={verificationSource.pageTree[lang]}
      {...baseOptions(lang, "verification")}
      i18n={false}
      themeSwitch={{ enabled: false }}
      nav={{
        ...baseOptions(lang, "verification").nav,
        component: <HorizontalNavbar lang={lang} current="verification" />,
      }}
      sidebar={{
        enabled: true,
        footer: <UnifiedSidebarFooter lang={lang} />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
