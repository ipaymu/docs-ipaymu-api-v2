import { cn } from "@/lib/utils";
import { ArrowUpRight, Send } from "lucide-react";

export function PostmanButton({ className, url }: { className?: string, url?: string }) {
    if (!url) return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "inline-flex min-h-9 w-fit items-center justify-center gap-2 rounded-lg border border-[#e65b2b] bg-[#ff6c37] px-3.5 py-2 text-xs font-semibold text-white no-underline shadow-sm transition-colors hover:bg-[#e95c2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6c37]",
                className
            )}
        >
            <Send className="size-3.5" aria-hidden="true" />
            Test on Postman
            <ArrowUpRight className="size-3.5 opacity-80" aria-hidden="true" />
        </a>
    );
}
