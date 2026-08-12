'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { Sun, Moon, Languages, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UnifiedSidebarFooter({ lang }: { lang: string }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = (newLang: string) => {
    setOpen(false);
    if (newLang === lang) return;
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      bottom: window.innerHeight - rect.top + 6,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        open &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Portal Popover - Always renders on top with z-[9999]
  const popoverPortal = open
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={cn(
            'z-[9999] bg-white dark:bg-zinc-950 opacity-100',
            'border-2 border-black dark:border-white',
            'shadow-brutal dark:shadow-[3px_3px_0px_0px_#ffffff]',
            'rounded-none py-1 animate-in fade-in slide-in-from-bottom-2 duration-150'
          )}
        >
          <button
            type="button"
            onClick={() => toggleLanguage('id')}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-left transition-colors cursor-pointer',
              lang === 'id'
                ? 'bg-primary text-white'
                : 'text-foreground hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white'
            )}
          >
            <span className="flex items-center gap-2">
              <span>🇮🇩</span> Bahasa Indonesia
            </span>
            {lang === 'id' && <Check className="w-4 h-4 text-white stroke-[3]" />}
          </button>

          <button
            type="button"
            onClick={() => toggleLanguage('en')}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-left transition-colors cursor-pointer border-t border-border/50',
              lang === 'en'
                ? 'bg-primary text-white'
                : 'text-foreground hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white'
            )}
          >
            <span className="flex items-center gap-2">
              <span>🇬🇧</span> English
            </span>
            {lang === 'en' && <Check className="w-4 h-4 text-white stroke-[3]" />}
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={triggerRef} className="relative w-full z-10">
      {/* Neo-Brutalism Single Unified Sidebar Footer Bar */}
      <div
        className={cn(
          'flex items-center justify-between gap-2 h-10 px-3',
          'bg-background border-2 border-black dark:border-white',
          'shadow-brutal dark:shadow-[2px_2px_0px_0px_#ffffff]',
          'rounded-none text-xs w-full transition-all'
        )}
      >
        {/* Left: Language Select Trigger */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left text-xs font-bold text-foreground focus:outline-none cursor-pointer"
        >
          <Languages className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate flex-1">
            {lang === 'en' ? 'English' : 'Bahasa Indonesia'}
          </span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0',
              open && 'rotate-180 text-primary'
            )}
          />
        </button>

        {/* Right: Theme Toggle with Distinct Active Background Highlight */}
        <div className="flex items-center gap-1 border-l-2 border-black dark:border-white pl-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'p-1.5 rounded-none transition-all cursor-pointer border border-transparent',
              theme !== 'dark'
                ? 'bg-amber-400 text-black border-black font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            aria-label="Light mode"
            title="Mode Terang (Light)"
          >
            <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              'p-1.5 rounded-none transition-all cursor-pointer border border-transparent',
              theme === 'dark'
                ? 'bg-indigo-600 text-white border-white font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            aria-label="Dark mode"
            title="Mode Gelap (Dark)"
          >
            <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {popoverPortal}
    </div>
  );
}
