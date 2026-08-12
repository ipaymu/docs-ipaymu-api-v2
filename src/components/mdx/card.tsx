import Link from "next/link";
import { type ReactNode, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Cards({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 my-6", className)} {...props}>
      {children}
    </div>
  );
}

export function Card({
  title,
  description,
  icon,
  href,
  children,
  className,
  ...props
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  href?: string;
  color?: string; // e.g. "bg-orange-500", "text-purple-300"
} & ComponentPropsWithoutRef<"div">) {
  // Determine colors based on the `color` prop or fall back to default logic
  // If `color` matches a valid Tailwind color class format (e.g. "orange", "purple"), we can construct classes.
  // Alternatively, we can accept direct classes like "text-purple-500".
  // For simplicity and effectiveness given the request, let's assume `color` passes a color name like "purple", "blue", etc.

  let hoverBorderColor = "hover:border-black dark:hover:border-primary";
  let hoverShadowColor = "hover:shadow-brutal dark:hover:shadow-brutal-dark";
  let iconBgHover = "group-hover:bg-primary/10";
  let iconTextHover = "group-hover:text-primary";
  let titleHover = "group-hover:text-primary";

  if (props.color) {
    // Manual mapping for common colors requested or likely to be used
    if (props.color === "purple") {
      hoverBorderColor = "hover:border-purple-500 dark:hover:border-purple-400";
      hoverShadowColor = "hover:shadow-brutal-purple dark:hover:shadow-brutal-purple"; // We need to define these or use arbitrary values
      // Fallback to style injection for arbitrary shadows if needed, but let's stick to border for now
      iconBgHover = "group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30";
      iconTextHover = "group-hover:text-purple-600 dark:group-hover:text-purple-400";
      titleHover = "group-hover:text-purple-600 dark:group-hover:text-purple-400";
    } else if (props.color === "blue") {
      hoverBorderColor = "hover:border-blue-500 dark:hover:border-blue-400";
      iconBgHover = "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30";
      iconTextHover = "group-hover:text-blue-600 dark:group-hover:text-blue-400";
      titleHover = "group-hover:text-blue-600 dark:group-hover:text-blue-400";
    } else if (props.color === "orange") {
      hoverBorderColor = "hover:border-orange-500 dark:hover:border-orange-400";
      iconBgHover = "group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30";
      iconTextHover = "group-hover:text-orange-600 dark:group-hover:text-orange-400";
      titleHover = "group-hover:text-orange-600 dark:group-hover:text-orange-400";
    } else if (props.color === "green") {
      hoverBorderColor = "hover:border-green-500 dark:hover:border-green-400";
      iconBgHover = "group-hover:bg-green-100 dark:group-hover:bg-green-900/30";
      iconTextHover = "group-hover:text-green-600 dark:group-hover:text-green-400";
      titleHover = "group-hover:text-green-600 dark:group-hover:text-green-400";
    }
  }

  const content = (
    <div
      className={cn(
        "p-5 bg-white dark:bg-card-dark border border-border transition-all group h-full flex flex-col rounded-sm",
        hoverBorderColor,
        hoverShadowColor,
        className,
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            "w-10 h-10 bg-secondary dark:bg-secondary/50 border border-border flex items-center justify-center mb-4 rounded-sm transition-colors",
            iconBgHover,
            "group-hover:border-transparent", // hide inner border on hover for cleaner look
          )}
        >
          <div className={cn("text-xl text-muted-foreground transition-colors", iconTextHover)}>
            {icon}
          </div>
        </div>
      )}
      <h3 className={cn("text-lg font-bold mb-2 font-display transition-colors", titleHover)}>
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
      )}
      {children && (
        <div className="text-sm text-muted-foreground leading-relaxed prose dark:prose-invert max-w-none prose-p:my-1">
          {children}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
