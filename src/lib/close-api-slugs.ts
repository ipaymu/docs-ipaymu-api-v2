/**
 * Daftar slug halaman Close API.
 *
 * Dipakai HANYA untuk membuat rute statis (cangkang kosong) supaya penanda menu
 * aktif dan navigasi Sebelumnya/Berikutnya milik fumadocs berfungsi. Daftar ini
 * tidak menentukan hak akses: menu yang tampil dan isi halaman tetap ditentukan
 * ipaymu-core berdasarkan `dp_api_accesses` milik merchant.
 */
export const CLOSE_API_SLUGS = [
  "register",
  "transfer-va",
  "profile",
  "bank-list",
  "business-category",
  "member-verification",
  "merchant-verification",
] as const;
