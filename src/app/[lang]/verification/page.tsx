import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Akun",
  description: "Panduan verifikasi akun iPaymu.",
};

export function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

export default async function VerificationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isId = lang === "id";

  return (
    <main className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">
        {isId ? "Verifikasi Akun" : "Account Verification"}
      </h1>

      <p className="mb-8 text-muted-foreground text-lg">
        {isId
          ? "Untuk mengaktifkan akun produksi (Live), Anda perlu menyelesaikan proses verifikasi."
          : "To activate your production account, you need to complete the verification process."}
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-6 border rounded-xl bg-card">
          <h2 className="text-xl font-semibold mb-4">{isId ? "Persyaratan" : "Requirements"}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {isId ? (
              <>
                <li>KTP (Kartu Tanda Penduduk)</li>
                <li>NPWP (Nomor Pokok Wajib Pajak)</li>
                <li>Rekening Bank Aktif</li>
              </>
            ) : (
              <>
                <li>KTP (ID Card)</li>
                <li>NPWP (Tax ID)</li>
                <li>Valid Bank Account</li>
              </>
            )}
          </ul>
        </div>

        <div className="p-6 border rounded-xl bg-card">
          <h2 className="text-xl font-semibold mb-4">{isId ? "Langkah-langkah" : "Steps"}</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            {isId ? (
              <>
                <li>Login ke Dashboard iPaymu Anda.</li>
                <li>
                  Masuk ke menu <strong>Akun &gt; Verifikasi</strong>.
                </li>
                <li>Unggah dokumen yang diperlukan.</li>
                <li>Tunggu persetujuan (biasanya 1x24 jam).</li>
              </>
            ) : (
              <>
                <li>Login to your iPaymu Dashboard.</li>
                <li>
                  Go to <strong>Account &gt; Verification</strong>.
                </li>
                <li>Upload the required documents.</li>
                <li>Wait for approval (usually 1x24 hours).</li>
              </>
            )}
          </ol>
        </div>
      </div>
    </main>
  );
}
