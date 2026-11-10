"use client"

import Link from "next/link"
import {
  ArrowRight,
  FileText,
  Layers,
  MailCheck,
  Map as MapIcon,
  MousePointerClick,
  Ruler,
  ScanSearch,
  BrainCog,
  PhoneCall,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DemandCard } from "@/components/DemandCard"
import { EmptyState } from "@/components/EmptyState"
import { useTranslations } from "@/i18n/LocaleProvider"
import { DEMAND_CATEGORIES, siteConfig, type DemandCategory } from "@/lib/constants"
import { mainSiteHref } from "@cn/lib/main-site"
import type { PublicDemand } from "@cn/lib/data"

const CATEGORY_ICONS: Record<DemandCategory, typeof FileText> = {
  IMAGE_ACQUISITION: MapIcon,
  DATA_PROCESSING: Layers,
  MODEL_TRAINING: BrainCog,
  CHANGE_DETECTION: ScanSearch,
  THEMATIC_MAPPING: Ruler,
  OTHER: MousePointerClick,
}

export function HomeCN({ demands }: { demands: PublicDemand[] }) {
  const { t, locale } = useTranslations()

  const publishHref = mainSiteHref("/publish")
  const latestDemands = demands.slice(0, 6)
  const publishedCount = demands.length
  const inquiryCount = demands.reduce((sum, d) => sum + (d.inquiriesCount || 0), 0)
  const stats = [
    { label: t.home.stats.published, value: publishedCount },
    { label: t.home.stats.inquiries, value: inquiryCount },
    { label: t.home.stats.categories, value: DEMAND_CATEGORIES.length },
  ]

  return (
    <>
      {/* Hero：双角色入口，发布走主站 */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
              {siteConfig.name}
              {t.home.heroDesc}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <a href={publishHref} target="_blank" rel="noopener noreferrer">
                  {t.common.publishCta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/demands">{t.common.browseCta}</Link>
              </Button>
            </div>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-primary-foreground/15 pt-8 sm:mt-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <dt className="text-xs text-primary-foreground/70 sm:text-sm">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-primary-foreground sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 需求类型快捷入口 */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          {t.home.categoriesTitle}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.home.categoriesDesc}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {DEMAND_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category]
            return (
              <Link
                key={category}
                href={`/demands?category=${category}`}
                className="group flex flex-col gap-3 rounded-lg border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {t.home.cat[category].label}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {t.home.cat[category].desc}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 最新需求 */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2.5 text-xl font-bold text-foreground sm:text-2xl">
                {t.home.latestTitle}
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {publishedCount}
                </span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.home.latestDesc}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/demands">
                {t.common.viewAll}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {latestDemands.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title={t.home.latestEmptyTitle}
                description={t.home.latestEmptyDesc}
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestDemands.map((demand) => (
                <DemandCard key={demand.id} demand={demand} t={t} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 三步流程 */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          {t.home.processTitle}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {t.home.steps.map((step, i) => {
            const Icon = [FileText, MailCheck, PhoneCall][i] ?? FileText
            return (
              <div
                key={step.title}
                className="rounded-lg border border-border bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
