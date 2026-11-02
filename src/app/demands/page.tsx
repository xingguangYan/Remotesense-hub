import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Suspense } from "react"
import { DemandCard } from "@/components/DemandCard"
import { DemandFilters } from "@/components/DemandFilters"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { BUDGETS, DEMAND_CATEGORIES } from "@/lib/constants"
import { prisma } from "@/lib/prisma"

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            需求大厅
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            共 {total} 条已验证需求 · 按发布时间倒序 · 联系方式已脱敏
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Suspense fallback={<div className="h-[88px] rounded-lg bg-muted/40" />}>
          <DemandFilters />
        </Suspense>
      </div>

      <div className="mt-6">
        {demands.length === 0 ? (
          <EmptyState
            title={hasFilters ? "没有符合筛选条件的需求" : "暂时还没有已发布的需求"}
            description={
              hasFilters
                ? "试试放宽筛选条件，或发布一条新的需求。"
                : "成为第一个发布遥感需求的人。"
            }
            action={
              <div className="flex gap-3">
                {hasFilters && (
                  <Button asChild variant="outline">
                    <Link href="/demands">清除筛选</Link>
                  </Button>
                )}
                <Button asChild>
                  <Link href="/publish">发布需求</Link>
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demands.map((demand) => (
              <DemandCard key={demand.id} demand={demand} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button asChild variant="outline" size="sm" aria-label="上一页">
            <Link
              href={pageHref(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            >
              <ArrowLeft className="h-4 w-4" />
              上一页
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 页
          </span>
          <Button asChild variant="outline" size="sm" aria-label="下一页">
            <Link
              href={pageHref(page + 1)}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            >
              下一页
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
