'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCheck,
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

const VALIDATION_STEPS: StepItem[] = [
  {
    id: 1,
    title: { id: 'Ajukan Penambahan Domain', en: 'Request an Additional Domain' },
    desc: {
      id: 'Buka https://my.ipaymu.com/domain, isi domain dan keterangannya. Domain ini untuk URL aplikasi seperti successUrl, cancelUrl, returnUrl, dan notifyUrl.',
      en: 'Open https://my.ipaymu.com/domain and enter the domain and its purpose. Use it for application URLs such as successUrl, cancelUrl, returnUrl, and notifyUrl.',
    },
    badge: 'Domain Request',
    icon: <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    accentBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    id: 2,
    title: { id: 'Menunggu Verifikasi Domain', en: 'Wait for Domain Verification' },
    desc: {
      id: 'Tim iPaymu memeriksa pengajuan domain maksimal 2 hari kerja.',
      en: 'The iPaymu team reviews the domain request within a maximum of 2 business days.',
    },
    badge: 'Verification',
    icon: <CheckCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    badgeStyle: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 3,
    title: { id: 'Domain Aktif Setelah Disetujui', en: 'Domain Becomes Active After Approval' },
    desc: {
      id: 'Setelah disetujui, domain dapat digunakan pada URL aplikasi yang didaftarkan.',
      en: 'Once approved, the domain can be used for the registered application URLs.',
    },
    badge: 'Verified Approved',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    badgeStyle: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
];

export function IpDomainValidationFlowchart({ lang = 'id' }: { lang?: 'id' | 'en' }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const isEn = lang === 'en';
  const totalSteps = VALIDATION_STEPS.length;

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
              {isEn ? 'Additional Domain Request' : 'Request Penambahan Domain'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isEn
                ? '3 steps to request and activate an additional domain'
                : '3 tahapan request dan aktivasi domain tambahan'}
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
          {VALIDATION_STEPS.map((step) => {
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
                      <span className="text-[10px]">VERIFIED</span>
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
          {VALIDATION_STEPS.map((step) => {
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
                          <span>VERIFIED</span>
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
