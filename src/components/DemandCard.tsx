import Link from "next/link"
import { MapPin, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

export function DemandCard({ demand }: { demand: DemandCardData }) {
  const categoryLabel =
    CATEGORY_LABELS[demand.category as DemandCategory] || demand.category
  const budgetLabel = demand.budget
    ? BUDGET_LABELS[demand.budget as BudgetRange] || demand.budget
    : "预算面议"

  return (
    <Link
      href={`/demands/${demand.id}`}
      className="group block rounded-lg border border-border bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary">
          {demand.title}
        </h3>
        <Badge variant="accent" className="shrink-0">
          {categoryLabel}
        </Badge>
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
        <span>{timeAgo(demand.createdAt)}发布</span>
      </div>
      {typeof demand._count?.inquiries === "number" && (
        <p className="mt-3 text-xs text-muted-foreground">
          已收到 {demand._count.inquiries} 条服务方意向
        </p>
      )}
    </Link>
  )
}
