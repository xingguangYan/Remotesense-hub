import Link from "next/link"
import { notFound } from "next/navigation"
import { Eye, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ManageControls } from "@/components/ManageControls"
import {
  BUDGET_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  type BudgetRange,
  type DemandCategory,
  type DemandStatus,
} from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/tokens"
import { timeAgo } from "@/lib/utils"

function statusVariant(
  status: string,
): "success" | "secondary" | "destructive" | "warning" {
  if (status === "published") return "success"
  if (status === "closed") return "secondary"
  if (status === "rejected") return "destructive"
  return "warning"
}

export default async function ManagePage({
  params,
}: {
  params: { token: string }
}) {
  const demand = await prisma.demand.findUnique({
    where: { manageTokenHash: hashToken(params.token) },
    include: { inquiries: { orderBy: { createdAt: "desc" } } },
  })

  if (!demand) notFound()

  const categoryLabel =
    CATEGORY_LABELS[demand.category as DemandCategory] || demand.category
  const budgetLabel = demand.budget
    ? BUDGET_LABELS[demand.budget as BudgetRange] || demand.budget
    : "面议"
  const status = STATUS_LABELS[demand.status as DemandStatus] || demand.status

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="mb-6">
        <p className="text-xs text-muted-foreground">
          凭管理链接进入 · 请妥善保管此链接，勿转发他人
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {demand.title}
          </h1>
          <Badge variant={statusVariant(demand.status)}>{status}</Badge>
        </div>
      </div>

      <div className="mb-8">
        <ManageControls manageToken={params.token} closed={demand.status === "closed"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>需求信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              ["需求类型", categoryLabel],
              ["目标区域", demand.region],
              ["预算区间", budgetLabel],
              ["时间要求", demand.timeRange],
              ["分辨率要求", demand.resolution || "未填写"],
              ["面积 / 范围", demand.area || "未填写"],
              ["浏览量", `${demand.viewCount} 次`],
              ["发布时间", timeAgo(demand.createdAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="text-xs text-muted-foreground">详细描述</p>
            <p className="mt-1 whitespace-pre-line rounded-md bg-muted/40 p-3 text-sm leading-7 text-foreground/90">
              {demand.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>您的联系方式</span>
            <Badge variant="outline">仅管理链接可见</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">联系人</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {demand.contactName}
              </dd>
            </div>
            {demand.company && (
              <div>
                <dt className="text-xs text-muted-foreground">单位</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {demand.company}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">手机号</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {demand.contactPhone}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">邮箱</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {demand.contactEmail}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            收到的服务方意向（{demand.inquiries.length} 条）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {demand.inquiries.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Eye className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                还没有服务方提交意向，需求发布后服务方会主动联系您。
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {demand.inquiries.map((inquiry) => (
                <li key={inquiry.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {inquiry.name}
                    </span>
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {inquiry.phone}
                    </a>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {inquiry.email}
                    </a>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(inquiry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 rounded-md bg-muted/40 p-3 text-sm leading-6 text-foreground/90">
                    {inquiry.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Link href="/demands" className="text-sm text-primary hover:underline">
          前往需求大厅查看公开页
        </Link>
      </div>
    </div>
  )
}
