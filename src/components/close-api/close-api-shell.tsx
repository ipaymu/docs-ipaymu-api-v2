"use client";

// Cangkang (shell) dokumentasi Close API.
//
// PENTING: berkas ini TIDAK memuat satu pun isi dokumentasi. Seluruh konten
// diambil dari ipaymu-core saat runtime, dan core-lah yang memverifikasi token
// serta hak akses (dp_api_accesses) pada SETIAP permintaan.
//
// Kenapa begitu? Situs ini adalah static export (`output: 'export'`) tanpa sisi
// server. Kalau isi dokumentasi ikut dibundel, siapa pun bisa membuka berkas
// HTML-nya langsung tanpa token — pengecekan di browser tidak akan menolongnya.
// Karena tidak ada konten di bundel, tanpa token yang sah tidak ada yang bisa
// dibaca.
//
// Tampilan memakai komponen fumadocs yang sama dengan section lain (DocsLayout
// + DocsPage), supaya sidebar, daftar isi, dan tipografinya konsisten. Bedanya
// hanya satu: pohon menu dibangun dari manifest milik merchant, bukan dari MDX.
import { useCallback, useEffect, useMemo, useState } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { DocsBody, DocsPage, DocsTitle } from "fumadocs-ui/page";
// Modul ini mengekspor tipe-tipenya langsung (Root, Item, …), bukan sebagai
// namespace bernama PageTree — sama seperti cara fumadocs-ui mengimpornya.
import type * as PageTree from "fumadocs-core/page-tree";
import { baseOptions } from "@/lib/layout.shared";
import { HorizontalNavbar } from "@/components/layout/horizontal-navbar";
import { sanitizeCloseApiHtml } from "@/lib/close-api-html";

/**
 * Ambil muatan respons, menerima dua bentuk sekaligus:
 *
 *   { Status, Success, Message, Data: {...} }   ← konvensi rumah iPaymu
 *   { ...muatan langsung }                      ← bentuk polos
 *
 * Sengaja toleran supaya sisi core tidak perlu menyesuaikan apa pun; bentuk
 * mana pun yang dikirim, cangkang ini tetap bekerja.
 */
function unwrap(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") return {};
  const obj = body as Record<string, unknown>;
  const data = obj.Data ?? obj.data;
  if (data && typeof data === "object") return data as Record<string, unknown>;
  return obj;
}

type Product = { slug: string; name: string };
type TocItem = { depth: number; title: string; url: string };

/**
 * Status dibagi dua tingkat, dan pembagian itu menentukan tampilan:
 *
 * - Tingkat SHELL (`no-token`, `expired`, `forbidden`, `error`): tidak ada yang
 *   bisa ditampilkan sama sekali, jadi sidebar disembunyikan.
 * - Tingkat HALAMAN (`page-forbidden`, `page-missing`, `page-error`): manifest
 *   sudah berhasil, jadi daftar produk merchant VALID. Sidebar harus tetap ada
 *   supaya merchant bisa pindah ke halaman lain — kegagalan satu halaman tidak
 *   boleh mematikan navigasi.
 */
type Status =
  | "loading"
  | "ready"
  | "no-token"
  | "expired"
  | "forbidden"
  | "error"
  | "page-forbidden"
  | "page-missing"
  | "page-error";

const STATUS_TINGKAT_HALAMAN = new Set<Status>(["page-forbidden", "page-missing", "page-error"]);

/**
 * Token disimpan di sessionStorage supaya tetap ada saat halaman di-refresh
 * atau bahasa diganti (`/id/close-api` → `/en/close-api`) — keduanya memuat
 * ulang dokumen sehingga state React hilang.
 *
 * sessionStorage dipilih (bukan localStorage) karena hanya berlaku untuk tab
 * ini dan hilang begitu tab ditutup.
 */
const TOKEN_KEY = "ipaymu-close-api-token";

/** Ambil token dari fragment URL (#token=...). Fragment tidak pernah dikirim ke server. */
function readTokenFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const m = (window.location.hash || "").match(/[#&]token=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* mode privat / storage diblokir: cukup andalkan state di memori */
  }
}

/**
 * Origin core yang boleh dihubungi. Daftar ini WAJIB ada.
 *
 * Klaim `iss` di dalam token hanya di-decode, TIDAK diverifikasi tanda
 * tangannya (secret-nya cuma ada di core dan tidak pernah dikirim ke browser).
 * Tanpa allowlist, siapa pun bisa membuat token palsu berisi
 * `iss: https://penyerang.example`, memancing merchant membuka
 * `…/close-api#token=<palsu>`, lalu:
 *   1. menerima Bearer token yang dikirim browser ke server mereka, dan
 *   2. membalas HTML sembarang yang berakhir di DOM halaman ini — yaitu XSS
 *      pada origin docs, yang bisa membaca token di sessionStorage.
 * Karena itu `iss` diperlakukan sebagai PILIHAN dari daftar tertutup, bukan
 * sebagai URL yang bisa dipercaya.
 */
const ALLOWED_ISSUERS = [
  "https://my.ipaymu.com",
  "https://sandbox.ipaymu.com",
] as const;

/**
 * Tentukan base URL core (produksi vs sandbox) dari klaim `iss`, sehingga satu
 * bundel statis melayani kedua lingkungan. Mengembalikan null kalau `iss` tidak
 * ada di allowlist.
 */
function readIssuer(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.iss !== "string") return null;

    const iss = payload.iss.replace(/\/+$/, "").toLowerCase();
    return ALLOWED_ISSUERS.find((allowed) => allowed === iss) ?? null;
  } catch {
    return null;
  }
}

export function CloseApiShell({ lang, slug }: { lang: string; slug: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [base, setBase] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [toc, setToc] = useState<TocItem[]>([]);
  // Mulai dari "loading" (bukan "idle") supaya HTML hasil prerender tidak
  // sempat menampilkan daftar produk kosong sebelum token diperiksa.
  const [status, setStatus] = useState<Status>("loading");

  const overviewLabel = lang === "en" ? "Overview & Signature" : "Ikhtisar & Signature";
  const sectionLabel = lang === "en" ? "Your Close API" : "Close API Anda";

  const request = useCallback(
    async (path: string) => {
      if (!token || !base) return null;
      return fetch(`${base}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    },
    [token, base],
  );

  /** Muat satu halaman. slug kosong = ikhtisar (mekanisme signature). */
  const loadPage = useCallback(
    async (slug: string) => {
      setStatus("loading");
      const res = await request(
        `/api/v2/close-api-docs/page?lang=${encodeURIComponent(lang)}&slug=${encodeURIComponent(slug)}`,
      );
      if (!res) return;

      if (res.status === 401) {
        // Token benar-benar kedaluwarsa/ditolak core: buang yang tersimpan
        // supaya refresh berikutnya tidak memakai token mati lagi.
        storeToken(null);
        return setStatus("expired");
      }
      // 403/404 di sini soal SATU halaman, bukan soal akses secara keseluruhan.
      // Ditandai sebagai status tingkat halaman supaya sidebar tetap tampil.
      if (res.status === 403) return setStatus("page-forbidden");
      if (res.status === 404) return setStatus("page-missing");
      if (!res.ok) return setStatus("page-error");

      const data = unwrap(await res.json());
      setTitle(typeof data.title === "string" ? data.title : "");
      // Selalu disanitasi: HTML ini datang lewat jaringan dan disuntikkan ke DOM.
      setHtml(sanitizeCloseApiHtml(typeof data.html === "string" ? data.html : ""));
      setToc(Array.isArray(data.toc) ? data.toc : []);
      setStatus("ready");
      if (data.title) document.title = `${data.title} | iPaymu Dokumentasi`;
    },
    [request, lang],
  );

  // 1. Ambil token: dari fragment (klik dari dashboard) atau dari sessionStorage
  //    (refresh / ganti bahasa). Token dibersihkan dari address bar setelah
  //    dibaca supaya tidak ter-bookmark atau terlihat orang lain.
  useEffect(() => {
    const fromHash = readTokenFromHash();
    const t = fromHash ?? readStoredToken();

    if (!t) {
      setStatus("no-token");
      return;
    }

    // Issuer di luar allowlist = token tidak dipakai sama sekali. Buang juga
    // yang tersimpan supaya refresh berikutnya tidak mencobanya lagi.
    const origin = readIssuer(t);
    if (!origin) {
      storeToken(null);
      setStatus("expired");
      return;
    }

    if (fromHash) {
      storeToken(fromHash);
      // Buang token dari address bar; halaman aktif ditentukan pathname rute.
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    setToken(t);
    setBase(origin);
  }, []);

  // 2. Token siap → tanya core produk apa saja yang boleh dilihat merchant.
  //    Isi halamannya dimuat efek berikutnya sesuai slug dari rute.
  useEffect(() => {
    if (!token || !base) return;

    (async () => {
      setStatus("loading");
      const res = await request(`/api/v2/close-api-docs/manifest?lang=${encodeURIComponent(lang)}`);
      if (!res) return;

      if (res.status === 401) {
        storeToken(null);
        return setStatus("expired");
      }
      if (res.status === 403) return setStatus("forbidden");
      if (!res.ok) return setStatus("error");

      const products = unwrap(await res.json()).products;
      setProducts(Array.isArray(products) ? products : []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, base]);

  // 3. Muat konten sesuai slug dari ROUTE. Berpindah halaman lewat sidebar =
  //    navigasi Next biasa, jadi efek ini jalan lagi dengan slug baru.
  useEffect(() => {
    if (!token || !base) return;
    loadPage(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, base, slug]);

  // 4. Tab ini sudah terbuka lalu merchant mengeklik tautan baru dari dashboard:
  //    browser hanya mengganti fragment tanpa memuat ulang halaman, sehingga
  //    komponen tidak ter-mount lagi. Tangkap token penggantinya lewat
  //    `hashchange` (mis. saat token lama sudah kedaluwarsa).
  useEffect(() => {
    const onHashChange = () => {
      const fresh = readTokenFromHash();
      if (!fresh) return;

      // Allowlist berlaku sama untuk token pengganti.
      const origin = readIssuer(fresh);
      if (!origin) {
        storeToken(null);
        setStatus("expired");
        return;
      }

      storeToken(fresh);
      setToken(fresh);
      setBase(origin);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  /**
   * Pohon menu untuk sidebar fumadocs. Isinya HANYA produk yang dikirim core,
   * jadi produk yang tidak dimiliki merchant tidak pernah muncul.
   */
  // `type: "root"` dan `$id` WAJIB ada. Tanpa keduanya fumadocs tidak merender
  // satu pun item sidebar — pohon dianggap tidak valid dan diabaikan diam-diam,
  // sehingga merchant kehilangan seluruh navigasinya. Bandingkan dengan pohon
  // yang dihasilkan loader untuk section lain: rootnya `type:"root"` + `$id`,
  // dan setiap item punya `$id` sendiri.
  //
  // `$id` root WAJIB ikut berubah saat daftar produk berubah. TreeContextProvider
  // fumadocs menyimpan pohonnya dengan `useMemo(() => rawTree, [rawTree.$id])` —
  // pohon baru dengan `$id` yang sama diabaikan diam-diam. Pohon lain dibangun di
  // server sekali jalan sehingga hal ini tidak terasa, tapi pohon ini datang
  // belakangan lewat manifest: dengan `$id` tetap, fumadocs terkunci pada pohon
  // render pertama (baru berisi ikhtisar, manifest belum tiba) dan produk
  // merchant tidak pernah muncul di sidebar.
  const treeId = useMemo(
    () => `close-api:${lang}:${products.map((p) => p.slug).join("|")}`,
    [products, lang],
  );

  const tree = useMemo<PageTree.Root>(
    () => ({
      type: "root",
      $id: treeId,
      name: "Close API",
      children: [
        {
          type: "page",
          $id: `close-api:${lang}:overview`,
          name: overviewLabel,
          url: `/${lang}/close-api`,
        },
        ...products.map((p) => ({
          type: "page" as const,
          $id: `close-api:${lang}:${p.slug}`,
          name: p.name,
          url: `/${lang}/close-api/${p.slug}`,
        })),
      ],
    }),
    [products, lang, overviewLabel, treeId],
  );

  // `links` sengaja dikosongkan: fumadocs ikut merender daftar itu di SIDEBAR,
  // sehingga Beranda/Dokumentasi/Verifikasi/Plugin muncul dua kali (navbar atas
  // dan sidebar). Sidebar Close API hanya untuk daftar produk merchant.
  // Navbar atas tetap lengkap karena dirender HorizontalNavbar sendiri.
  const layoutProps = { ...baseOptions(lang, "close-api"), links: [] };

  const shell = (children: React.ReactNode, withSidebar: boolean) => (
    <DocsLayout
      tree={
        withSidebar
          ? tree
          : { type: "root", $id: `close-api:${lang}:kosong`, name: "Close API", children: [] }
      }
      {...layoutProps}
      i18n
      nav={{ ...layoutProps.nav, component: <HorizontalNavbar lang={lang} current="close-api" /> }}
      sidebar={{
        enabled: withSidebar,
        // Judul kelompok di atas daftar produk.
        banner: withSidebar ? (
          <p className="px-2 pb-1 text-sm font-medium text-fd-muted-foreground">{sectionLabel}</p>
        ) : undefined,
      }}
    >
      {children}
    </DocsLayout>
  );

  // ---------- Tampilan gagal ----------
  if (status !== "loading" && status !== "ready") {
    const copy: Record<string, { title: string; body: string }> = {
      "no-token": {
        title: "Buka dari Dashboard iPaymu",
        body: "Dokumentasi Close API hanya bisa dibuka lewat tautan di dashboard iPaymu Anda. Silakan masuk ke dashboard, buka menu Integrasi → Close API, lalu klik dokumentasinya.",
      },
      expired: {
        title: "Sesi Kedaluwarsa",
        body: "Tautan dokumentasi ini sudah kedaluwarsa. Silakan buka kembali dari dashboard iPaymu untuk mendapatkan akses baru.",
      },
      forbidden: {
        title: "Tidak Ada Akses",
        body: "Akun Anda belum memiliki akses Close API. Hubungi tim iPaymu bila Anda merasa ini keliru.",
      },
      error: {
        title: "Terjadi Kesalahan",
        body: "Dokumentasi tidak bisa dimuat saat ini. Silakan coba lagi beberapa saat lagi.",
      },
      "page-forbidden": {
        title: "Tidak Ada Akses ke Halaman Ini",
        body: "Akun Anda tidak memiliki akses ke dokumentasi ini. Pilih halaman lain di samping, atau hubungi tim iPaymu bila Anda merasa ini keliru.",
      },
      "page-missing": {
        title: "Halaman Belum Tersedia",
        body: "Dokumentasi untuk halaman ini belum diterbitkan. Silakan pilih halaman lain di samping.",
      },
      "page-error": {
        title: "Halaman Gagal Dimuat",
        body: "Halaman ini tidak bisa dimuat saat ini. Silakan coba lagi, atau pilih halaman lain di samping.",
      },
    };
    const c = copy[status];

    // Kegagalan tingkat halaman: manifest sudah berhasil, jadi daftar produk
    // merchant valid dan sidebar WAJIB tetap tampil — kalau tidak, merchant
    // terjebak tanpa cara pindah ke halaman lain yang mungkin bisa dibuka.
    //
    // `products.length` dipakai sebagai bukti manifest sudah berhasil: kalau
    // manifest gagal atau merchant tidak punya produk, core menjawab 403 dan
    // tidak ada yang bisa dinavigasi — jatuh ke tampilan penuh tanpa sidebar.
    const tingkatHalaman = STATUS_TINGKAT_HALAMAN.has(status) && products.length > 0;

    return shell(
      // [grid-area:main] wajib: DocsLayout memakai CSS grid, tanpa penempatan
      // ini elemen jatuh ke kolom auto yang sempit (teks jadi satu kolom kurus).
      <div className="[grid-area:main] mx-auto w-full max-w-xl px-4 pb-20 pt-24 text-center">
        <h1 className="mb-3 text-2xl font-semibold">{c.title}</h1>
        <p className="text-fd-muted-foreground">{c.body}</p>
      </div>,
      tingkatHalaman,
    );
  }

  // ---------- Tampilan normal ----------
  return shell(
    <DocsPage toc={toc} tableOfContent={{ style: "clerk", single: false }}>
      {status === "loading" ? (
        <p className="pt-12 text-fd-muted-foreground">Memuat…</p>
      ) : (
        <>
          <DocsTitle className="pt-12">{title}</DocsTitle>
          {/* HTML dari core, sudah melewati sanitizeCloseApiHtml() di loadPage
              (allowlist tag/atribut, buang skrip & URL berbahaya). Judul <h1>
              bawaan artefak disembunyikan lewat CSS agar tidak dobel dengan
              DocsTitle di atas. */}
          <DocsBody>
            <div
              className="[&>h1:first-child]:hidden"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </DocsBody>
        </>
      )}
    </DocsPage>,
    true,
  );
}
