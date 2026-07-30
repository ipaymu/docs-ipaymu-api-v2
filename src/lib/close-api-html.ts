/**
 * Sanitasi HTML dokumentasi Close API sebelum disuntikkan ke DOM.
 *
 * Kenapa perlu, padahal isinya artefak MDX milik tim sendiri? Karena HTML ini
 * datang lewat jaringan dari ipaymu-core, dan cangkang menyuntikkannya dengan
 * `dangerouslySetInnerHTML`. Kalau artefak di core tersabotase — atau respons
 * dibelokkan — skrip akan berjalan di origin `docs.ipaymu.com` dan bisa membaca
 * token di sessionStorage. Sanitasi memutus rantai itu.
 *
 * Pendekatannya allowlist: apa pun yang tidak disebut di sini dibuang.
 */

/** Tag yang dipakai artefak MDX kita. Sisanya dibuang. */
const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "div", "span",
  "strong", "b", "em", "i", "u", "s", "del", "ins", "sup", "sub", "small", "mark",
  "a", "img",
  "ul", "ol", "li",
  "code", "pre", "kbd", "samp", "var",
  "blockquote",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "details", "summary",
  "figure", "figcaption",
  "dl", "dt", "dd",
]);

/**
 * Elemen yang harus dibuang BESERTA isinya. Untuk tag lain yang tidak diizinkan,
 * anak-anaknya dipertahankan (unwrap) supaya teks dokumentasi tidak hilang.
 */
const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "template",
  "form", "input", "button", "select", "textarea",
  "link", "meta", "base", "noscript", "svg", "math",
]);

const ALLOWED_ATTRS = new Set([
  "href", "title", "alt", "src", "id", "class", "lang", "dir",
  "colspan", "rowspan", "scope", "headers",
  "start", "reversed", "value",
  "open",
  "width", "height", "loading", "decoding",
  "target", "rel",
  // Highlighting Shiki memakai style inline untuk warna token.
  "style",
  // fumadocs/Shiki memakai beberapa data-*; diizinkan lewat cek prefix di bawah.
]);

/** Skema URL yang boleh muncul di `href`/`src`. */
function isSafeUrl(value: string): boolean {
  const v = value.trim();
  if (v === "") return false;
  // Relatif, absolut-path, dan anchor selalu aman.
  if (v.startsWith("#") || v.startsWith("/") || v.startsWith("./") || v.startsWith("../")) return true;
  // Diagram mermaid diekspor sebagai data URI gambar.
  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(v)) return true;
  if (/^https?:\/\//i.test(v)) return true;
  if (/^mailto:/i.test(v)) return true;
  // Sisanya (javascript:, vbscript:, data: non-gambar, …) ditolak.
  return false;
}

function cleanElement(el: Element): void {
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();

    // Semua penangan kejadian (onclick, onerror, onload, …) dibuang.
    if (name.startsWith("on")) {
      el.removeAttribute(attr.name);
      continue;
    }

    // data-* dari Shiki/fumadocs aman: hanya dibaca CSS, tidak dieksekusi.
    if (name.startsWith("data-")) continue;

    if (!ALLOWED_ATTRS.has(name)) {
      el.removeAttribute(attr.name);
      continue;
    }

    if ((name === "href" || name === "src") && !isSafeUrl(attr.value)) {
      el.removeAttribute(attr.name);
      continue;
    }

    // `style` dibatasi: buang yang memuat url()/expression() agar tidak bisa
    // memuat sumber daya luar atau menyalahgunakan CSS lama.
    if (name === "style" && /url\s*\(|expression\s*\(/i.test(attr.value)) {
      el.removeAttribute(attr.name);
    }
  }

  // Tautan keluar tidak boleh bisa mengakses window.opener.
  if (el.tagName.toLowerCase() === "a" && el.getAttribute("target") === "_blank") {
    el.setAttribute("rel", "noopener noreferrer");
  }
}

function walk(root: Element): void {
  // Salin daftar anak lebih dulu: pohonnya dimodifikasi selama iterasi.
  for (const child of Array.from(root.children)) {
    const tag = child.tagName.toLowerCase();

    if (DROP_WITH_CONTENT.has(tag)) {
      child.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      // Tag tak dikenal: buang wadahnya, pertahankan isinya.
      walk(child);
      child.replaceWith(...Array.from(child.childNodes));
      continue;
    }

    cleanElement(child);
    walk(child);
  }
}

/**
 * Kembalikan HTML yang sudah dibersihkan. Hanya berjalan di browser
 * (butuh DOMParser); di server mengembalikan string kosong.
 */
export function sanitizeCloseApiHtml(dirty: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return "";
  if (!dirty) return "";

  const doc = new DOMParser().parseFromString(dirty, "text/html");
  walk(doc.body);
  return doc.body.innerHTML;
}
