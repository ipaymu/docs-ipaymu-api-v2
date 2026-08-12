'use client';

import React, { useState, useEffect } from 'react';
import { Callout } from "fumadocs-ui/components/callout";

export function DanaNoticeCallout({ lang = 'id', isRedirect = false }: { lang?: string; isRedirect?: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only for 2 weeks starting from August 12, 2026 to August 26, 2026
    const startDate = new Date('2026-08-12T00:00:00Z');
    const endDate = new Date('2026-08-26T23:59:59Z');
    const now = new Date();

    if (now >= startDate && now <= endDate) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const targetLink = isRedirect ? './direct-payment#e-wallet' : '#e-wallet';

  if (lang === 'en') {
    return (
      <Callout type="info" title="New Payment Channel">
        iPaymu has added a new e-Wallet payment channel: <strong>DANA</strong> (<code>dana</code>).{' '}
        <a href={targetLink} className="underline font-bold">
          Click here to view the e-Wallet payment guide
        </a>.
      </Callout>
    );
  }

  return (
    <Callout type="info" title="Update Kanal Pembayaran">
      iPaymu resmi menambahkan kanal pembayaran e-Wallet baru: <strong>DANA</strong> (<code>dana</code>).{' '}
      <a href={targetLink} className="underline font-bold">
        Klik di sini untuk melihat panduan pembayaran e-Wallet
      </a>.
    </Callout>
  );
}
