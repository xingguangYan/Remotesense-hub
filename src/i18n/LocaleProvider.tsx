"use client"

import { createContext, useContext, type ReactNode } from "react"
import { type Locale, type Messages } from "./messages"

type LocaleContextValue = { locale: Locale; t: Messages }

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: ReactNode
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: messages }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useTranslations(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useTranslations must be used inside <LocaleProvider>")
  }
  return ctx
}
