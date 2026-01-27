import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { type ReactNode } from 'react';

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
      {...baseOptions}
      // Enable i18n compatibility mode
      // This will assume the first path segment is the locale (e.g. /id/docs/...)
      i18n
    >
      {children}
    </DocsLayout>
  );
}
