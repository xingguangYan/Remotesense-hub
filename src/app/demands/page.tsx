import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Suspense } from "react"
import { DemandCard } from "@/components/DemandCard"
import { DemandFilters } from "@/components/DemandFilters"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import { BUDGETS, DEMAND_CATEGORIES } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 12

type SearchParams = {
  category?: string
  region?: string
  budget?: string
  page?: string
}

export default async function DemandsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const locale = getLocale()
  const t = getMessages(locale)
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1)

  const where = {
    status: "published" as const,
    ...(searchParams.category &&
      DEMAND_CATEGORIES.includes(searchParams.category as never) && {
        category: searchParams.category,
      }),
    ...(searchParams.budget &&
      BUDGETS.includes(searchParams.budget as never) && {
        budget: searchParams.budget,
      }),
    ...(searchParams.region && {
      region: { contains: searchParams.region },
    }),
  }

  const [total, demands] = await Promise.all([
    prisma.demand.count({ where }),
    prisma.demand.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { inquiries: true } } },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasFilters = Boolean(
    searchParams.category || searchParams.region || searchParams.budget,
  )

  function pageHref(target: number) {
    const params = new URLSearchParams()
    if (searchParams.category) params.set("category", searchParams.category)
    if (searchParams.region) params.set("region", searchParams.region)
    if (searchParams.budget) params.set("budget", searchParams.budget)
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
          {t.demands.subtitle.replace("{count}", String(total))}
        </p>
      </div>

      <div className="mt-6">
        <Suspense fallback={<div className="h-[88px] rounded-lg bg-muted/40" />}>
          <DemandFilters />
        </Suspense>
      </div>

      <div className="mt-6">
        {demands.length === 0 ? (
          <EmptyState
            title={hasFilters ? t.demands.emptyFilteredTitle : t.demands.emptyTitle}
            description={
              hasFilters ? t.demands.emptyFilteredDesc : t.demands.emptyDesc
            }
            action={
              <div className="flex gap-3">
                {hasFilters && (
                  <Button asChild variant="outline">
                    <Link href="/demands">{t.demands.filters.clear}</Link>
                  </Button>
                )}
                <Button asChild>
                  <Link href="/publish">{t.common.publishCta}</Link>
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demands.map((demand) => (
              <DemandCard key={demand.id} demand={demand} t={t} locale={locale} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link
              href={pageHref(page - 1)}
              aria-label={t.demands.prev}
              className={cn(page === 1 && "pointer-events-none opacity-50")}
            >
              <ArrowLeft className="h-4 w-4" />
              {t.demands.prev}
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            {t.demands.pageOf
              .replace("{page}", String(page))
              .replace("{total}", String(totalPages))}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link
              href={pageHref(page + 1)}
              aria-label={t.demands.next}
              className={cn(page === totalPages && "pointer-events-none opacity-50")}
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
