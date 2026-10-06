"use client";

import {
  useState,
  createContext,
  useContext,
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
  depth: number;
  isLanguage: boolean;
  isFormat: boolean;
} | null>(null);

export function Tabs({
  defaultValue,
  children,
  className,
  persist,
  groupId,
  ...props
}: {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  persist?: any;
  groupId?: any;
} & ComponentPropsWithoutRef<"div">) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const context = useContext(TabsContext);
  const depth = context ? context.depth + 1 : 0;
  const isNested = depth > 0;
  const isLanguage = groupId === "language";
  const isFormat = groupId === "format";

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, depth, isLanguage, isFormat }}>
      <div
        className={cn(
          !isNested && "my-6",
          isNested && "border-none my-0",
          "docs-code-tabs bg-background rounded-xl border border-border shadow-sm overflow-hidden transition-all flex flex-col",
          isLanguage && "docs-language-tabs",
          isFormat && "docs-format-tabs",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  const context = useContext(TabsContext);
  const isNested = context ? context.depth > 0 : false;
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => child as ReactElement<{ value?: string; children?: ReactNode }>)
    .filter((child) => typeof child.props.value === "string");

  return (
    <div
      className={cn(
        "bg-secondary/20 dark:bg-zinc-900/50 px-4 py-3 flex items-center justify-between border-b border-border",
        isNested && "bg-secondary/10 dark:bg-zinc-900/30",
        className,
      )}
      {...props}
    >
      {(context?.isLanguage || context?.isFormat) && options.length > 1 ? (
        <>
          {context.isLanguage ? (
            <span className="docs-terminal-lights" aria-hidden="true"><i /><i /><i /></span>
          ) : (
            <span className="docs-format-label text-xs font-medium">Format</span>
          )}
          <label className="docs-language-select">
            <span className="sr-only">{context.isLanguage ? "Programming language" : "Payload format"}</span>
            <select value={context.activeTab} onChange={(event) => context.setActiveTab(event.target.value)}>
              {options.map((option) => <option key={option.props.value} value={option.props.value}>{option.props.children}</option>)}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
        </>
      ) : (
        <div className="flex gap-4 text-xs font-semibold text-muted-foreground uppercase overflow-x-auto no-scrollbar w-full">
          {children}
        </div>
      )}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  ...props
}: {
  value: string;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"button">) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "cursor-pointer transition-all whitespace-nowrap pb-0.5",
        isActive
          ? "text-black dark:text-white border-b-2 border-primary opacity-100 font-bold"
          : "text-muted-foreground hover:text-black dark:hover:text-white font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
  ...props
}: {
  value: string;
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"div">) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div
      className={cn(
        "tabs-content bg-background text-sm animate-fade-in outline-none",
        "[&_.mdx-pre-wrapper]:my-0 [&_.mdx-pre-wrapper]:border-0 [&_.mdx-pre-wrapper]:shadow-none",
        "[&_.mdx-table-wrapper]:my-0 [&_.mdx-table-wrapper]:border-0 [&_.mdx-table-wrapper]:shadow-none",
        className,
      )}
      {...props}
    >
      <div className={cn("w-full overflow-x-auto", !className?.includes("p-") && "p-6")}>
        {children}
      </div>
    </div>
  );
}
