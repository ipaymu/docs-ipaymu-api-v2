import { cn } from "@/lib/utils";

export function PostmanButton({ className }: { className?: string }) {
    return (
        <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "inline-flex w-fit items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#FF6C37] hover:bg-[#FF6C37]/90 border-2 border-black dark:border-white shadow-brutal dark:shadow-[3px_3px_0px_0px_#ffffff] hover:translate-y-px hover:translate-x-px hover:shadow-brutal-hover dark:hover:shadow-[1px_1px_0px_0px_#ffffff] transition-all rounded-none uppercase tracking-wider no-underline",
                className
            )}
        >
            <img
                src="https://run.pstmn.io/button.svg"
                alt="Postman"
                className="w-4 h-4 mr-2 m-0 p-0 block"
                style={{ filter: "brightness(0) invert(1)" }}
            />
            Test on Postman
        </a>
    );
}
