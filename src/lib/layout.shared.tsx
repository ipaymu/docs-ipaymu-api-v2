import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(lang: string): BaseLayoutProps {
  const t = {
    id: {
      home: "Beranda",
      docs: "Dokumentasi",
      verification: "Verifikasi",
      plugin: "Plugin",
      closeApi: "Close API",
    },
    en: {
      home: "Home",
      docs: "Documentation",
      verification: "Verification",
      plugin: "Plugin",
      closeApi: "Close API",
    },
  }[lang] || {
    home: "Beranda",
    docs: "Dokumentasi",
    verification: "Verifikasi",
    plugin: "Plugin",
    closeApi: "Close API",
  };

  const links: BaseLayoutProps["links"] = [
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
  ];

  // The Close API section is private — only surface it in the private build.
  if (process.env.NEXT_PUBLIC_PRIVATE_BUILD === "1") {
    links.push({
      text: t.closeApi,
      url: `/${lang}/close-api`,
      active: "nested-url",
    });
  }

  return { links };
}
