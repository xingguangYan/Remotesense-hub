"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { LocaleProvider } from "@/i18n/LocaleProvider"
import { defaultLocale, getMessages, isLocale, type Locale } from "@/i18n/messages"

/** 静态导出没有 cookie，展示层用 localStorage 持久化语言选择 */
const STORAGE_KEY = "rs_hub_locale"

type Ctx = { locale: Locale; setLocale: (next: Locale) => void }

const CnLocaleContext = createContext<Ctx | null>(null)

export function LocaleProviderCN({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLocale(saved) && saved !== locale) setLocaleState(saved)
  }, [locale])

  function setLocale(next: Locale) {
    if (next === locale) return
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // 无痕模式等场景静默降级，本次会话内生效
    }
    setLocaleState(next)
  }

  return (
    <CnLocaleContext.Provider value={{ locale, setLocale }}>
      <LocaleProvider locale={locale} messages={getMessages(locale)}>
        {children}
      </LocaleProvider>
    </CnLocaleContext.Provider>
  )
}

export function useCnLocale(): Ctx {
  const ctx = useContext(CnLocaleContext)
  if (!ctx) throw new Error("useCnLocale must be used inside <LocaleProviderCN>")
  return ctx
}
