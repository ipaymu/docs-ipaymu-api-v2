import Link from "next/link";
import { HorizontalNavbar } from "@/components/layout/horizontal-navbar";
import { ArrowRight, Code2, ShoppingBag, QrCode, Terminal, MessageCircle } from "lucide-react";

export function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

const HOMEPAGE_TEXT = {
  id: {
    hero: {
      headline: "Dokumentasi Pembayaran",
      headlineBreak: "untuk Semua.",
      subheadline: "Hub lengkap integrasi iPaymu. Mulai dari API canggih untuk developer hingga solusi tanpa koding untuk UMKM.",
      btnApi: "Mulai Integrasi API",
      btnUmkm: "Panduan Tanpa Koding (UMKM)"
    },
    paths: {
      title: "Pilih Jalur Anda",
      card1: { title: "Developer & API", desc: "Bangun aplikasi custom dengan API lengkap dan SDK kami. Dokumentasi teknis mendalam." },
      card2: { title: "Pengguna CMS/Plugin", desc: "Panduan integrasi untuk WooCommerce, Shopify, Magento, dan platform e-commerce lainnya." },
      card3: { title: "Penjual Medsos (UMKM)", desc: "Terima pembayaran via WhatsApp/IG menggunakan Payment Link dan QRIS. Tanpa website." }
    },
    dev: {
      tag: "Developer First",
      title: "Integrasi Pertama dalam Hitungan Menit",
      desc: "API kami dirancang dengan prinsip kesederhanaan. Dapatkan URL pembayaran hanya dengan satu request JSON sederhana.",
      points: [
        "RESTful API Architecture",
        "Sandbox Environment Gratis",
        "Support Multi-Bahasa (PHP, Node, Go, Python)",
        "Webhook Notifikasi Real-time"
      ],
      link: "Lihat API Reference Lengkap"
    },
    umkm: {
      tag: "Bisnis & UMKM",
      title: "Satu Integrasi untuk Semua Metode Pembayaran",
      desc: "Tidak perlu memikirkan teknis bank. Cukup satu akun iPaymu, pelanggan Anda bisa membayar lewat Transfer Bank, QRIS, Indomaret, hingga Kartu Kredit.",
      link: "Lihat daftar lengkap metode pembayaran"
    },
    support: {
      title: "Bingung Memulai?",
      desc: "Tim support kami siap membantu Anda 24/7. Tanyakan apa saja mulai dari teknis integrasi hingga pendaftaran akun.",
      btn: "Chat Support via WhatsApp"
    }
  },
  en: {
    hero: {
      headline: "Payment Documentation",
      headlineBreak: "for Everyone.",
      subheadline: "The complete iPaymu integration hub. From advanced APIs for developers to no-code solutions for MSMEs.",
      btnApi: "Start API Integration",
      btnUmkm: "No-Code Guide (MSME)"
    },
    paths: {
      title: "Choose Your Path",
      card1: { title: "Developer & API", desc: "Build custom apps with our complete API and SDKs. In-depth technical documentation." },
      card2: { title: "CMS/Plugin Users", desc: "Integration guides for WooCommerce, Shopify, Magento, and other e-commerce platforms." },
      card3: { title: "Social Sellers (MSME)", desc: "Accept payments via WhatsApp/IG using Payment Links and QRIS. No website needed." }
    },
    dev: {
      tag: "Developer First",
      title: "First Integration in Minutes",
      desc: "Our API is designed with simplicity in mind. Get a payment URL with just a single simple JSON request.",
      points: [
        "RESTful API Architecture",
        "Free Sandbox Environment",
        "Multi-Language Support (PHP, Node, Go, Python)",
        "Real-time Webhook Notifications"
      ],
      link: "View Complete API Reference"
    },
    umkm: {
      tag: "Business & MSME",
      title: "One Integration for All Payment Methods",
      desc: "No need to worry about bank technicalities. With just one iPaymu account, your customers can pay via Bank Transfer, QRIS, Indomaret, to Credit Cards.",
      link: "View full list of payment methods"
    },
    support: {
      title: "Confused Where to Start?",
      desc: "Our support team is ready to help you 24/7. Ask anything from technical integration to account registration.",
      btn: "Chat Support via WhatsApp"
    }
  }
};

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = HOMEPAGE_TEXT[lang as keyof typeof HOMEPAGE_TEXT] || HOMEPAGE_TEXT.id;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HorizontalNavbar lang={lang} />

      <main className="flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="relative py-20 lg:py-32 overflow-hidden px-4 md:px-6">
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-blue-200 animate-fade-in">
              {t.hero.headline} <br className="hidden md:block" /> {t.hero.headlineBreak}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-in">
              {t.hero.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in" style={{ animationDelay: "100ms" }}>
              <Link
                href={`/${lang}/docs`}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                {t.hero.btnApi} <Terminal className="w-5 h-5" />
              </Link>
              <Link
                href={`/${lang}/docs/tutorial`}
                className="w-full sm:w-auto px-8 py-3 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-accent transition-all font-medium flex items-center justify-center gap-2"
              >
                {t.hero.btnUmkm} <ShoppingBag className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        </section>

        {/* CARD GRID SECTION */}
        <section className="py-16 bg-muted/30 border-y border-border px-4 md:px-6">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">{t.paths.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Developer */}
              <Link href={`/${lang}/docs`} className="group p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{t.paths.card1.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {t.paths.card1.desc}
                </p>
              </Link>

              {/* Card 2: CMS/Plugin */}
              <Link href={`/${lang}/docs-plugins`} className="group p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{t.paths.card2.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {t.paths.card2.desc}
                </p>
              </Link>

              {/* Card 3: Social/UMKM */}
              <Link href={`/${lang}/docs/tutorial`} className="group p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{t.paths.card3.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {t.paths.card3.desc}
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* DEVELOPER HOOK (CODE) */}
        <section className="py-20 px-4 md:px-6">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
                <Terminal className="w-3 h-3" /> {t.dev.tag}
              </div>
              <h2 className="text-3xl font-bold mb-4">{t.dev.title}</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                {t.dev.desc}
              </p>

              <ul className="space-y-3 mb-8">
                {t.dev.points.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                      <svg className="w-3 after:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href={`/${lang}/docs/api`} className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                {t.dev.link} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Code Block Mockup */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl border border-white/10">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#252526]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="ml-2 text-xs text-white/40 font-mono">bash</div>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="font-mono text-sm leading-relaxed">
                    <code className="language-bash">
                      <span className="text-purple-400">curl</span> <span className="text-green-400">-X</span> POST https://my.ipaymu.com/api/v2/payment/direct \{`\n`}
                      <span className="text-white/50 pl-4">  -H </span><span className="text-amber-300">"Content-Type: application/json"</span> \{`\n`}
                      <span className="text-white/50 pl-4">  -H </span><span className="text-amber-300">"va: YOUR_VA"</span> \{`\n`}
                      <span className="text-white/50 pl-4">  -H </span><span className="text-amber-300">"signature: YOUR_SIGNATURE"</span> \{`\n`}
                      <span className="text-white/50 pl-4">  -d </span><span className="text-amber-300">{`'
                        "name": "Buyer",
                        "phone": "08123456789",
                        "email": "buyer@mail.com",
                        "amount": 100000,
                        "paymentMethod": "qris"
                      }'`}</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UMKM HOOK (TRUST SIGNALS) */}
        <section className="py-20 bg-primary/5 border-y border-border/50 px-4 md:px-6">
          <div className="container mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold mb-6">
              <ShoppingBag className="w-3 h-3" /> {t.umkm.tag}
            </div>
            <h2 className="text-3xl font-bold mb-6">{t.umkm.title}</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t.umkm.desc}
            </p>

            {/* Payment Logos Grid Placeholder */}
            {/* Ideally replace these divs with actual img tags if assets exist */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Quick Mockups for logos */}
              <div className="font-bold text-xl md:text-2xl text-slate-600 dark:text-slate-300">QRIS</div>
              <div className="font-bold text-xl md:text-2xl text-slate-600 dark:text-slate-300">BCA</div>
              <div className="font-bold text-xl md:text-2xl text-slate-600 dark:text-slate-300">Mandiri</div>
              <div className="font-bold text-xl md:text-2xl text-slate-600 dark:text-slate-300">BNI</div>
              <div className="font-bold text-xl md:text-2xl text-slate-600 dark:text-slate-300">BRI</div>
              <div className="font-bold text-xl md:text-2xl text-slate-600 dark:text-slate-300">Indomaret</div>
              <div className="font-bold text-xl md:text-2xl text-slate-600 dark:text-slate-300">Alfamart</div>
              <div className="font-bold text-xl md:text-2xl text-slate-600 dark:text-slate-300">OVO</div>
              <div className="font-bold text-xl md:text-2xl text-slate-600 dark:text-slate-300">ShopeePay</div>
            </div>

            <div className="mt-12">
              <Link href={`/${lang}/docs/tutorial`} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors border-b border-dashed border-muted-foreground/30 hover:border-primary">
                {t.umkm.link} &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER SUPPORT BANNER */}
        <section className="py-8 bg-background px-4 md:px-6">
          <div className="container mx-auto">
            <div className="rounded-2xl bg-linear-to-r from-blue-900 to-primary p-8 md:p-12 text-white text-center shadow-xl relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

              <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">{t.support.title}</h2>
              <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10">
                {t.support.desc}
              </p>

              <a
                href="https://wa.me/6281234567890" /* Replace with actual WA link */
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full font-bold hover:bg-blue-50 transition-colors relative z-10 shadow-lg"
              >
                <MessageCircle className="w-5 h-5 fill-current" /> {t.support.btn}
              </a>
            </div>

            <footer className="mt-16 text-center text-sm text-muted-foreground pb-8">
              <p>&copy; {new Date().getFullYear()} iPaymu. All rights reserved.</p>
            </footer>
          </div>
        </section>

      </main>
    </div>
  );
}
