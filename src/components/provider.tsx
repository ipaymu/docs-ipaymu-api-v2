'use client';
import SearchDialog from '@/components/search';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { type ReactNode } from 'react';

export function Provider({ children, locale }: { children: ReactNode; locale: string }) {
  return (
    <RootProvider
      search={{ SearchDialog }}
      i18n={{
        locale,
        locales: [
          { locale: 'en', name: 'English' },
          { locale: 'id', name: 'Bahasa Indonesia' },
        ],
      }}
    >
      {children}
    </RootProvider>
  );
}
