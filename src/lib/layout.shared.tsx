import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(lang: string): BaseLayoutProps {
  return {
    // Nav akan di-handle oleh HorizontalNavbar component
    // nav: {
    //   title: <img src="/img/ipaymu-header.webp" alt="iPaymu API V2" width={100} height={40} />,
    // },
    links: [
      {
        text: "Documentation",
        url: `/${lang}/docs`,
        active: "nested-url",
      },
      {
        text: "Verifikasi",
        url: `/${lang}/verification`,
        active: "nested-url",
      },
    ],
  };
}
