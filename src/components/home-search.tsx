"use client";

import { Search } from "lucide-react";
import { useSearchContext } from "fumadocs-ui/contexts/search";

export function HomeSearch({ lang }: { lang: string }) {
  const { setOpenSearch } = useSearchContext();

  return (
    <button type="button" className="home-search-trigger" onClick={() => setOpenSearch(true)}>
      <Search size={18} aria-hidden="true" />
      <span>{lang === "en" ? "Search the documentation..." : "Cari di dokumentasi..."}</span>
      <kbd>Ctrl K</kbd>
    </button>
  );
}
