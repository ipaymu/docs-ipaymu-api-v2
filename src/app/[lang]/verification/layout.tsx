import { verificationSource } from "@/lib/source";
import { type ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";


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
      {...baseOptions(lang)}
      // Enable i18n compatibility mode
      i18n
      sidebar={{
        enabled: true,
      }}
    >
      {children}
    </DocsLayout>
  );
}
