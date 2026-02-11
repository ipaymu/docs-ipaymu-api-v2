import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(lang: string): BaseLayoutProps {
  return {
    links: [
      {
        text: "Beranda",
        url: `/${lang}`,
        active: "nested-url",
      },
      {
        text: "Dokumentasi",
        url: `/${lang}/docs`,
        active: "nested-url",
      },
      {
        text: "Verifikasi",
        url: `/${lang}/verification`,
        active: "nested-url",
      },
      {
        text: "API Reference",
        url: `/${lang}/docs/api`,
        active: "nested-url",
      },
      {
        text: "Tutorial",
        url: `/${lang}/docs/tutorial`,
        active: "nested-url",
      },
      {
        text: "Support",
        url: `/${lang}/docs/support`,
        active: "nested-url",
      },
    ],
  };
}
