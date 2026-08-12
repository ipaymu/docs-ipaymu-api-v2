"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function Accordions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-4 my-6", className)}>{children}</div>;
}

export function Accordion({
  title,
  children,
  className,
  ...props
}: {
  title: string;
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  // Use state to handle open/close for animation control
  // We can't use `details` easily for smooth height animation without hacky CSS
  // Switching to div + button pattern
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-sm transition-all duration-200",
        isOpen ? "shadow-brutal dark:shadow-none border-black dark:border-primary" : "",
        className,
      )}
      {...props}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 cursor-pointer font-medium select-none text-sm hover:bg-secondary/50 transition-colors text-left"
        type="button"
      >
        {title}
        <ChevronDown
          className={cn(
            "transition-transform duration-300 w-5 h-5 text-muted-foreground",
            isOpen ? "rotate-180 text-foreground" : "",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 text-sm leading-relaxed text-muted-foreground prose dark:prose-invert max-w-none prose-p:my-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
