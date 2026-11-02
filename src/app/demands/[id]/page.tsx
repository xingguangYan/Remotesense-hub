import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarRange, Layers, MapPin, Ruler, Wallet } from "lucide-react"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InquiryModal } from "@/components/InquiryModal"
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
  const demand = await prisma.demand.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, region: true, status: true },
  })

  if (!demand || demand.status !== "published") {
    return { title: "需求不存在" }
  }

  const title = `${demand.title} - ${demand.region}`
  return {
    title,
    description: demand.description.slice(0, 120),
  }
}

export default async function DemandDetailPage({ params }: { params: Params }) {
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
    CATEGORY_LABELS[demand.category as DemandCategory] || demand.category
  const budgetLabel = demand.budget
    ? BUDGET_LABELS[demand.budget as BudgetRange] || demand.budget
    : "面议"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Demand",
    name: demand.title,
    description: demand.description,
    category: categoryLabel,
    areaServed: demand.region,
    datePosted: demand.createdAt.toISOString(),
  }

  const specs: { label: string; value: string | null; icon: typeof MapPin }[] = [
    { label: "目标区域", value: demand.region, icon: MapPin },
    { label: "需求类型", value: categoryLabel, icon: Layers },
    { label: "预算区间", value: budgetLabel, icon: Wallet },
    { label: "时间要求", value: demand.timeRange, icon: CalendarRange },
    { label: "分辨率要求", value: demand.resolution, icon: Ruler },
    { label: "面积 / 范围", value: demand.area, icon: Ruler },
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
          返回需求大厅
        </Link>
      </Button>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{categoryLabel}</Badge>
            <span className="text-xs text-muted-foreground">
              {timeAgo(demand.createdAt)}发布 · {demand.viewCount} 次浏览 · 收到{" "}
              {demand._count.inquiries} 条意向
            </span>
          </div>
          <h1 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">
            {demand.title}
          </h1>

          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-start gap-3">
                <spec.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">{spec.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-foreground">
                    {spec.value || "未填写"}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground">
            需求详细描述
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/90">
            {demand.description}
          </p>
        </div>

        <div className="border-t border-border bg-muted/30 p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground">
            联系方式（已脱敏）
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">联系人</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {demand.contactName}
              </p>
            </div>
            {demand.company && (
              <div>
                <p className="text-xs text-muted-foreground">单位</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {demand.company}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">手机号</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {maskPhone(demand.contactPhone)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">邮箱</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {maskEmail(demand.contactEmail)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            完整联系方式仅对通过验证的需求方在其管理链接中可见。
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
                ? "提交意向后，需求方将收到邮件通知，并通过您留下的联系方式与您对接。"
                : "该需求方未开启「允许直接联系」，您的意向将由平台人工转达。"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">商务合作</p>
            <p className="text-sm font-medium text-primary">
              {siteConfig.cooperationEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
