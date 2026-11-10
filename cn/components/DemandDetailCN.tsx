"use client"

import Link from "next/link"
import {
  ArrowLeft,
  CalendarClock,
  CalendarRange,
  Layers,
  MapPin,
  Ruler,
  Wallet,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/LocaleProvider"
import {
  BUDGET_LABELS,
  CATEGORY_LABELS,
  siteConfig,
  type BudgetRange,
  type DemandCategory,
} from "@/lib/constants"
import { maskEmail, maskPhone } from "@/lib/mask"
import { fmtDateOnly, isExpired, timeAgo } from "@/lib/utils"
import { mainSiteHref } from "@cn/lib/main-site"
import type { PublicDemand } from "@cn/lib/data"

export function DemandDetailCN({ demand }: { demand: PublicDemand }) {
  const { t, locale } = useTranslations()

  const categoryLabel =
    CATEGORY_LABELS[locale][demand.category as DemandCategory] || demand.category
  const budgetLabel = demand.budget
    ? BUDGET_LABELS[locale][demand.budget as BudgetRange] || demand.budget
    : t.common.budgetNegotiable
  const expired = isExpired(demand.deadlineAt)

  const specs: {
    label: string
    value: string | null
    icon: typeof MapPin
    tone: string
  }[] = [
    { label: t.detail.specs.region, value: demand.region, icon: MapPin, tone: "text-sky-600" },
    { label: t.detail.specs.category, value: categoryLabel, icon: Layers, tone: "text-primary" },
    { label: t.detail.specs.budget, value: budgetLabel, icon: Wallet, tone: "text-emerald-600" },
    { label: t.detail.specs.time, value: demand.timeRange, icon: CalendarRange, tone: "text-amber-600" },
    { label: t.detail.specs.startAt, value: demand.startAt ? fmtDateOnly(demand.startAt) : null, icon: CalendarRange, tone: "text-sky-600" },
    { label: t.detail.specs.deadlineAt, value: demand.deadlineAt ? fmtDateOnly(demand.deadlineAt) : null, icon: CalendarClock, tone: "text-rose-600" },
    { label: t.detail.specs.resolution, value: demand.resolution, icon: Ruler, tone: "text-violet-600" },
    { label: t.detail.specs.area, value: demand.area, icon: Ruler, tone: "text-rose-600" },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/demands">
          <ArrowLeft className="h-4 w-4" />
          {t.cn.backToList}
        </Link>
      </Button>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{categoryLabel}</Badge>
            {expired && (
              <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                {t.common.expiredLabel}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {timeAgo(demand.createdAt)}
              {t.common.postedAgo} · {t.detail.receivedPrefix} {demand.inquiriesCount}{" "}
              {t.common.inquiriesUnit}
            </span>
          </div>
          <h1 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">
            {demand.title}
          </h1>

          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
              >
                <spec.icon className={`mt-0.5 h-4 w-4 shrink-0 ${spec.tone}`} />
                <div>
                  <dt className="text-xs text-muted-foreground">{spec.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-foreground">
                    {spec.value || t.common.notFilled}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground">
            {t.detail.descTitle}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/90">
            {demand.description}
          </p>
        </div>

        <div className="border-t border-border bg-muted/30 p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground">
            {t.detail.contactTitle}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">{t.detail.contactName}</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {demand.contactName}
              </p>
            </div>
            {demand.company && (
              <div>
                <p className="text-xs text-muted-foreground">{t.detail.company}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {demand.company}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">{t.detail.phone}</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {demand.contactPhone || t.common.notFilled}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.detail.email}</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {demand.contactEmail || t.common.notFilled}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t.detail.contactHint}
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="w-full max-w-md">
            {expired ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-700">
                  {t.detail.expiredTitle}
                </p>
                <p className="mt-1 text-xs text-rose-700/90">
                  {t.detail.expiredDesc}
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-primary">
                  {t.cn.inquiryCtaTitle}
                </p>
                <p className="mt-1 text-xs text-foreground/80">
                  {t.cn.inquiryCtaDesc}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <a
                      href={mainSiteHref(`/demands/${demand.id}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.cn.inquiryCtaButton} ↗
                    </a>
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.cn.mainSiteNote}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.cn.contactFallback}:
                  <a
                    className="font-medium text-primary"
                    href={`mailto:${siteConfig.cooperationEmail}`}
                  >
                    {" "}{siteConfig.cooperationEmail}
                  </a>
                </p>
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground">{t.detail.cooperation}</p>
            <p className="text-sm font-medium text-primary">
              {siteConfig.cooperationEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
