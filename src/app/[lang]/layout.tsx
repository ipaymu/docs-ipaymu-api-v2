import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Provider } from "@/components/provider";
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

export function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

import { SmoothScroll } from "@/components/smooth-scroll";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html
      lang={lang}
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <SmoothScroll />
        <Provider locale={lang}>{children}</Provider>
      </body>
    </html>
  );
}
