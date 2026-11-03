import { cookies } from "next/headers"
import { LOCALE_COOKIE, defaultLocale, getMessages, isLocale, type Locale } from "./messages"

/** 服务端取当前语言（cookie 优先，默认中文） */
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : defaultLocale
}

export function getServerMessages() {
  return getMessages(getLocale())
}
