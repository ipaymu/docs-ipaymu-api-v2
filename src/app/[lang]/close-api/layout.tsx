// Layout Close API sengaja hanya meneruskan children.
//
// DocsLayout dirender di dalam cangkang klien (close-api-shell.tsx), karena
// daftar menu sidebar baru diketahui SETELAH core memverifikasi token dan
// mengembalikan produk yang boleh dilihat merchant. Tree-nya dinamis, jadi
// tidak bisa dibangun di server.
import type { ReactNode } from "react";

export function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
