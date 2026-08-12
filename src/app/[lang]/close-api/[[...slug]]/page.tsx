// Halaman Close API — hanya CANGKANG. Tidak ada isi dokumentasi di sini;
// semuanya diambil dari ipaymu-core setelah token diverifikasi di sana.
//
// Rute per-slug (bukan satu halaman dengan fragment) supaya fitur bawaan
// fumadocs — penanda menu aktif dan navigasi Sebelumnya/Berikutnya — bekerja.
// Keduanya ditentukan dari `usePathname()`, jadi tiap halaman butuh pathname
// sendiri. Berkas statis yang dihasilkan hanya berisi cangkang kosong.
import type { Metadata } from "next";
import { CloseApiShell } from "@/components/close-api/close-api-shell";
import { CLOSE_API_SLUGS } from "@/lib/close-api-slugs";

export function generateStaticParams() {
  const langs = ["id", "en"];
  return langs.flatMap((lang) => [
    { lang, slug: [] as string[] }, // /<lang>/close-api  → ikhtisar
    ...CLOSE_API_SLUGS.map((slug) => ({ lang, slug: [slug] })),
  ]);
}

export const metadata: Metadata = {
  title: "Close API iPaymu",
  description: "Dokumentasi Close API iPaymu — hanya untuk merchant yang memiliki akses.",
  // Halaman privat secara isi: jangan diindeks mesin pencari.
  robots: { index: false, follow: false },
};

export default async function Page(props: {
  params: Promise<{ lang: string; slug?: string[] }>;
}) {
  const { lang, slug } = await props.params;
  return <CloseApiShell lang={lang} slug={slug?.[0] ?? ""} />;
}
