"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

export type Environment = "sandbox" | "production";

const HOSTS: Record<Environment, string> = {
  sandbox: "https://sandbox.ipaymu.com",
  production: "https://my.ipaymu.com",
};

const STORAGE_KEY = "ipaymu-docs-environment";
const CHANGE_EVENT = "ipaymu-environment-change";

function getEnvironment(): Environment {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "production" ? "production" : "sandbox";
}

function getServerEnvironment(): Environment {
  return "sandbox";
}

function subscribeEnvironment(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

const EnvironmentContext = createContext<{
  environment: Environment;
  setEnvironment: (environment: Environment) => void;
}>({ environment: "sandbox", setEnvironment: () => {} });

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const environment = useSyncExternalStore(subscribeEnvironment, getEnvironment, getServerEnvironment);

  const selectEnvironment = (value: Environment) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return <EnvironmentContext.Provider value={{ environment, setEnvironment: selectEnvironment }}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment() {
  return useContext(EnvironmentContext);
}

export function environmentUrl(path: string, environment: Environment) {
  return `${HOSTS[environment]}${path}`;
}

export function replaceRequestEnvironment(value: string, environment: Environment) {
  return value
    .replaceAll("{{baseUrl}}", HOSTS[environment])
    .replace(/https:\/\/(?:my|sandbox)\.ipaymu\.com(?=\/(?:api|payment)\/)/g, HOSTS[environment]);
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  }
}

export function EnvironmentSwitcher({ lang }: { lang: string }) {
  const { environment, setEnvironment } = useEnvironment();
  return (
    <div className="environment-switch" role="group" aria-label={lang === "en" ? "API environment" : "Lingkungan API"}>
      {(["sandbox", "production"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={environment === value}
          onClick={() => setEnvironment(value)}
        >
          {value === "sandbox" ? "Sandbox" : "Production"}
        </button>
      ))}
    </div>
  );
}

export type EndpointEntry = { method?: string; path: string; label?: string };

export function EndpointPanel({ entries, lang }: { entries: EndpointEntry[]; lang: string }) {
  const { environment } = useEnvironment();
  const [copied, setCopied] = useState<string | null>(null);
  const isEN = lang === "en";

  const copy = async (url: string) => {
    if (!await copyText(url)) return;
    setCopied(url);
    window.setTimeout(() => setCopied((current) => current === url ? null : current), 1800);
  };

  return (
    <section id="endpoint" className="endpoint-panel" aria-labelledby="endpoint-panel-title">
      <div className="endpoint-panel-heading">
        <div>
          <p className="endpoint-panel-kicker">{isEN ? "API ENVIRONMENT" : "LINGKUNGAN API"}</p>
          <h2 id="endpoint-panel-title">{entries.some((entry) => entry.method) ? "Endpoint" : "Base URL"}</h2>
        </div>
        <EnvironmentSwitcher lang={lang} />
      </div>
      <div className="endpoint-panel-list">
        {entries.map((entry) => {
          const url = environmentUrl(entry.path, environment);
          return (
            <div className="endpoint-panel-row" key={`${entry.method ?? "base"}-${entry.path}`}>
              {entry.method && <span className="endpoint-method">{entry.method}</span>}
              <div className="endpoint-address">
                {entry.label && <span className="endpoint-label">{entry.label}</span>}
                <code>{url}</code>
              </div>
              <button type="button" onClick={() => void copy(url)} aria-label={`${copied === url ? (isEN ? "Copied" : "Tersalin") : (isEN ? "Copy endpoint URL" : "Salin URL endpoint")}: ${url}`} title={copied === url ? (isEN ? "Copied" : "Tersalin") : (isEN ? "Copy URL" : "Salin URL")}>
                {copied === url ? <Check size={17} /> : <Copy size={17} />}
              </button>
            </div>
          );
        })}
      </div>
      <p className="endpoint-panel-note">{isEN ? "Use credentials from the selected environment. Sandbox and Production credentials are separate." : "Gunakan kredensial sesuai lingkungan yang dipilih. Kredensial Sandbox dan Production berbeda."}</p>
    </section>
  );
}

export function EnvironmentRequest({ children }: { children: string }) {
  const { environment } = useEnvironment();
  return <>{replaceRequestEnvironment(children, environment)}</>;
}
