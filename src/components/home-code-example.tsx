"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { copyText, EnvironmentSwitcher, replaceRequestEnvironment, useEnvironment } from "@/components/environment";
import styles from "@/app/[lang]/home.module.css";

const TOKENS = /(https?:\/\/[^\s"'\\]+|"(?:\\.|[^"\\])*"|\b(?:curl|POST)\b|-(?:X|H|d)\b|\b\d+\b)/g;

function highlightRequest(request: string) {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of request.matchAll(TOKENS)) {
    const index = match.index;
    if (index > cursor) parts.push(request.slice(cursor, index));

    const token = match[0];
    const rest = request.slice(index + token.length);
    const className = token.startsWith("http") ? styles.syntaxUrl
      : token.startsWith('"') && /^\s*:/.test(rest) ? styles.syntaxKey
      : token.startsWith('"') ? styles.syntaxString
      : token.startsWith("-") ? styles.syntaxFlag
      : /^\d/.test(token) ? styles.syntaxNumber
      : styles.syntaxCommand;

    parts.push(<span className={className} key={index}>{token}</span>);
    cursor = index + token.length;
  }

  if (cursor < request.length) parts.push(request.slice(cursor));
  return parts;
}

export function HomeCodeExample({ request, lang }: { request: string; lang: string }) {
  const { environment } = useEnvironment();
  const [copied, setCopied] = useState(false);
  const currentRequest = replaceRequestEnvironment(request, environment);

  const copy = async () => {
    if (!await copyText(currentRequest)) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={styles.codePanel}>
      <div className={styles.codeHeader}>
        <div className={styles.terminalIdentity}>
          <span className={styles.terminalLights} aria-hidden="true"><i /><i /><i /></span>
          <span>bash</span>
        </div>
        <div className={styles.codeControls}>
          <EnvironmentSwitcher lang={lang} />
          <button type="button" className={styles.codeCopy} onClick={() => void copy()} aria-label={copied ? (lang === "en" ? "Code copied" : "Kode tersalin") : (lang === "en" ? "Copy code" : "Salin kode")} title={copied ? (lang === "en" ? "Copied" : "Tersalin") : (lang === "en" ? "Copy code" : "Salin kode")}>
            {copied ? <Check size={17} /> : <Copy size={17} />}
          </button>
        </div>
      </div>
      <pre><code>{highlightRequest(currentRequest)}</code></pre>
    </div>
  );
}
