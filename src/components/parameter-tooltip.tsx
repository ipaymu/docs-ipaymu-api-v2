"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import styles from "@/app/[lang]/home.module.css";

export function ParameterTooltip({ label, text, lang }: { label: string; text: string; lang: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className={styles.parameterTooltip}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={`${lang === "en" ? "About" : "Tentang"} ${label}`}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <Info size={15} aria-hidden="true" />
      </button>
      {open && <span id={tooltipId} role="tooltip" className={styles.tooltipBubble}>{text}</span>}
    </span>
  );
}
