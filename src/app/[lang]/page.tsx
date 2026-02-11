import Link from "next/link";
import { HorizontalNavbar } from "@/components/layout/horizontal-navbar";
import { SidebarProvider } from "fumadocs-ui/components/sidebar/base";
import { ArrowRight, Code2, Terminal, ShieldCheck, Plug, MessageCircle } from "lucide-react";

export function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

const HOMEPAGE_TEXT = {
  id: {
    hero: {
      headline: "Dokumentasi Pembayaran",
      headlineBreak: "untuk Developer.",
      subheadline:
        "Hub lengkap integrasi iPaymu. API canggih, dokumentasi, dan tools untuk developer.",
      btnApi: "Mulai Integrasi API",
    },
    paths: {
      title: "Dokumentasi Teknis",
      card1: {
        title: "Docs Teknis",
        desc: "Dokumentasi API lengkap untuk integrasi pembayaran custom.",
        link: "/docs",
        icon: Code2,
      },
      card2: {
        title: "Docs Verifikasi",
        desc: "Panduan lengkap proses verifikasi akun dan merchant.",
        link: "/docs/verification",
        icon: ShieldCheck,
      },
      card3: {
        title: "Docs Plugin",
        desc: "Panduan instalasi dan konfigurasi plugin CMS (WooCommerce, dll).",
        link: "/docs-plugins",
        icon: Plug,
      },
    },
    dev: {
      tag: "Developer First",
      title: "Integrasi Pertama dalam Hitungan Menit",
      desc: "API kami dirancang dengan prinsip kesederhanaan. Dapatkan URL pembayaran hanya dengan satu request JSON sederhana.",
      points: [
        "RESTful API Architecture",
        "Sandbox Environment Gratis",
        "Support Multi-Bahasa (PHP, Node, Go, Python)",
        "Webhook Notifikasi Real-time",
      ],
      link: "Lihat API Reference Lengkap",
    },
    support: {
      title: "Bingung Memulai?",
      desc: "Tim support kami siap membantu Anda 24/7. Tanyakan apa saja mulai dari teknis integrasi hingga pendaftaran akun.",
      btn: "Chat Support via WhatsApp",
    },
  },
  en: {
    hero: {
      headline: "Payment Documentation",
      headlineBreak: "for Developers.",
      subheadline:
        "The complete iPaymu integration hub. Advanced APIs, documentation, and tools for developers.",
      btnApi: "Start API Integration",
    },
    paths: {
      title: "Technical Documentation",
      card1: {
        title: "Technical Docs",
        desc: "Complete API documentation for custom payment integration.",
        link: "/docs",
        icon: Code2,
      },
      card2: {
        title: "Verification Docs",
        desc: "Complete guide for account and merchant verification processes.",
        link: "/docs/verification",
        icon: ShieldCheck,
      },
      card3: {
        title: "Plugin Docs",
        desc: "Installation and configuration guides for CMS plugins (WooCommerce, etc).",
        link: "/docs-plugins",
        icon: Plug,
      },
    },
    dev: {
      tag: "Developer First",
      title: "First Integration in Minutes",
      desc: "Our API is designed with simplicity in mind. Get a payment URL with just a single simple JSON request.",
      points: [
        "RESTful API Architecture",
        "Free Sandbox Environment",
        "Multi-Language Support (PHP, Node, Go, Python)",
        "Real-time Webhook Notifications",
      ],
      link: "View Complete API Reference",
    },
    support: {
      title: "Confused Where to Start?",
      desc: "Our support team is ready to help you 24/7. Ask anything from technical integration to account registration.",
      btn: "Chat Support via WhatsApp",
    },
  },
};

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = HOMEPAGE_TEXT[lang as keyof typeof HOMEPAGE_TEXT] || HOMEPAGE_TEXT.id;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SidebarProvider>
        <HorizontalNavbar lang={lang} showSidebarTrigger={false} />
      </SidebarProvider>

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

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in"
              style={{ animationDelay: "100ms" }}
            >
              <Link
                href={`/${lang}/docs`}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                {t.hero.btnApi} <Terminal className="w-5 h-5" />
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
              {/* Card 1: Technical Docs */}
              <Link
                href={`/${lang}${t.paths.card1.link}`}
                className="group p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <t.paths.card1.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {t.paths.card1.title}
                </h3>
                <p className="text-muted-foreground text-sm">{t.paths.card1.desc}</p>
              </Link>

              {/* Card 2: Verification Docs */}
              <Link
                href={`/${lang}${t.paths.card2.link}`}
                className="group p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <t.paths.card2.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {t.paths.card2.title}
                </h3>
                <p className="text-muted-foreground text-sm">{t.paths.card2.desc}</p>
              </Link>

              {/* Card 3: Plugin Docs */}
              <Link
                href={`/${lang}${t.paths.card3.link}`}
                className="group p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <t.paths.card3.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {t.paths.card3.title}
                </h3>
                <p className="text-muted-foreground text-sm">{t.paths.card3.desc}</p>
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
              <p className="text-muted-foreground mb-6 text-lg">{t.dev.desc}</p>

              <ul className="space-y-3 mb-8">
                {t.dev.points.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                      <svg
                        className="w-3 after:h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href={`/${lang}/docs`}
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
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
                      <span className="text-purple-400">curl</span>{" "}
                      <span className="text-green-400">-X</span> POST
                      https://my.ipaymu.com/api/v2/payment/direct \{`\n`}
                      <span className="text-white/50 pl-4"> -H </span>
                      <span className="text-amber-300">"Content-Type: application/json"</span> \
                      {`\n`}
                      <span className="text-white/50 pl-4"> -H </span>
                      <span className="text-amber-300">"va: YOUR_VA"</span> \{`\n`}
                      <span className="text-white/50 pl-4"> -H </span>
                      <span className="text-amber-300">"signature: YOUR_SIGNATURE"</span> \{`\n`}
                      <span className="text-white/50 pl-4"> -d </span>
                      <span className="text-amber-300">{`'
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

        {/* FOOTER SUPPORT BANNER */}
        <section className="py-8 bg-background px-4 md:px-6">
          <div className="container mx-auto">
            <div className="rounded-2xl bg-linear-to-r from-blue-900 to-primary p-8 md:p-12 text-white text-center shadow-xl relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

              <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">
                {t.support.title}
              </h2>
              <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10">{t.support.desc}</p>

              <a
                href="https://wa.me/6281936972473" /* Replace with actual WA link */
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
