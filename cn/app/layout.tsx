import type { Metadata } from "next"
import { Toaster } from "sonner"
import { NavbarCN } from "@cn/components/NavbarCN"
import { FooterCN } from "@cn/components/FooterCN"
import { SupportAuthorCN } from "@cn/components/SupportAuthorCN"
import { LocaleProviderCN } from "@cn/components/LocaleProviderCN"
import { defaultLocale, getMessages } from "@/i18n/messages"
import { siteConfig } from "@/lib/constants"
import "./globals.css"

// 静态导出：metadata 固定按默认语言生成（zh），客户端再按 localStorage 切换文案
const t = getMessages(defaultLocale)

export const metadata: Metadata = {
  title: {
    default: t.meta.titleDefault,
    template: `%s | ${siteConfig.name}`,
  },
  description: t.meta.description,
  keywords: ["遥感", "remote sensing", "卫星影像", "需求对接", "测绘", "GIS", "变化检测"],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh">
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <LocaleProviderCN>
          <NavbarCN />
          <main className="flex-1">{children}</main>
          <SupportAuthorCN />
          <FooterCN />
          <Toaster richColors position="top-center" />
        </LocaleProviderCN>
      </body>
    </html>
  )
}
