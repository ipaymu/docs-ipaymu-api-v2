import { type ReactNode, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function Steps({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("space-y-8 my-10", className)} {...props}>
      {children}
    </div>
  );
}

export function Step({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  // We can't easily auto-number without CSS counters or context,
  // but for now we'll stick to a styled container.
  // Fumadocs Step usually renders an H3.
  // We'll wrap it style it.

  return (
    <div className={cn("step-item relative pl-8 pb-8 last:pb-0", className)} {...props}>
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border group-last:bg-transparent" />
      <div className="absolute left-[-4px] top-1 w-2 h-2 rounded-full border border-primary bg-background ring-2 ring-background text-[0px]"></div>

      <div className="flex flex-col gap-2 prose dark:prose-invert max-w-none prose-p:my-1 prose-headings:text-base prose-headings:font-bold prose-headings:mb-1">
        {children}
      </div>
    </div>
  );
}
