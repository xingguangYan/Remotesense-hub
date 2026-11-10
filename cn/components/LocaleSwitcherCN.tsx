"use client"

import { useCnLocale } from "./LocaleProviderCN"
import { locales, type Locale } from "@/i18n/messages"
import { cn } from "@/lib/utils"

const LABELS: Record<Locale, string> = { zh: "中文", en: "EN" }

export function LocaleSwitcherCN() {
  const { locale, setLocale } = useCnLocale()

  return (
    <div
      className="inline-flex items-center rounded-md border border-border bg-white p-0.5"
      role="group"
      aria-label="Language switcher"
    >
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          aria-pressed={item === locale}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            item === locale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {LABELS[item]}
        </button>
      ))}
    </div>
  )
}
