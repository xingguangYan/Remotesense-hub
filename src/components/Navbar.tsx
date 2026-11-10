"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, LogOut, Satellite, UserRound } from "lucide-react"
import { LocaleSwitcher } from "@/components/LocaleSwitcher"
import { useTranslations } from "@/i18n/LocaleProvider"
import { siteConfig } from "@/lib/constants"
import type { SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"

export function Navbar({
  user,
  oauthEnabled,
}: {
  user: SessionUser | null
  oauthEnabled: boolean
}) {
  const { t } = useTranslations()
  const pathname = usePathname()

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/demands", label: t.nav.demands },
    { href: "/publish", label: t.nav.publish },
    { href: "/cooperation", label: t.nav.cooperation },
    { href: "/about", label: t.nav.about },
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
        </nav>
        <div className="shrink-0">
          <LocaleSwitcher />
        </div>
        {user ? (
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/my"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              title={user.name || user.username || t.nav.loggedInAs}
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-6 w-6 rounded-full border border-border object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserRound className="h-5 w-5" />
              )}
              <span className="hidden max-w-24 truncate sm:inline">
                {user.name || user.username || t.nav.myDemands}
              </span>
            </Link>
            <a
              href="/auth/logout"
              className="flex items-center rounded-md p-2 text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              title={t.nav.logout}
              aria-label={t.nav.logout}
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        ) : oauthEnabled ? (
          <a
            href="/auth/login"
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">{t.nav.login}</span>
          </a>
        ) : null}
      </div>
    </header>
  )
}
