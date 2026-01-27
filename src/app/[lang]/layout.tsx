import { Inter } from 'next/font/google';
import { Provider } from '@/components/provider';
import '@/app/global.css';
import { type ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
});

export function generateStaticParams() {
  return [
    { lang: 'id' },
    { lang: 'en' },
  ];
}

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider locale={lang}>{children}</Provider>
      </body>
    </html>
  );
}
