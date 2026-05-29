"use client";

import {
  useState,
  createContext,
  useContext,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
  depth: number;
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

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, depth }}>
      <div
        className={cn(
          !isNested && "border-2 border-black dark:border-white shadow-brutal dark:shadow-[4px_4px_0px_0px_#ffffff] my-6",
          isNested && "border-none my-0",
          "bg-background rounded-none overflow-hidden transition-all flex flex-col",
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

  return (
    <div
      className={cn(
        "bg-secondary/20 dark:bg-zinc-900/50 px-4 py-3 flex items-center justify-between border-b-2 border-black dark:border-white",
        isNested && "bg-secondary/10 dark:bg-zinc-900/30",
        className,
      )}
      {...props}
    >
      <div className="flex gap-4 text-xs font-semibold text-muted-foreground uppercase overflow-x-auto no-scrollbar w-full">
        {children}
      </div>
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
        "tabs-content bg-background text-sm rounded-none animate-fade-in outline-none",
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
