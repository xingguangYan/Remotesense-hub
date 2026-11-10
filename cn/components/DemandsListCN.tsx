"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { DemandCard } from "@/components/DemandCard"
import { DemandFilters } from "@/components/DemandFilters"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/LocaleProvider"
import { BUDGETS, DEMAND_CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { mainSiteHref } from "@cn/lib/main-site"
import type { PublicDemand } from "@cn/lib/data"

const PAGE_SIZE = 12

export function DemandsListCN({ demands }: { demands: PublicDemand[] }) {
  const { t, locale } = useTranslations()
  const searchParams = useSearchParams()

  const category = searchParams.get("category") ?? ""
  const budget = searchParams.get("budget") ?? ""
  const region = searchParams.get("region") ?? ""
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)

  const validCategory = DEMAND_CATEGORIES.includes(category as never)
  const validBudget = BUDGETS.includes(budget as never)

  const filtered = useMemo(() => {
    return demands.filter((d) => {
      if (validCategory && d.category !== category) return false
      if (validBudget && d.budget !== budget) return false
      if (region && !d.region.includes(region)) return false
      return true
    })
  }, [demands, validCategory, category, validBudget, budget, region])

  const hasFilters = Boolean(category || region || budget)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const items = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const listCount = filtered.length

  function pageHref(target: number) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (region) params.set("region", region)
    if (budget) params.set("budget", budget)
    params.set("page", String(target))
    return `/demands?${params.toString()}`
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t.demands.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.demands.subtitle.replace("{count}", String(listCount))}
        </p>
      </div>

      <div className="mt-6">
        <DemandFilters />
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            title={hasFilters ? t.demands.emptyFilteredTitle : t.demands.emptyTitle}
            description={hasFilters ? t.demands.emptyFilteredDesc : t.demands.emptyDesc}
            action={
              <div className="flex gap-3">
                {hasFilters && (
                  <Button asChild variant="outline">
                    <Link href="/demands">{t.demands.filters.clear}</Link>
                  </Button>
                )}
                <Button asChild>
                  <a
                    href={mainSiteHref("/publish")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.common.publishCta} ↗
                  </a>
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((demand) => (
              <DemandCard key={demand.id} demand={demand} t={t} locale={locale} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link
              href={pageHref(current - 1)}
              aria-label={t.demands.prev}
              className={cn(current === 1 && "pointer-events-none opacity-50")}
            >
              <ArrowLeft className="h-4 w-4" />
              {t.demands.prev}
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            {t.demands.pageOf
              .replace("{page}", String(current))
              .replace("{total}", String(totalPages))}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link
              href={pageHref(current + 1)}
              aria-label={t.demands.next}
              className={cn(current === totalPages && "pointer-events-none opacity-50")}
            >
              {t.demands.next}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
