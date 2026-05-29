'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { withBasePath } from '@/lib/utils';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(withBasePath('/id/docs'));
  }, [router]);
  return null;
}
