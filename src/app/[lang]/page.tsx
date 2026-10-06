import Link from "next/link";
import type { Metadata } from "next";
import { SidebarProvider } from "fumadocs-ui/components/sidebar/base";
import { ArrowRight, ArrowUpRight, Bell, BookOpen, Check, Code2, CreditCard, KeyRound, Plug, ShieldCheck, Terminal } from "lucide-react";
import { HorizontalNavbar } from "@/components/layout/horizontal-navbar";
import { HomeSearch } from "@/components/home-search";
import { HomePaymentExample } from "@/components/home-payment-example";
import { withBasePath } from "@/lib/utils";
import styles from "./home.module.css";

export function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const title = lang === "en" ? "iPaymu API Documentation" : "Dokumentasi API iPaymu";
  const description = lang === "en"
    ? "Start integrating iPaymu payments with a clear setup guide, API examples, and webhook documentation."
    : "Mulai integrasi pembayaran iPaymu dengan panduan awal, contoh API, dan dokumentasi webhook yang jelas.";
  return {
    title, description,
    openGraph: {
      title, description,
      url: `https://ipaymu.github.io${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${lang}`,
      siteName: "iPaymu Documentation", type: "website",
      images: [{ url: withBasePath("/img/ipaymu.webp"), width: 800, height: 400, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [withBasePath("/img/ipaymu.webp")] },
  };
}

const COPY = {
  id: {
    eyebrow: "DOKUMENTASI IPAYMU API V2",
    headline: "Tentukan cara",
    headlineAccent: "pelanggan membayar",
    intro: "Pilih Redirect untuk checkout melalui halaman iPaymu, atau Direct untuk memilih metode pembayaran langsung dari aplikasi Anda.",
    start: "Mulai integrasi", reference: "Lihat referensi API",
    heroNote: "Alur cepat untuk developer",
    heroSteps: ["Siapkan VA & API Key", "Buat signature request", "Kirim request pembayaran", "Validasi callback"],
    pathsEyebrow: "PILIH JALUR", pathsTitle: "Mulai dari kebutuhan Anda",
    pathsIntro: "Dokumentasi disusun berdasarkan pekerjaan yang ingin Anda selesaikan.",
    paths: [
      { title: "Integrasi API", desc: "Siapkan kredensial dan buat pembayaran pertama.", href: "/docs/getting-started", icon: Code2, label: "Panduan awal" },
      { title: "Verifikasi akun", desc: "Lengkapi data merchant agar akun siap digunakan.", href: "/docs/verification", icon: ShieldCheck, label: "Langkah verifikasi" },
      { title: "Plugin CMS", desc: "Hubungkan iPaymu ke platform toko tanpa membangun integrasi dari awal.", href: "/docs-plugins", icon: Plug, label: "Lihat plugin" },
    ],
    stepsEyebrow: "ALUR INTEGRASI", stepsTitle: "Empat langkah sampai pembayaran pertama",
    steps: [
      { title: "Ambil kredensial", desc: "Temukan VA dan API Key di dashboard iPaymu. Gunakan kredensial sandbox untuk pengujian.", href: "/docs/getting-started", link: "Panduan awal", icon: KeyRound },
      { title: "Tandatangani request", desc: "Buat signature HMAC-SHA256 dan sertakan timestamp pada setiap request API.", href: "/docs/signature", link: "Cara membuat signature", icon: Code2 },
      { title: "Pilih alur pembayaran", desc: "Redirect membuka halaman pembayaran iPaymu; Direct menentukan metode dan channel dari aplikasi Anda.", href: "#example-title", link: "Bandingkan dua alur", icon: CreditCard },
      { title: "Tangani callback", desc: "Terima notifikasi status dan validasi signature sebelum memperbarui transaksi.", href: "/docs/callback", link: "Panduan callback", icon: Bell },
    ],
    exampleEyebrow: "DUA CARA MEMBUAT PEMBAYARAN", exampleTitle: "Pilih alur, lihat request-nya",
    exampleIntro: "Endpoint-nya berbeda. Bandingkan contoh Redirect dan Direct sebelum memilih yang cocok untuk aplikasi Anda.",
    moreEyebrow: "LANJUTKAN INTEGRASI",
    moreTitle: "Setelah request pertama berhasil",
    more: [
      { title: "Metode pembayaran", desc: "Lihat kanal dan metode yang tersedia.", href: "/docs/payment/payment-channels", icon: CreditCard },
      { title: "Notifikasi pembayaran", desc: "Pastikan status transaksi diproses dengan aman.", href: "/docs/callback", icon: Bell },
      { title: "Referensi lengkap", desc: "Telusuri seluruh endpoint dan panduan teknis.", href: "/docs", icon: BookOpen },
    ],
    footer: "Dokumentasi iPaymu API V2",
  },
  en: {
    eyebrow: "IPAYMU API V2 DOCUMENTATION",
    headline: "Choose how",
    headlineAccent: "customers pay",
    intro: "Choose Redirect for checkout on an iPaymu page, or Direct to select a payment method right from your app.",
    start: "Start integrating", reference: "Explore API reference",
    heroNote: "A quick path for developers",
    heroSteps: ["Get your VA & API Key", "Sign the request", "Create a payment", "Validate the callback"],
    pathsEyebrow: "CHOOSE A PATH", pathsTitle: "Start with your goal",
    pathsIntro: "The docs are organized around the task you want to complete.",
    paths: [
      { title: "API integration", desc: "Get credentials and create your first payment.", href: "/docs/getting-started", icon: Code2, label: "Getting started" },
      { title: "Account verification", desc: "Complete merchant details to prepare your account.", href: "/docs/verification", icon: ShieldCheck, label: "Verification guide" },
      { title: "CMS plugins", desc: "Connect iPaymu to your store without building from scratch.", href: "/docs-plugins", icon: Plug, label: "Browse plugins" },
    ],
    stepsEyebrow: "INTEGRATION FLOW", stepsTitle: "Four steps to your first payment",
    steps: [
      { title: "Get credentials", desc: "Find your VA and API Key in the iPaymu dashboard. Use sandbox credentials for testing.", href: "/docs/getting-started", link: "Getting started", icon: KeyRound },
      { title: "Sign the request", desc: "Create an HMAC-SHA256 signature and include a timestamp in each API request.", href: "/docs/signature", link: "Signature guide", icon: Code2 },
      { title: "Choose a payment flow", desc: "Redirect opens iPaymu's checkout page; Direct selects the method and channel in your app.", href: "#example-title", link: "Compare both flows", icon: CreditCard },
      { title: "Handle the callback", desc: "Receive status updates and verify their signature before updating a transaction.", href: "/docs/callback", link: "Callback guide", icon: Bell },
    ],
    exampleEyebrow: "TWO WAYS TO CREATE A PAYMENT", exampleTitle: "Choose a flow, see the request",
    exampleIntro: "The endpoints differ. Compare Redirect and Direct examples before choosing the right fit for your app.",
    moreEyebrow: "KEEP BUILDING",
    moreTitle: "After your first request succeeds",
    more: [
      { title: "Payment methods", desc: "Find available methods and channels.", href: "/docs/payment/payment-channels", icon: CreditCard },
      { title: "Payment notifications", desc: "Process transaction status securely.", href: "/docs/callback", icon: Bell },
      { title: "Complete reference", desc: "Browse every endpoint and technical guide.", href: "/docs", icon: BookOpen },
    ],
    footer: "iPaymu API V2 Documentation",
  },
};

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = lang === "en" ? COPY.en : COPY.id;
  const to = (path: string) => `/${lang}${path}`;

  return (
    <div className={styles.home}>
      <SidebarProvider><HorizontalNavbar lang={lang} current="home" showSidebarTrigger={false} /></SidebarProvider>
      <main>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>{t.eyebrow}</p>
                <h1 id="home-title" className={styles.heroTitle}>{t.headline} <span>{t.headlineAccent}</span></h1>
                <p className={styles.heroIntro}>{t.intro}</p>
                <HomeSearch lang={lang} />
                <div className={styles.heroActions}>
                  <Link className={styles.primaryAction} href={to("/docs/getting-started")}>{t.start} <ArrowRight size={17} aria-hidden="true" /></Link>
                  <Link className={styles.secondaryAction} href={to("/docs")}>{t.reference} <ArrowUpRight size={16} aria-hidden="true" /></Link>
                </div>
              </div>
              <div className={styles.heroPanel} aria-label={t.heroNote}>
                <div className={styles.panelTopline}><span className={styles.panelDot} aria-hidden="true" /><span>ipaymu / quickstart</span><Terminal size={16} aria-hidden="true" /></div>
                <div className={styles.panelContent}>
                  <p className={styles.panelCaption}>{t.heroNote}</p>
                  <ol className={styles.heroChecklist}>{t.heroSteps.map((step, index) => <li key={step}><span className={styles.stepIndex}>0{index + 1}</span><span>{step}</span><Check size={15} aria-hidden="true" /></li>)}</ol>
                  <div className={styles.endpointPreview}><span>Redirect <code>POST /api/v2/payment</code></span><span>Direct <code>POST /api/v2/payment/direct</code></span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="paths-title"><div className={styles.container}>
          <p className={styles.eyebrow}>{t.pathsEyebrow}</p><h2 id="paths-title" className={styles.sectionTitle}>{t.pathsTitle}</h2><p className={styles.sectionIntro}>{t.pathsIntro}</p>
          <div className={styles.pathGrid}>{t.paths.map((path) => { const Icon = path.icon; return <Link key={path.href} href={to(path.href)} className={styles.pathCard}><span className={styles.iconCircle}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span><span className={styles.pathTitle}>{path.title}</span><span className={styles.pathDescription}>{path.desc}</span><span className={styles.cardLink}>{path.label} <ArrowRight size={15} aria-hidden="true" /></span></Link>; })}</div>
        </div></section>

        <section className={`${styles.section} ${styles.sectionBorder}`} aria-labelledby="steps-title"><div className={styles.container}>
          <p className={styles.eyebrow}>{t.stepsEyebrow}</p><h2 id="steps-title" className={styles.sectionTitle}>{t.stepsTitle}</h2>
          <div className={styles.stepsGrid}>{t.steps.map((step, index) => { const Icon = step.icon; return <article key={step.href} className={styles.stepCard}><div className={styles.stepHead}><span className={styles.stepNumber}>0{index + 1}</span><span className={styles.iconCircle}><Icon size={21} strokeWidth={1.7} aria-hidden="true" /></span></div><h3>{step.title}</h3><p>{step.desc}</p><Link href={step.href.startsWith("#") ? step.href : to(step.href)} className={styles.inlineLink}>{step.link} <ArrowRight size={15} aria-hidden="true" /></Link></article>; })}</div>
        </div></section>

        <section className={`${styles.section} ${styles.sectionBorder}`} aria-labelledby="example-title"><div className={styles.container}>
          <div className={styles.exampleHeading}><div><p className={styles.eyebrow}>{t.exampleEyebrow}</p><h2 id="example-title" className={styles.sectionTitle}>{t.exampleTitle}</h2><p className={styles.sectionIntro}>{t.exampleIntro}</p></div></div>
          <HomePaymentExample lang={lang} />
        </div></section>

        <section className={`${styles.section} ${styles.sectionBorder}`} aria-labelledby="more-title"><div className={styles.container}>
          <p className={styles.eyebrow}>{t.moreEyebrow}</p><h2 id="more-title" className={styles.sectionTitle}>{t.moreTitle}</h2>
          <div className={styles.moreGrid}>{t.more.map((item) => { const Icon = item.icon; return <Link key={item.href} href={to(item.href)} className={styles.moreLink}><Icon size={20} strokeWidth={1.7} aria-hidden="true" /><span><strong>{item.title}</strong><small>{item.desc}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link>; })}</div>
        </div></section>
      </main>
      <footer className={styles.footer}><div className={styles.container}>© {new Date().getFullYear()} iPaymu · {t.footer}</div></footer>
    </div>
  );
}
