import meta from "../../content/close-api/meta.json";

/**
 * Daftar slug halaman Close API, diturunkan dari `content/close-api/meta.json`
 * supaya hanya ada SATU sumber kebenaran. Sebelumnya daftar ini ditulis tangan
 * dan sempat menyimpang dari isi `content/close-api/`.
 *
 * Dipakai HANYA untuk membuat rute statis (cangkang kosong) supaya penanda menu
 * aktif dan navigasi Sebelumnya/Berikutnya milik fumadocs berfungsi. Daftar ini
 * tidak menentukan hak akses: menu yang tampil dan isi halaman tetap ditentukan
 * ipaymu-core berdasarkan `dp_api_accesses` milik merchant.
 *
 * Menambah halaman Close API = tambahkan ke `meta.json` saja; cangkang rute dan
 * artefak untuk core ikut menyesuaikan sendiri.
 */
export const CLOSE_API_SLUGS: string[] = meta.pages.filter((page) => page !== "index");
