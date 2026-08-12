// CATATAN: rute ini sengaja berada DI LUAR `src/app`.
//
// Ia bukan halaman yang dilayani ke pengunjung. Fungsinya hanya sebagai perender
// MDX untuk membuat artefak konten yang dikirim ke ipaymu-core: skrip
// `npm run build:close-api-content` men-stage-nya sementara ke
// `src/app/[lang]/close-api-export/`, membangun, mengambil HTML-nya, lalu
// menghapus rute DAN hasil build-nya.
//
// Halaman yang benar-benar dilayani adalah cangkang publik di
// `src/app/[lang]/close-api/` — cangkang itu tidak memuat isi dokumentasi.
// Lihat PLAN-close-api-docs.md.
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
      {...baseOptions(lang, "close-api")}
      nav={{
        ...baseOptions(lang, "close-api").nav,
        component: <HorizontalNavbar lang={lang} current="close-api" />,
      }}
      // Enable i18n compatibility mode
      i18n
    >
      {children}
    </DocsLayout>
  );
}
