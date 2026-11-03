import Link from "next/link"
import { ArrowRight, MapPin, Users, Wallet } from "lucide-react"
import { type Locale, type Messages } from "@/i18n/messages"
import {
  BUDGET_LABELS,
  CATEGORY_LABELS,
  type BudgetRange,
  type DemandCategory,
} from "@/lib/constants"
import { timeAgo } from "@/lib/utils"

export type DemandCardData = {
  id: string
  title: string
  category: string
  region: string
  budget?: string | null
  createdAt: Date | string
  _count?: { inquiries: number }
}

export function DemandCard({
  demand,
  t,
  locale,
}: {
  demand: DemandCardData
  t: Messages
  locale: Locale
}) {
  const categoryLabel =
    CATEGORY_LABELS[locale][demand.category as DemandCategory] || demand.category
  const budgetLabel = demand.budget
    ? BUDGET_LABELS[locale][demand.budget as BudgetRange] || demand.budget
    : t.common.budgetNegotiable

  return (
    <Link
      href={`/demands/${demand.id}`}
      className="group relative flex flex-col rounded-lg border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-gradient-to-r from-primary/0 via-primary/40 to-accent/0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary">
          {demand.title}
        </h3>
        <span className="shrink-0 rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          {categoryLabel}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {demand.region}
        </span>
        <span className="inline-flex items-center gap-1">
          <Wallet className="h-3.5 w-3.5" />
          {budgetLabel}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-3">
          <span>{timeAgo(demand.createdAt)}{t.common.postedAgo}</span>
          {typeof demand._count?.inquiries === "number" && demand._count.inquiries > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {demand._count.inquiries} {t.common.inquiriesUnit}
            </span>
          )}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  )
}
