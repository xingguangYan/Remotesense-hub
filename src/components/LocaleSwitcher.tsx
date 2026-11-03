"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "@/i18n/LocaleProvider"
import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/messages"
import { cn } from "@/lib/utils"

const LABELS: Record<Locale, string> = { zh: "中文", en: "EN" }
const YEAR_SECONDS = 60 * 60 * 24 * 365

export function LocaleSwitcher() {
  const { locale } = useTranslations()
  const router = useRouter()

  function switchTo(next: Locale) {
    if (next === locale) return
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${YEAR_SECONDS}; samesite=lax`
    router.refresh()
  }

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
          onClick={() => switchTo(item)}
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
