"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bot, ChevronDown, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const PROMPT = `I'm looking at this iPaymu documentation: https://ipaymu.github.io/docs-ipaymu-api-v2/llms-full.txt.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.`;

const AI_PROVIDERS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    color: "bg-[#10a37f]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
  },
  {
    id: "claude",
    name: "Claude",
    url: "https://claude.ai/new",
    color: "bg-[#d97757]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.304 3.542l-5.358 16.916H9.698L15.056 3.542h2.248zm-8.138 0L3.808 20.458H6.12l5.358-16.916H9.166zM20.25 6.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5zm-16.5 0a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5z" />
      </svg>
    ),
  },
];

export function AIChatButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.right - 200,
      width: 200,
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        open &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleOpen(provider: (typeof AI_PROVIDERS)[number]) {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopied(true);
      setToast(true);
      setTimeout(() => {
        setCopied(false);
        setToast(false);
      }, 3000);
    } catch {}

    window.open(provider.url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  const toastPortal = toast
    ? createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 text-sm font-medium",
              "bg-white dark:bg-zinc-900 border-2 border-black dark:border-white",
              "shadow-brutal dark:shadow-[3px_3px_0px_0px_#ffffff]",
              "rounded-none animate-in slide-in-from-bottom-4 fade-in duration-200"
            )}
          >
            <Check className="w-4 h-4 text-green-500" />
            Prompt copied! Paste it in the AI chat.
          </div>
        </div>,
        document.body
      )
    : null;

  const dropdown = open ? (
    createPortal(
      <div
        ref={dropdownRef}
        style={dropdownStyle}
        className={cn(
          "z-[9999] min-w-[200px]",
          "border-2 border-black dark:border-white",
          "shadow-brutal dark:shadow-[3px_3px_0px_0px_#ffffff]",
          "bg-white dark:bg-zinc-900 rounded-none overflow-hidden"
        )}
      >
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
          Open in
        </div>
        {AI_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleOpen(provider)}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium",
              "hover:bg-muted/50 transition-colors text-left cursor-pointer"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-sm text-white",
                provider.color
              )}
            >
              {provider.icon}
            </span>
            {provider.name}
          </button>
        ))}
        <div className="border-t border-border">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(PROMPT);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {}
            }}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium",
              "hover:bg-muted/50 transition-colors text-left text-muted-foreground cursor-pointer"
            )}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy prompt only"}
          </button>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex w-fit items-center justify-center px-4 py-2 text-xs font-bold",
          "text-white bg-blue-600 hover:bg-blue-600/90",
          "border-2 border-black dark:border-white",
          "shadow-brutal dark:shadow-[3px_3px_0px_0px_#ffffff]",
          "hover:translate-y-px hover:translate-x-px",
          "hover:shadow-brutal-hover dark:hover:shadow-[1px_1px_0px_0px_#ffffff]",
          "transition-all rounded-none uppercase tracking-wider gap-2",
          className
        )}
      >
        <Bot className="w-4 h-4" />
        Chat with AI
        <ChevronDown
          className={cn("w-3 h-3 transition-transform", open && "rotate-180")}
        />
      </button>
      {dropdown}
      {toastPortal}
    </>
  );
}
