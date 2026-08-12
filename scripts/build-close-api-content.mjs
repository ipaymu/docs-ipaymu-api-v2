// Membuat ARTEFAK konten Close API untuk ipaymu-core.
//
//   node scripts/build-close-api-content.mjs      # → close-api-content/
//
// Latar belakang: situs docs adalah static export tanpa sisi server, jadi isi
// Close API TIDAK boleh ikut dibundel (siapa pun bisa membuka berkasnya
// langsung). Isi dokumentasi disajikan ipaymu-core setelah token + hak akses
// (dp_api_accesses) diverifikasi.
//
// Skrip ini merender MDX di `content/close-api/` menjadi HTML, lalu menyalin
// potongan artikelnya ke:
//
//   close-api-content/<lang>/<slug>.html    -> isi halaman
//   close-api-content/<lang>/<slug>.json    -> { title, toc }
//
// Salin folder itu ke core: storage/app/close-api-content/
//
// Rute perender di-stage SEMENTARA ke `src/app/[lang]/close-api-export/` supaya
// tidak bentrok dengan cangkang publik permanen di `src/app/[lang]/close-api/`.
import { cpSync, rmSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const SRC = join("private", "close-api");
const DEST = join("src", "app", "[lang]", "close-api-export");
const OUT = "out";
const CONTENT = "close-api-content";
const LANGS = ["id", "en"];
const NEXT_BIN = join("node_modules", ".bin", process.platform === "win32" ? "next.cmd" : "next");

function cleanup() {
  if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true });

  // WAJIB: buang juga hasil build-nya.
  //
  // Build di skrip ini memakai PRIVATE_BUILD=1, jadi `out/` berisi SELURUH isi
  // dokumentasi Close API di `/<lang>/close-api-export/*` — 176 berkas. Kalau
  // `out/` itu dibiarkan lalu diunggah ke hosting, seluruh dokumentasi privat
  // jadi publik. Menghapusnya membuat kecelakaan itu tidak mungkin terjadi:
  // penyebaran selalu butuh `npm run build` yang bersih lebih dulu.
  if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
}
process.on("exit", cleanup);

// --- 1. Stage rute perender -------------------------------------------------
cleanup();
cpSync(SRC, DEST, { recursive: true });

// --- 2. Build (PRIVATE_BUILD=1 supaya halaman Close API ikut di-emit) --------
const res = spawnSync(NEXT_BIN, ["build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    PRIVATE_BUILD: "1",
    NEXT_PUBLIC_PRIVATE_BUILD: "1",
    PUPPETEER_CHROMIUM_FLAGS: process.env.PUPPETEER_CHROMIUM_FLAGS || "--no-sandbox",
  },
});
if (res.status !== 0) process.exit(res.status ?? 1);

// --- 3. Ekstrak isi artikel dari HTML hasil build ---------------------------
/** Ambil innerHTML dari <article id="nd-page" ...> ... </article>. */
function extractArticle(html) {
  const start = html.search(/<article[^>]*id="nd-page"[^>]*>/);
  if (start === -1) return null;
  const openEnd = html.indexOf(">", start) + 1;

  // Cari </article> yang berpasangan (artikel bisa memuat <article> bersarang).
  let depth = 1;
  let i = openEnd;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf("<article", i);
    const nextClose = html.indexOf("</article>", i);
    if (nextClose === -1) return null;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 8;
    } else {
      depth--;
      if (depth === 0) return html.slice(openEnd, nextClose);
      i = nextClose + 10;
    }
  }
  return null;
}

/** <title>Judul | iPaymu Dokumentasi</title> → "Judul" */
function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/);
  if (!m) return null;
  return m[1].split("|")[0].trim();
}

/** Daftar isi dari heading ber-id di dalam artikel. */
function extractToc(articleHtml) {
  const toc = [];
  const re = /<h([2-4])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(articleHtml)) !== null) {
    const text = m[3].replace(/<[^>]*>/g, "").trim();
    if (text) toc.push({ depth: Number(m[1]), title: text, url: `#${m[2]}` });
  }
  return toc;
}

if (existsSync(CONTENT)) rmSync(CONTENT, { recursive: true, force: true });

// Kumpulkan daftar halaman terbit per bahasa untuk manifest.json (lihat akhir
// berkas). Core memakai manifest ini sebagai daftar slug yang BENAR-BENAR ada,
// jadi `config/closeapi.php` tidak perlu ditebak dengan tangan.
const terbit = {};

let written = 0;
for (const lang of LANGS) {
  const dir = join(OUT, lang, "close-api-export");
  if (!existsSync(dir)) continue;
  mkdirSync(join(CONTENT, lang), { recursive: true });

  // Halaman ikhtisar diekspor sebagai `overview` (core memakainya untuk slug kosong).
  const indexFile = join(OUT, lang, "close-api-export.html");
  const files = readdirSync(dir).filter((f) => f.endsWith(".html"));
  const targets = [
    ...(existsSync(indexFile) ? [[indexFile, "overview"]] : []),
    ...files.map((f) => [join(dir, f), f.replace(/\.html$/, "")]),
  ];

  for (const [file, slug] of targets) {
    const html = readFileSync(file, "utf8");
    const article = extractArticle(html);
    if (!article) {
      console.warn(`  ! lewati ${lang}/${slug} (artikel tidak ditemukan)`);
      continue;
    }
    const title = extractTitle(html) ?? slug;
    writeFileSync(join(CONTENT, lang, `${slug}.html`), article);
    writeFileSync(
      join(CONTENT, lang, `${slug}.json`),
      JSON.stringify({ title, toc: extractToc(article) }, null, 2),
    );
    (terbit[lang] ??= []).push({ slug, title });
    written++;
    console.log(`  ✓ ${lang}/${slug}`);
  }
}

// --- 4. manifest.json -------------------------------------------------------
// Daftar tunggal semua halaman terbit. Core membacanya untuk mengetahui slug apa
// saja yang tersedia, tanpa perlu menebak atau menyalin daftar secara manual.
if (written > 0) {
  writeFileSync(
    join(CONTENT, "manifest.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), languages: terbit }, null, 2),
  );
}

cleanup();
console.log(`\n✔ ${written} berkas artefak siap di ./${CONTENT}`);
console.log("  Salin ke core:  storage/app/close-api-content/");
console.log("\n  Catatan: ./out sengaja dihapus — build tadi memakai PRIVATE_BUILD=1");
console.log("  sehingga memuat isi Close API. Jalankan `npm run build` untuk bundel publik.");

// --- 5. Bantu core menyelaraskan config/closeapi.php ------------------------
// `overview` bukan produk; ia halaman ikhtisar untuk slug kosong.
const slugTerbit = (terbit.id ?? []).map((p) => p.slug).filter((s) => s !== "overview");
if (slugTerbit.length) {
  console.log("\n  Slug yang tersedia untuk dipetakan di config/closeapi.php:");
  for (const s of slugTerbit) console.log(`    - ${s}`);
  console.log(
    "\n  Slug yang belum punya api_code di core TIDAK akan muncul di menu merchant\n" +
      "  dan akan dijawab 403 bila dibuka langsung. Itu perilaku yang aman —\n" +
      "  tapi berarti halamannya belum bisa dibaca siapa pun.",
  );
}
