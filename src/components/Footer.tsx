import Link from "next/link"
import { Mail } from "lucide-react"
import { getServerMessages } from "@/i18n/server"
import { siteConfig } from "@/lib/constants"
import { CopyEmail } from "./CopyEmail"

export function Footer() {
  const t = getServerMessages()

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-bold text-primary">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t.footer.tagline}</p>
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Mail className="h-4 w-4" />
            {t.footer.cooperation}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {siteConfig.cooperationEmail}
            </span>
            <CopyEmail email={siteConfig.cooperationEmail} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t.footer.quickLinks}</p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            <Link href="/demands" className="hover:text-primary">
              {t.nav.demands}
            </Link>
            <Link href="/publish" className="hover:text-primary">
              {t.nav.publish}
            </Link>
            <Link href="/about" className="hover:text-primary">
              {t.footer.disclaimer}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name} · {t.footer.legal}
        </p>
      </div>
    </footer>
  )
}
