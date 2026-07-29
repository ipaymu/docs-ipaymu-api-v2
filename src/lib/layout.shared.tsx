import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Section navigasi yang sedang dibuka.
 *
 * Status aktif ditentukan oleh layout, bukan ditebak dari pathname. Alasannya:
 * URL antar section saling bersarang — `/id/docs/verification` diawali
 * `/id/docs`, dan `/id` mengawali semua halaman. Pencocokan berbasis prefix
 * (`nested-url`) membuat beberapa menu menyala sekaligus: membuka Verifikasi
 * ikut menyalakan Beranda dan Dokumentasi.
 *
 * Tiap section punya layout sendiri, jadi layout sudah tahu section-nya secara
 * statis dan bisa menyatakannya langsung.
 */
export type NavSection = "home" | "docs" | "verification" | "plugins" | "close-api";

export function baseOptions(lang: string, current?: NavSection): BaseLayoutProps {
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

  // Hanya section yang sedang dibuka yang boleh aktif; sisanya dimatikan
  // supaya prefix URL yang bersarang tidak menyalakan menu lain.
  const item = (section: NavSection, text: string, url: string) => ({
    text,
    url,
    active: (current === section ? "nested-url" : "none") as "nested-url" | "none",
  });

  const links: BaseLayoutProps["links"] = [
    item("home", t.home, `/${lang}`),
    item("docs", t.docs, `/${lang}/docs`),
    item("verification", t.verification, `/${lang}/docs/verification`),
    item("plugins", t.plugin, `/${lang}/docs-plugins`),
  ];

  // The Close API section is private — only surface it in the private build.
  if (process.env.NEXT_PUBLIC_PRIVATE_BUILD === "1") {
    links.push(item("close-api", t.closeApi, `/${lang}/close-api`));
  }

  return { links };
}
