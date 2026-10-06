"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { HomeCodeExample } from "@/components/home-code-example";
import { ParameterTooltip } from "@/components/parameter-tooltip";
import styles from "@/app/[lang]/home.module.css";

type Flow = "redirect" | "direct";
type Parameter = { name: string; detail: string; hint: string };

const REQUESTS: Record<Flow, string> = {
  redirect: `curl -X POST https://sandbox.ipaymu.com/api/v2/payment \\
  -H "Content-Type: application/json" \\
  -H "va: YOUR_VA" \\
  -H "signature: GENERATED_SIGNATURE" \\
  -H "timestamp: YYYYMMDDHHmmss" \\
  -d '{
    "product": ["Example Product"],
    "qty": ["1"],
    "price": ["100000"],
    "description": ["First order"],
    "returnUrl": "https://example.com/success",
    "notifyUrl": "https://example.com/webhook",
    "cancelUrl": "https://example.com/cancel"
  }'`,
  direct: `curl -X POST https://sandbox.ipaymu.com/api/v2/payment/direct \\
  -H "Content-Type: application/json" \\
  -H "va: YOUR_VA" \\
  -H "signature: GENERATED_SIGNATURE" \\
  -H "timestamp: YYYYMMDDHHmmss" \\
  -d '{
    "name": "Buyer",
    "phone": "08123456789",
    "email": "buyer@example.com",
    "amount": 100000,
    "notifyUrl": "https://example.com/webhook",
    "paymentMethod": "va",
    "paymentChannel": "bca",
    "product": ["Example Product"],
    "qty": [1],
    "price": [100000]
  }'`,
};

const CONTENT: Record<"id" | "en", {
  selectorLabel: string;
  docsLink: string;
  title: string;
  intro: string;
  signatureLink: string;
  flows: Record<Flow, { label: string; endpoint: string; summary: string; result: string; docs: string; parameters: Parameter[] }>;
}> = {
  id: {
    selectorLabel: "Pilih jenis pembayaran",
    docsLink: "Buka dokumentasi endpoint",
    title: "Yang perlu disiapkan",
    intro: "Bagian penting dari request ini:",
    signatureLink: "Pelajari signature",
    flows: {
      redirect: {
        label: "Redirect Payment", endpoint: "/api/v2/payment",
        summary: "Pembeli memilih metode di halaman pembayaran iPaymu.",
        result: "Respons berisi URL checkout untuk diarahkan ke pembeli.",
        docs: "/docs/payment/redirect-payment",
        parameters: [
          { name: "va + signature", detail: "Identitas merchant dan tanda tangan request.", hint: "VA adalah nomor Virtual Account merchant dari dashboard iPaymu. Signature dibuat dengan HMAC-SHA256 dari metode HTTP, VA, hash body request, dan API Key. Buat signature baru untuk setiap request; kredensial Sandbox dan Production berbeda." },
          { name: "timestamp", detail: "Waktu request untuk validasi signature.", hint: "Isi header timestamp dengan waktu saat request dibuat. Format umum API v2: YYYYMMDDHHmmss, misalnya 20261006153045. Beberapa endpoint menerima ISO 8601; ikuti format pada halaman endpoint." },
          { name: "product · qty · price", detail: "Detail produk dan nominal pembayaran.", hint: "Ketiganya berupa array. Item pada indeks yang sama menggambarkan satu produk: nama, jumlah, dan harga satuan." },
          { name: "returnUrl · notifyUrl · cancelUrl", detail: "Tujuan redirect dan notifikasi status.", hint: "returnUrl untuk kembali setelah pembayaran, notifyUrl untuk callback server, dan cancelUrl untuk transaksi yang dibatalkan." },
        ],
      },
      direct: {
        label: "Direct Payment", endpoint: "/api/v2/payment/direct",
        summary: "Aplikasi Anda memilih metode dan channel sebelum request dikirim.",
        result: "Respons berisi instruksi pembayaran sesuai channel yang dipilih.",
        docs: "/docs/payment/direct-payment",
        parameters: [
          { name: "va + signature", detail: "Identitas merchant dan tanda tangan request.", hint: "Gunakan VA dan API Key merchant dari environment yang sama. Hitung signature HMAC-SHA256 untuk body Direct Payment ini; jangan gunakan ulang signature request lain." },
          { name: "timestamp", detail: "Waktu request untuk validasi signature.", hint: "Format umum API v2 adalah YYYYMMDDHHmmss, misalnya 20261006153045. Ikuti format spesifik pada dokumentasi endpoint jika berbeda." },
          { name: "name · phone · email · amount", detail: "Identitas pembeli dan total pembayaran.", hint: "Direct Payment memerlukan nama, nomor telepon, email pembeli, dan total nominal dalam rupiah." },
          { name: "paymentMethod · paymentChannel", detail: "Metode dan channel yang dipilih aplikasi.", hint: "Contoh ini menggunakan paymentMethod va dan paymentChannel bca. Pilih pasangan yang tersedia pada daftar channel pembayaran." },
          { name: "notifyUrl · product · qty · price", detail: "Callback dan rincian produk.", hint: "notifyUrl menerima notifikasi status. product, qty, dan price adalah array dengan urutan item yang saling sesuai." },
        ],
      },
    },
  },
  en: {
    selectorLabel: "Choose a payment flow",
    docsLink: "Open endpoint documentation",
    title: "What you need",
    intro: "The essential parts of this request:",
    signatureLink: "Learn about signatures",
    flows: {
      redirect: {
        label: "Redirect Payment", endpoint: "/api/v2/payment",
        summary: "The buyer chooses a method on iPaymu's checkout page.",
        result: "The response includes a checkout URL for your buyer.",
        docs: "/docs/payment/redirect-payment",
        parameters: [
          { name: "va + signature", detail: "Merchant identity and request signature.", hint: "VA is your merchant Virtual Account number from the iPaymu dashboard. The signature is an HMAC-SHA256 value built from the HTTP method, VA, request body hash, and API Key. Generate a new signature for each request; Sandbox and Production use different credentials." },
          { name: "timestamp", detail: "Request time used to validate the signature.", hint: "Set the timestamp header to the time the request is created. The common API v2 format is YYYYMMDDHHmmss, for example 20261006153045. Some endpoints accept ISO 8601; follow the endpoint documentation." },
          { name: "product · qty · price", detail: "Product details and payment amount.", hint: "These are arrays. Values at the same index describe one product: its name, quantity, and unit price." },
          { name: "returnUrl · notifyUrl · cancelUrl", detail: "Redirect destinations and status notification.", hint: "returnUrl sends the buyer back after payment, notifyUrl receives server callbacks, and cancelUrl handles a cancelled checkout." },
        ],
      },
      direct: {
        label: "Direct Payment", endpoint: "/api/v2/payment/direct",
        summary: "Your app selects the method and channel before sending the request.",
        result: "The response includes payment instructions for the selected channel.",
        docs: "/docs/payment/direct-payment",
        parameters: [
          { name: "va + signature", detail: "Merchant identity and request signature.", hint: "Use the merchant VA and API Key for the same environment. Generate an HMAC-SHA256 signature for this Direct Payment body; do not reuse a signature from another request." },
          { name: "timestamp", detail: "Request time used to validate the signature.", hint: "The common API v2 format is YYYYMMDDHHmmss, for example 20261006153045. Follow the endpoint documentation if it specifies a different format." },
          { name: "name · phone · email · amount", detail: "Buyer details and total payment amount.", hint: "Direct Payment requires the buyer's name, phone number, email address, and total amount in rupiah." },
          { name: "paymentMethod · paymentChannel", detail: "The method and channel selected by your app.", hint: "This example uses paymentMethod va with paymentChannel bca. Choose a supported pair from the payment-channel list." },
          { name: "notifyUrl · product · qty · price", detail: "Callback and product details.", hint: "notifyUrl receives status updates. product, qty, and price are arrays whose items align by index." },
        ],
      },
    },
  },
};

export function HomePaymentExample({ lang }: { lang: string }) {
  const [flow, setFlow] = useState<Flow>("redirect");
  const t = CONTENT[lang === "en" ? "en" : "id"];
  const selected = t.flows[flow];

  return (
    <div className={styles.paymentExample}>
      <div className={styles.flowChoices} role="group" aria-label={t.selectorLabel}>
        {(["redirect", "direct"] as const).map((item) => {
          const option = t.flows[item];
          return (
            <button key={item} type="button" className={styles.flowChoice} aria-pressed={flow === item} onClick={() => setFlow(item)}>
              <span className={styles.flowChoiceTop}><strong>{option.label}</strong><span className={styles.flowChoiceMark} aria-hidden="true" /></span>
              <code>POST {option.endpoint}</code>
              <span className={styles.flowChoiceSummary}>{option.summary}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.flowDetail} aria-live="polite">
        <p>{selected.result}</p>
        <Link href={`/${lang}${selected.docs}`} className={styles.inlineLink}>{t.docsLink} <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
      <div className={styles.exampleGrid}>
        <HomeCodeExample key={flow} request={REQUESTS[flow]} lang={lang} />
        <div className={styles.parameters} key={`${lang}-${flow}`}>
          <h3>{t.title}</h3>
          <p>{t.intro}</p>
          <dl>{selected.parameters.map((parameter) => (
            <div key={parameter.name}>
              <dt className={styles.parameterLabel}>
                <span>{parameter.name}</span>
                <ParameterTooltip label={parameter.name} text={parameter.hint} lang={lang} />
              </dt>
              <dd>{parameter.detail}</dd>
            </div>
          ))}</dl>
          <Link href={`/${lang}/docs/signature`} className={styles.inlineLink}>{t.signatureLink} <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  );
}
