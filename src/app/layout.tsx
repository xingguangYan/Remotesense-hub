import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { SupportAuthor } from "@/components/SupportAuthor"
import { LocaleProvider } from "@/i18n/LocaleProvider"
import { getLocale } from "@/i18n/server"
import { getMessages } from "@/i18n/messages"
import { siteConfig } from "@/lib/constants"
import { isOAuthConfigured } from "@/lib/oauth"
import { getSessionUser } from "@/lib/session"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

export function generateMetadata(): Metadata {
  const t = getMessages(getLocale())
  return {
    title: {
      default: t.meta.titleDefault,
      template: `%s | ${siteConfig.name}`,
    },
    description: t.meta.description,
    keywords: ["遥感", "remote sensing", "卫星影像", "需求对接", "测绘", "GIS", "变化检测"],
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = getLocale()
  const messages = getMessages(locale)
  const user = getSessionUser()

  return (
    <html lang={locale} className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <LocaleProvider locale={locale} messages={messages}>
          <Navbar user={user} oauthEnabled={isOAuthConfigured()} />
          <main className="flex-1">{children}</main>
          <SupportAuthor />
          <Footer />
          <Toaster richColors position="top-center" />
        </LocaleProvider>
      </body>
    </html>
  )
}
