"use client"

import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/LocaleProvider"
import { siteConfig } from "@/lib/constants"
import { mainSiteHref } from "@cn/lib/main-site"

export default function AboutPage() {
  const { t } = useTranslations()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        {t.about.title.replace("{name}", siteConfig.name)}
      </h1>

      <div className="mt-8 space-y-8 text-sm leading-7 text-foreground/90">
        <section>
          <h2 className="text-base font-semibold text-foreground">
            {t.about.positioning}
          </h2>
          <p className="mt-2 text-muted-foreground">{t.about.positioningDesc}</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">{t.about.scope}</h2>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            {t.about.scopeItems.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">{t.about.process}</h2>
          <ol className="mt-2 space-y-1.5 text-muted-foreground">
            {t.about.processItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-amber-900">
            <ShieldCheck className="h-5 w-5" />
            {t.about.disclaimerTitle}
          </h2>
          <p className="mt-2 text-sm leading-7 text-amber-800">
            {t.about.disclaimer}
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <a
            href={mainSiteHref("/publish")}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.common.publishCta} ↗
          </a>
        </Button>
        <Button asChild variant="outline">
          <Link href="/demands">{t.common.browseCta}</Link>
        </Button>
      </div>
    </div>
  )
}
