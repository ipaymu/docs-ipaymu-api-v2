"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SidebarTrigger, useSidebar } from "fumadocs-ui/components/sidebar/base";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface HorizontalNavbarProps {
  lang: string;
}

export function HorizontalNavbar({ lang }: HorizontalNavbarProps) {
  const pathname = usePathname();
  const { open } = useSidebar();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
          {/* Left: Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/${lang}`} className="flex items-center space-x-2">
              <Image
                src="/img/ipaymu-header.webp"
                alt="iPaymu API V2"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Center: Navigation Links - Desktop only */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-6">
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

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            <LanguageSwitcher lang={lang} pathname={pathname} />
            <ThemeToggle />
            {/* Mobile: Show SidebarTrigger */}
            <div className="md:hidden flex items-center">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

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