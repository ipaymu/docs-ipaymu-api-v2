import type { ReactNode } from "react";
import { withBasePath } from "@/lib/utils";

const INTEGRATION_URLS = {
  production: "https://my.ipaymu.com/integration",
  sandbox: "https://sandbox.ipaymu.com/integration",
};

function IntegrationLinks() {
  return (
    <>
      <a href={INTEGRATION_URLS.production} target="_blank" rel="noopener noreferrer">Production</a>
      {" / "}
      <a href={INTEGRATION_URLS.sandbox} target="_blank" rel="noopener noreferrer">Sandbox</a>
    </>
  );
}

type HeaderRow = {
  name: string;
  type: ReactNode;
  example: string;
  description: ReactNode;
};

export function ApiRequestHeaders({ lang = "id" }: { lang?: "id" | "en" }) {
  const isEN = lang === "en";
  const rows: HeaderRow[] = [
    {
      name: "Content-Type",
      type: <code>string</code>,
      example: "application/json",
      description: isEN ? "MIME type of the JSON request body." : "Tipe MIME untuk body request JSON.",
    },
    {
      name: "va",
      type: <code>string</code>,
      example: "YOUR_VA",
      description: isEN ? (
        <>Merchant Virtual Account number. Get it from the Integration menu in your iPaymu dashboard: <IntegrationLinks />. Use the VA for the selected environment.</>
      ) : (
        <>Nomor Virtual Account merchant. Ambil dari menu Integrasi di dashboard iPaymu: <IntegrationLinks />. Gunakan VA sesuai environment yang dipilih.</>
      ),
    },
    {
      name: "signature",
      type: <><code>string</code> · 64 hex</>,
      example: "GENERATED_SIGNATURE",
      description: isEN ? (
        <>Generate an HMAC-SHA256 signature for this request using the API Key from <IntegrationLinks />. Do not copy the API Key into this header. See <a href={withBasePath("/en/docs/signature")}>Signature Generation</a>.</>
      ) : (
        <>Buat signature HMAC-SHA256 untuk request ini memakai API Key dari <IntegrationLinks />. Jangan isi header ini dengan API Key. Lihat <a href={withBasePath("/id/docs/signature")}>Pembuatan Signature</a>.</>
      ),
    },
    {
      name: "timestamp",
      type: <><code>string</code> · {isEN ? "14 digits" : "14 digit"}</>,
      example: "20260102153045",
      description: isEN ? (
        <>Request creation time in <code>YYYYMMDDHHmmss</code> format (example: 2 Jan 2026, 15:30:45). Check the endpoint guide if it specifies ISO 8601 instead.</>
      ) : (
        <>Waktu saat request dibuat, format <code>YYYYMMDDHHmmss</code> (contoh: 2 Jan 2026, 15:30:45). Ikuti panduan endpoint jika mensyaratkan ISO 8601.</>
      ),
    },
  ];

  return (
    <>
      <div className="my-6 space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row.name} className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-border pb-3">
              <h3 className="m-0! text-base! font-semibold! leading-6! text-foreground"><code>{row.name}</code></h3>
              <span className="text-xs text-muted-foreground">{row.type}</span>
            </div>
            <dl className="mb-0! mt-3 space-y-3 text-sm">
              <div>
                <dt className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {isEN ? "Example / value" : "Contoh / nilai"}
                </dt>
                <dd className="m-0 min-w-0 break-all text-foreground"><code>{row.example}</code></dd>
              </div>
              <div>
                <dt className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {isEN ? "Description" : "Deskripsi"}
                </dt>
                <dd className="m-0 leading-relaxed text-foreground">{row.description}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="mdx-table-wrapper my-6 hidden w-full overflow-x-auto md:block">
        <table className="m-0! w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr>
              <th>Header</th>
              <th>{isEN ? "Type" : "Tipe"}</th>
              <th>{isEN ? "Example / value" : "Contoh / nilai"}</th>
              <th>{isEN ? "Description" : "Deskripsi"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td><code>{row.name}</code></td>
                <td>{row.type}</td>
                <td><code>{row.example}</code></td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
