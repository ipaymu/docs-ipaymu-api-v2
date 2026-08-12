import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/app/global.css";
import { type ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

import { SmoothScroll } from "@/components/smooth-scroll";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
