# Project Context: iPaymu API V2 Documentation
This project is a static documentation site built with **Fumadocs**, **Next.js**, and **Bun**.

## 🎯 Goal
Build a high-performance, statically generated (SSG) documentation site supporting **Indonesian (id)** and **English (en)** languages with a single shared layout.

## 🛠 Tech Stack
- **Runtime:** Bun
- **Framework:** Next.js 14+ (App Router)
- **Docs Engine:** Fumadocs (latest version)
- **Styling:** Tailwind CSS
- **Deployment Target:** Static Hosting (SSG - `output: 'export'`)

## ⚡️ Critical Architecture Rules (Strict Adherence Required)

### 1. Static Site Generation (SSG)
- **Constraint:** We are using `output: 'export'` in `next.config.mjs`.
- **Prohibited:** Do NOT use `middleware.ts` for localization redirects (middleware does not work in pure SSG exports).
- **Prohibited:** Do NOT use `headers()`, `cookies()`, or server-side redirects.
- **Requirement:** All routes must be statically generating using `generateStaticParams`.

### 2. Internationalization (i18n) Strategy
- **Languages:** `id` (default), `en`.
- **Routing:** Path-based routing is MANDATORY: `/id/docs/...` and `/en/docs/...`.
- **File Structure:** All page logic must reside inside `src/app/[lang]/`.
- **Content:**
  - `filename.mdx` -> Default language (Indonesian).
  - `filename.en.mdx` -> English.

### 3. Folder Structure Blueprint
The file structure must be reorganized to support SSG i18n:

```text
src/
├── app/
│   ├── [lang]/              # Dynamic segment for language
│   │   ├── docs/            # Documentation routes
│   │   │   ├── [[...slug]]/
│   │   │   │   └── page.tsx # Main Docs Page
│   │   │   └── layout.tsx   # Docs Layout (Sidebar etc)
│   │   └── layout.tsx       # Language Provider & HTML wrap
│   ├── layout.tsx           # Global Root Layout (Minimal)
│   └── page.tsx             # Root Redirector (Client-side only)
├── content/
│   └── docs/                # MDX Files
└── lib/
    └── source.ts            # Source configuration

```

---

## 📝 Implementation Code Standards

### A. Configuration (`lib/source.ts`)

Must include the `i18n` object in the loader.

```typescript
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n: {
    defaultLanguage: 'id',
    languages: ['id', 'en'],
  },
});

```

### B. Static Params (`app/[lang]/layout.tsx`)

This is crucial for SSG to build HTML for both languages.

```tsx
export function generateStaticParams() {
  return [
    { lang: 'id' },
    { lang: 'en' },
  ];
}

```

### C. Docs Page Logic (`app/[lang]/docs/[[...slug]]/page.tsx`)

Must fetch the page based on specific language param.

```tsx
export async function generateStaticParams() {
  return source.generateParams();
}

export default async function Page(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();
  // ... render logic
}

```

### D. Root Redirect (`app/page.tsx`)

Since we cannot use middleware, use a Client Component to redirect `/` to `/id`.

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/id/docs');
  }, [router]);
  return null;
}

```

## 🤖 LLM Integration

* Ensure `getLLMText` is properly exported in `source.ts`.
* Ensure an API route or build script exists to generate `llms.txt` if requested.

## ✅ Definition of Done

1. Running `bun run build` succeeds without errors.
2. The `out/` directory contains `id/docs.html` and `en/docs.html`.
3. Navigating to `/id/docs` shows Indonesian content.
4. Navigating to `/en/docs` shows English content.
5. UI styling (Sidebar/Navbar) is consistent across both languages.

