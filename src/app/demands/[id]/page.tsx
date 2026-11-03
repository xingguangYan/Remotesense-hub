import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarRange, Layers, MapPin, Ruler, Wallet } from "lucide-react"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InquiryModal } from "@/components/InquiryModal"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import {
  BUDGET_LABELS,
  CATEGORY_LABELS,
  siteConfig,
  type BudgetRange,
  type DemandCategory,
} from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { maskEmail, maskPhone } from "@/lib/mask"
import { timeAgo } from "@/lib/utils"

type Params = { id: string }

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const locale = getLocale()
  const t = getMessages(locale)
  const demand = await prisma.demand.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, region: true, status: true },
  })

  if (!demand || demand.status !== "published") {
    return { title: t.errors.NOT_FOUND }
  }

  return {
    title: `${demand.title} - ${demand.region}`,
    description: demand.description.slice(0, 120),
  }
}

export default async function DemandDetailPage({ params }: { params: Params }) {
  const locale = getLocale()
  const t = getMessages(locale)

  const demand = await prisma.demand.findUnique({
    where: { id: params.id },
    include: { _count: { select: { inquiries: true } } },
  })

  if (!demand || demand.status !== "published") {
    notFound()
  }

  // 浏览量统计（失败不影响渲染）
  prisma.demand
    .update({
      where: { id: demand.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {})

  const categoryLabel =
    CATEGORY_LABELS[locale][demand.category as DemandCategory] || demand.category
  const budgetLabel = demand.budget
    ? BUDGET_LABELS[locale][demand.budget as BudgetRange] || demand.budget
    : t.common.budgetNegotiable

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Demand",
    name: demand.title,
    description: demand.description,
    category: categoryLabel,
    areaServed: demand.region,
    datePosted: demand.createdAt.toISOString(),
  }

const specs: { label: string; value: string | null; icon: typeof MapPin; tone: string }[] = [
    { label: t.detail.specs.region, value: demand.region, icon: MapPin, tone: "text-sky-600" },
    { label: t.detail.specs.category, value: categoryLabel, icon: Layers, tone: "text-primary" },
    { label: t.detail.specs.budget, value: budgetLabel, icon: Wallet, tone: "text-emerald-600" },
    { label: t.detail.specs.time, value: demand.timeRange, icon: CalendarRange, tone: "text-amber-600" },
    { label: t.detail.specs.resolution, value: demand.resolution, icon: Ruler, tone: "text-violet-600" },
    { label: t.detail.specs.area, value: demand.area, icon: Ruler, tone: "text-rose-600" },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/demands">
          <ArrowLeft className="h-4 w-4" />
          {t.detail.back}
        </Link>
      </Button>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{categoryLabel}</Badge>
            <span className="text-xs text-muted-foreground">
              {timeAgo(demand.createdAt)}
              {t.common.postedAgo} · {demand.viewCount} {t.common.viewsUnit} ·{" "}
              {t.detail.receivedPrefix} {demand._count.inquiries}{" "}
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
                {maskPhone(demand.contactPhone)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.detail.email}</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {maskEmail(demand.contactEmail)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t.detail.contactHint}
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <InquiryModal
              demandId={demand.id}
              allowDirectContact={demand.allowDirectContact}
            />
            <p className="mt-3 max-w-md text-xs text-muted-foreground">
              {demand.allowDirectContact
                ? t.detail.inquiryNoteDirect
                : t.detail.inquiryNoteRelay}
            </p>
          </div>
          <div className="text-right">
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
