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
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 fixed top-0 left-0 right-0 z-50 h-14">
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
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.url || pathname.startsWith(item.url + "/")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.text}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.url || pathname.startsWith(item.url + "/")
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.text}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}