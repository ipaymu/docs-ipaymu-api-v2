// Removes any leftover staged Close API *content-export* route from `src/app`.
//
// PENTING: sejak Close API memakai model token, `src/app/[lang]/close-api/`
// adalah CANGKANG PUBLIK permanen (tanpa isi dokumentasi) dan TIDAK boleh
// dihapus. Yang di-stage sementara hanyalah rute perender MDX untuk membuat
// artefak konten (scripts/build-close-api-content.mjs), di path terpisah.
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const DEST = join("src", "app", "[lang]", "close-api-export");

if (existsSync(DEST)) {
  rmSync(DEST, { recursive: true, force: true });
  console.log("Removed a leftover staged Close API route from src/app.");
}
