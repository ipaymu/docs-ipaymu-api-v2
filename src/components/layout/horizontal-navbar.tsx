"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

interface HorizontalNavbarProps {
  lang: string;
}

export function HorizontalNavbar({ lang }: HorizontalNavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { text: "Beranda", url: `/${lang}` },
    { text: "Dokumentasi", url: `/${lang}/docs` },
    { text: "Verifikasi", url: `/${lang}/verification` },
    { text: "API Reference", url: `/${lang}/docs/api` },
    { text: "Tutorial", url: `/${lang}/docs/tutorial` },
    { text: "Support", url: `/${lang}/docs/support` },
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 fixed top-0 z-50 h-14 w-full">
      <div className="container mx-auto px-4 h-full">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/img/ipaymu-header.webp"
              alt="iPaymu API V2"
              width={100}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.url || pathname.startsWith(item.url + "/")
                  ? "text-primary"
                  : "text-muted-foreground"
                  }`}
              >
                {item.text}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher lang={lang} pathname={pathname} />
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 w-full h-[calc(100vh-3.5rem)] bg-background border-b border-border shadow-lg animate-in slide-in-from-top-2 duration-200 z-50 overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.url || pathname.startsWith(item.url + "/")
                    ? "bg-accent/50 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.text}
                </Link>
              ))}
              <div className="pt-4 border-t border-border mt-2 space-y-4">
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm font-medium text-muted-foreground">Tampilan</span>
                  <div className="flex bg-accent/30 rounded-lg p-1">
                    <ThemeToggle />
                  </div>
                </div>
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm font-medium text-muted-foreground">Bahasa</span>
                  <LanguageSwitcher lang={lang} pathname={pathname} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

import { Moon, Sun, Languages } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent text-muted-foreground transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

function LanguageSwitcher({ lang, pathname }: { lang: string; pathname: string }) {
  const router = useRouter();

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "id" : "en";
    // Replace the first occurrence of the current lang in the path
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent text-muted-foreground transition-colors"
      aria-label="Switch language"
    >
      <span className="text-xs font-bold uppercase">{lang}</span>
    </button>
  );
}