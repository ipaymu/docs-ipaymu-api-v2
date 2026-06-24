"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Inline script runs immediately (before chunks load) — handles trailing dot redirect
// for GitHub Pages 404 fallback. React useEffect is a second-pass safety net.
const trailingDotScript = `(function(){
  var p = window.location.pathname;
  var c = p.replace(/\\.+$/, '');
  if (c !== p) { window.location.replace(c + window.location.search + window.location.hash); }
})();`;

export default function NotFound() {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const cleaned = pathname.replace(/\.+$/, "");
    if (cleaned !== pathname) {
      setRedirecting(true);
      window.location.replace(cleaned + search + hash);
    }
  }, []);

  if (redirecting) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script dangerouslySetInnerHTML={{ __html: trailingDotScript }} />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <p className="text-8xl font-bold text-muted-foreground/30 select-none">
            404
          </p>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Halaman tidak ditemukan
            </h1>
            <p className="text-sm text-muted-foreground">
              URL yang Anda akses tidak tersedia. Mungkin sudah dipindahkan atau
              salah ketik.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/id/docs"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ke Dokumentasi
            </Link>
            <Link
              href="/id"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Beranda
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
