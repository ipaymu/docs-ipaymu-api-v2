"use client";

import {
  useState,
  createContext,
  useContext,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
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

  /* 
     Heuristic: proper Tabs always have a defaultValue. 
     If no defaultValue is present, it's likely being used as a simple styled container (text-only),
     so we apply standard padding.
  */
  const isTabGroup = defaultValue !== undefined;

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div
        className={cn(
          "border-2 border-black dark:border-white shadow-brutal dark:shadow-[4px_4px_0px_0px_#ffffff] bg-background rounded-none overflow-hidden my-6 transition-all",
          className,
        )}
        {...props}
      >
        {isTabGroup ? children : <div className="p-6">{children}</div>}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "bg-secondary/20 dark:bg-zinc-900/50 px-4 py-3 flex items-center justify-between border-b-2 border-black dark:border-white",
        className,
      )}
      {...props}
    >
      <div className="flex gap-4 text-xs font-semibold text-muted-foreground uppercase overflow-x-auto no-scrollbar">
        {children}
      </div>
      <Copy className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
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
        "tabs-content bg-background text-sm overflow-x-auto rounded-none animate-fade-in",
        className,
      )}
      {...props}
    >
      <div className="p-6 font-mono min-w-full w-fit">{children}</div>
    </div>
  );
}
