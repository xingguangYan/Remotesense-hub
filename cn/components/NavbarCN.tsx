"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Satellite } from "lucide-react"
import { useTranslations } from "@/i18n/LocaleProvider"
import { siteConfig } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { mainSiteHref } from "@cn/lib/main-site"
import { LocaleSwitcherCN } from "./LocaleSwitcherCN"

/** 展示层导航：浏览类页面站内，写操作入口指向主站 */
export function NavbarCN() {
  const { t } = useTranslations()
  const pathname = usePathname()

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/demands", label: t.nav.demands },
    { href: "/about", label: t.nav.about },
  ] as const

  const external = [
    { href: mainSiteHref("/publish"), label: t.nav.publish },
    { href: mainSiteHref("/cooperation"), label: t.nav.cooperation },
  ] as const

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-primary">
          <Satellite className="h-6 w-6" />
          <span>{siteConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-0.5 overflow-x-auto sm:ml-auto sm:gap-1">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                  active ? "text-primary" : "text-foreground/80",
                )}
              >
                {link.label}
              </Link>
            )
          })}
          {external.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label} ↗
            </a>
          ))}
        </nav>
        <div className="shrink-0">
          <LocaleSwitcherCN />
        </div>
      </div>
    </header>
  )
}
