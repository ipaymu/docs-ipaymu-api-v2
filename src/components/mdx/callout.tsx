import { type ReactNode, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function Callout({
  children,
  title,
  type = "info",
  className,
  icon,
  ...props
}: {
  type?: "info" | "warn" | "error" | "tip";
  title?: string;
  icon?: ReactNode;
} & ComponentPropsWithoutRef<"div">) {
  let borderColor = "border-blue-500 dark:border-blue-400";
  let iconColor = "text-blue-600 dark:text-blue-400";
  let bgColor = "bg-blue-50 dark:bg-blue-950/30";

  if (type === "error") {
    borderColor = "border-red-500 dark:border-red-400";
    iconColor = "text-red-600 dark:text-red-400";
    bgColor = "bg-red-50 dark:bg-red-950/30";
  } else if (type === "warn") {
    borderColor = "border-orange-500 dark:border-orange-400";
    iconColor = "text-orange-600 dark:text-orange-400";
    bgColor = "bg-orange-50 dark:bg-orange-950/30";
  } else if (type === "tip") {
    borderColor = "border-green-500 dark:border-green-400";
    iconColor = "text-green-600 dark:text-green-400";
    bgColor = "bg-green-50 dark:bg-green-950/30";
  }

  return (
    <div
      className={cn(
        "my-6 p-4 border-l-4 rounded-sm flex items-center gap-4 transition-all hover:bg-opacity-80",
        bgColor,
        borderColor,
        className,
      )}
      {...props}
    >
      <div className={cn(iconColor)}>
        {icon || (
          <span className="font-bold text-lg">
            {type === "info" ? "ⓘ" : type === "warn" ? "⚠" : type === "error" ? "✖" : "✓"}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("font-bold text-sm mb-1 uppercase tracking-wide", iconColor)}>{title}</p>
        )}
        <div className="text-sm text-foreground/80 prose dark:prose-invert max-w-none prose-p:my-1">
          {children}
        </div>
      </div>
    </div>
  );
}
