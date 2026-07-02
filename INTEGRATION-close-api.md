# Close API Docs — Integration Spec for ipaymu-core

This document describes how the **private Close API documentation** produced by this repository is
served behind access control owned by **ipaymu-core**.

The docs site itself does **not** implement login. ipaymu-core is the gatekeeper: it authenticates
the user, looks up in its database which Close API products the user is allowed to see, and only then
serves (proxies) the matching static files.

---

## 1. Architecture

```
┌──────────────────────┐   1. user logged in      ┌─────────────────────────┐
│  ipaymu-core         │   2. DB lookup: which     │  Private docs (static)  │
│  (dashboard + DB)    │      close-api products   │  out-private/           │
│                      │      is this user allowed?│   /<lang>/close-api/... │
│  reverse-proxy gate  │ ───── if allowed ───────▶ │   /_next/..., /img/...  │
│                      │ ───── else 403 ─────────  │                         │
└──────────────────────┘                           └─────────────────────────┘
```

- The public docs site (`out/`) is built **without** Close API — it can never leak to the public.
- The private docs (`out-private/`) contain the Close API pages and are deployed **only** where
  ipaymu-core can reach them (private network / internal origin), never exposed directly.

---

## 2. Building the private docs

From this repository:

```bash
# Public site (Close API excluded) — safe to deploy publicly
npm run build          # → out/

# Private site (Close API included) — deploy behind ipaymu-core only
npm run build:private  # → out-private/
```

### How exclusion works (the core security guarantee)

The Close API **route** (`layout.tsx` + `page.tsx`) does not live in `src/app`. It is staged in
`private/close-api/` and is copied into `src/app/[lang]/close-api/` **only** by the private build
(`scripts/with-close-api.mjs`), then removed again afterwards.

- `npm run build` (public) sees **no Close API route at all** → it is impossible for any Close API
  HTML to be written to `out/`. This is the primary guarantee, and it requires no moving parts on the
  public path.
- `npm run build:private` stages the route and sets two flags:
  - `PRIVATE_BUILD=1` — lets `generateStaticParams()` emit the Close API pages.
  - `NEXT_PUBLIC_PRIVATE_BUILD=1` — shows the "Close API" link in the navbar.
- **Fail-safe:** if the route is ever present during a public build (e.g. a leftover copy from a
  crashed run), `generateStaticParams()` returns `[]`, which makes `output: export` **fail loudly**
  rather than silently publish the private docs.

The Close API *content* (`content/close-api/`) is always present but is only referenced by the staged
route, and never by the public search index or `llms-full.txt`.

### Local preview

```bash
npm run dev:private    # serves Close API at http://localhost:3000/id/close-api
```

---

## 3. URL scheme

The docs are bilingual (`id` default, `en`). After a static export the paths are:

| Page                     | URL path                                  |
| :----------------------- | :---------------------------------------- |
| Overview + Signature     | `/<lang>/close-api`                        |
| Register                 | `/<lang>/close-api/register`              |
| Split Payment (Transfer) | `/<lang>/close-api/transfer-va`           |
| Get Profile By VA        | `/<lang>/close-api/profile`               |
| Bank List                | `/<lang>/close-api/bank-list`             |
| List Business Category   | `/<lang>/close-api/business-category`     |
| Member Verification      | `/<lang>/close-api/member-verification`   |
| Merchant Verification    | `/<lang>/close-api/merchant-verification` |

`<lang>` is `id` or `en`. Static assets are served from `/_next/...` and `/img/...` and must always
pass through (they carry no sensitive content).

> If a `BASE_PATH` is configured at build time, prefix every path above with it.

---

## 4. Entitlement model (ipaymu-core DB)

ipaymu-core decides access **per account, per Close API product**. The unit of access is the
**slug** — the first path segment after `/<lang>/close-api/`.

Suggested DB shape:

```
account_close_api_access
├─ account_id   (FK → account)   e.g. VA 1179000899
└─ product_slug (string)          e.g. "transfer-va"
```

### Recommended slug → product mapping

| `product_slug`          | Grants access to page(s)                        |
| :---------------------- | :---------------------------------------------- |
| `register`              | `/close-api/register`                           |
| `transfer-va`           | `/close-api/transfer-va`                         |
| `profile`               | `/close-api/profile`                            |
| `verification`          | `member-verification`, `merchant-verification`, `bank-list`, `business-category` |

Notes:

- **`bank-list` and `business-category`** are helper/master-data docs used by the verification
  flows. Bundle them with `verification` (above) or always-allow them — they expose no secrets.
- The **overview/signature page** (`/<lang>/close-api` with no slug) should be accessible to **any**
  account that has at least one Close API product, since it documents the shared auth mechanism.

---

## 5. Proxy logic (reference)

Pseudocode for the ipaymu-core gateway in front of `out-private/`:

```
on request PATH (e.g. /id/close-api/transfer-va):

  # 1. always allow static assets
  if PATH starts with "/_next/" or "/img/" or is a favicon/font/asset:
      return serveStatic(out-private + PATH)

  # 2. only the close-api tree is gated here; everything else 404s
  match = PATH ~= ^/(id|en)/close-api(?:/([^/]+))?
  if not match:
      return 404

  lang, slug = match.groups   # slug is empty for the overview page

  # 3. must be an authenticated iPaymu user
  user = authenticate(request)            # existing ipaymu-core session
  if not user:
      return redirectToLogin()

  # 4. authorize
  allowed = db.productsFor(user.account)  # set of product_slug
  if isEmpty(allowed):
      return 403

  if slug is empty:                       # overview/signature page
      return serveStatic(resolve(PATH))   # any close-api user may read it

  product = slugToProduct(slug)           # see §4 mapping
  if product not in allowed:
      return 403

  # 5. serve the static file
  return serveStatic(resolve(PATH))
```

`resolve(PATH)` maps a URL to a file in `out-private/`. With the current export settings
(`trailingSlash` unset → `false`):

- `/id/close-api`                → `out-private/id/close-api.html`
- `/id/close-api/transfer-va`    → `out-private/id/close-api/transfer-va.html`

(Serve `<path>.html` for a clean URL, and `<path>/index.html` if you enable `trailingSlash`.)

---

## 6. 403 handling

When `product not in allowed`, return ipaymu-core's standard **403 page** (or redirect to the
dashboard with a "request access" call to action). Do **not** serve the docs HTML with a client-side
banner — the gate must happen server-side, before any Close API bytes leave the origin.

This mirrors the API behaviour documented in the docs themselves: an account without access to a
service receives HTTP `403`.

---

## 7. Security checklist

- [ ] `out-private/` is **never** served on a public origin — only reachable through the ipaymu-core
      proxy (private network, internal hostname, or authenticated edge).
- [ ] The public deployment uses `npm run build` (`out/`), which contains **no** Close API pages.
- [ ] The gateway authorizes **server-side** before serving; no client-only checks.
- [ ] Static assets (`/_next`, `/img`) pass through; HTML pages under `/close-api/<slug>` are gated.
- [ ] Close API pages set `robots: noindex, nofollow` (already configured) as defense in depth.
- [ ] Access changes in the DB take effect immediately (no long-lived cached authorization).

---

## 8. Alternative: signed-token gateway (optional)

If you prefer to decouple hosting from ipaymu-core, ipaymu-core can instead mint a short-lived signed
token (e.g. JWT) listing the user's allowed `product_slug`s, and a thin stateless gateway in front of
`out-private/` validates the token and applies the same §5 authorization. This trades a little more
infrastructure for the ability to host the docs independently. The reverse-proxy approach in §5 is
recommended unless you specifically need that decoupling.
