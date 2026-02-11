import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(lang: string): BaseLayoutProps {
  const t = {
    id: {
      home: "Beranda",
      docs: "Dokumentasi",
      verification: "Verifikasi",
      plugin: "Plugin",
    },
    en: {
      home: "Home",
      docs: "Documentation",
      verification: "Verification",
      plugin: "Plugin",
    },
  }[lang] || {
    home: "Beranda",
    docs: "Dokumentasi",
    verification: "Verifikasi",
    plugin: "Plugin",
  };

  return {
    links: [
      {
        text: t.home,
        url: `/${lang}`,
        active: "nested-url",
      },
      {
        text: t.docs,
        url: `/${lang}/docs`,
        active: "nested-url",
      },
      {
        text: t.verification,
        url: `/${lang}/docs/verification`,
        active: "nested-url",
      },
      {
        text: t.plugin,
        url: `/${lang}/docs-plugins`,
        active: "nested-url",
      },
    ],
  };
}
