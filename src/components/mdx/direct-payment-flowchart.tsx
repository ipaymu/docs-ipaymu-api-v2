'use client';

import React, { useState } from 'react';
import {
  Send,
  ShieldCheck,
  QrCode,
  CreditCard,
  BellRing,
  CheckCircle2,
  Workflow,
  LayoutGrid,
  ListOrdered,
  ArrowRight,
  Check,
} from 'lucide-react';

interface StepItem {
  id: number;
  title: { id: string; en: string };
  desc: { id: string; en: string };
  badge?: string;
  icon: React.ReactNode;
  accentBg: string;
  badgeStyle: string;
  isLastStep?: boolean;
}

const DIRECT_STEPS: StepItem[] = [
  {
    id: 1,
    title: { id: 'Request Direct Payment', en: 'Request Direct Payment' },
    desc: {
      id: 'Merchant mengirim HTTP POST ke /api/v2/payment/direct berisi detail transaksi, paymentMethod & paymentChannel.',
      en: 'Merchant sends HTTP POST to /api/v2/payment/direct with transaction details, paymentMethod & paymentChannel.',
    },
    badge: 'POST Direct',
    icon: <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    accentBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    badgeStyle: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    id: 2,
    title: { id: 'Validasi & Proses iPaymu', en: 'iPaymu Processing' },
    desc: {
      id: 'Server iPaymu memverifikasi signature header & membuat nomor pembayaran / QR / URL e-Wallet.',
      en: 'iPaymu server verifies signature header & generates payment number / QR / e-Wallet URL.',
    },
    badge: 'API Validation',
    icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    accentBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
    badgeStyle: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    id: 3,
    title: { id: 'Terima Respon Pembayaran', en: 'Receive Payment Response' },
    desc: {
      id: 'iPaymu mengembalikan PaymentNo (Virtual Account) atau Url redirect/QR (e-Wallet/QRIS) kepada Merchant.',
      en: 'iPaymu returns PaymentNo (VA) or Url/QR (e-Wallet/QRIS) to the Merchant.',
    },
    badge: '200 OK Response',
    icon: <QrCode className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    accentBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    id: 4,
    title: { id: 'Pelanggan Melakukan Pembayaran', en: 'Customer Completes Payment' },
    desc: {
      id: 'Pelanggan membayar via M-Banking / minimarket / scan QRIS / buka aplikasi e-Wallet.',
      en: 'Customer pays via M-Banking / convenience store / scan QRIS / open e-Wallet app.',
    },
    badge: 'Payment Action',
    icon: <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    badgeStyle: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 5,
    title: { id: 'Notifikasi Webhook (Callback)', en: 'Webhook Callback Notification' },
    desc: {
      id: 'iPaymu secara otomatis mengirimkan HTTP POST notifikasi callback ke notifyUrl Merchant.',
      en: 'iPaymu automatically sends HTTP POST callback notification to Merchant notifyUrl.',
    },
    badge: 'HTTP POST Callback',
    icon: <BellRing className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    accentBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
    badgeStyle: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  {
    id: 6,
    title: { id: 'Update Status Transaksi', en: 'Order Status Updated' },
    desc: {
      id: 'Merchant mengunci status transaksi menjadi PAID di database & memberikan produk/layanan.',
      en: 'Merchant updates order status to PAID in database & delivers product/service.',
    },
    badge: 'PAID Completed',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    badgeStyle: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    isLastStep: true,
  },
];

export function DirectPaymentFlowchart({ lang = 'id' }: { lang?: 'id' | 'en' }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const isEn = lang === 'en';
  const totalSteps = DIRECT_STEPS.length;

  return (
    <div className="my-8 w-full font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 text-primary border border-primary/20">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-none tracking-tight">
              {isEn ? 'Direct Payment Integration Flow' : 'Alur Integrasi Pembayaran Langsung (Direct)'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isEn
                ? '6 sequential steps from API request to payment completion'
                : '6 tahapan dari request API pembayaran hingga konfirmasi lunas'}
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-secondary/60 border border-border text-xs">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1 font-medium transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-sm font-semibold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1 font-medium transition-all cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-background text-foreground shadow-sm font-semibold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIRECT_STEPS.map((step) => {
            const isActive = activeStep === step.id;
            const isFinal = step.isLastStep || step.id === totalSteps;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(isActive ? null : step.id)}
                className={`group relative p-4.5 bg-background border-2 border-black dark:border-white shadow-brutal dark:shadow-[3px_3px_0px_0px_#ffffff] transition-all cursor-pointer hover:-translate-y-0.5 flex flex-col justify-between min-h-[200px] ${
                  isActive ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 h-6">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 h-6 inline-flex items-center bg-black text-white dark:bg-white dark:text-black">
                      Step {step.id}
                    </span>

                    {step.badge && (
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 h-6 inline-flex items-center border whitespace-nowrap ${step.badgeStyle}`}>
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3 mb-2 min-h-[44px]">
                    <div className={`p-2 border border-border/80 shrink-0 w-9 h-9 flex items-center justify-center ${step.accentBg}`}>
                      {step.icon}
                    </div>
                    <h4 className="font-bold text-sm leading-snug pt-0.5 flex-1">
                      {isEn ? step.title.en : step.title.id}
                    </h4>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    {isEn ? step.desc.en : step.desc.id}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-dashed border-border flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">
                    {step.id} of {totalSteps}
                  </span>

                  {isFinal ? (
                    <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span className="text-[10px]">DONE</span>
                    </div>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Timeline View */
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {DIRECT_STEPS.map((step) => {
            const isActive = activeStep === step.id;
            const isFinal = step.isLastStep || step.id === totalSteps;

            return (
              <div key={step.id} className="relative">
                <div
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                  className={`absolute -left-6 sm:-left-8 top-2.5 w-6 h-6 sm:w-8 sm:h-8 font-mono font-bold text-xs flex items-center justify-center border-2 border-black dark:border-white shadow-sm cursor-pointer transition-transform hover:scale-110 ${step.accentBg}`}
                >
                  {step.id}
                </div>

                <div
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                  className={`p-4 bg-background border-2 border-black dark:border-white shadow-brutal dark:shadow-[3px_3px_0px_0px_#ffffff] transition-all cursor-pointer ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 border border-border w-8 h-8 flex items-center justify-center ${step.accentBg}`}>
                        {step.icon}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base">
                        {isEn ? step.title.en : step.title.id}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {step.badge && (
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 border ${step.badgeStyle}`}>
                          {step.badge}
                        </span>
                      )}

                      {isFinal && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-600 text-white flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>DONE</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-10">
                    {isEn ? step.desc.en : step.desc.id}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
