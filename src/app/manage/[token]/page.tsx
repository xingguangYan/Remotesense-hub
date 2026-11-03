import Link from "next/link"
import { notFound } from "next/navigation"
import { Eye, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ManageControls } from "@/components/ManageControls"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import {
  BUDGET_LABELS,
  CATEGORY_LABELS,
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
  const locale = getLocale()
  const t = getMessages(locale)

  const demand = await prisma.demand.findUnique({
    where: { manageTokenHash: hashToken(params.token) },
    include: { inquiries: { orderBy: { createdAt: "desc" } } },
  })

  if (!demand) notFound()

  const categoryLabel =
    CATEGORY_LABELS[locale][demand.category as DemandCategory] || demand.category
  const budgetLabel = demand.budget
    ? BUDGET_LABELS[locale][demand.budget as BudgetRange] || demand.budget
    : t.common.budgetNegotiable
  const status =
    t.manage.status[demand.status as DemandStatus] || demand.status

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="mb-6">
        <p className="text-xs text-muted-foreground">{t.manage.notice}</p>
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
          <CardTitle>{t.manage.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              [t.detail.specs.category, categoryLabel],
              [t.detail.specs.region, demand.region],
              [t.detail.specs.budget, budgetLabel],
              [t.detail.specs.time, demand.timeRange],
              [t.detail.specs.resolution, demand.resolution || t.common.notFilled],
              [t.detail.specs.area, demand.area || t.common.notFilled],
              [t.common.viewsUnit, `${demand.viewCount} ${t.common.viewsUnit}`],
              [t.common.postedAgo, timeAgo(demand.createdAt)],
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
            <p className="text-xs text-muted-foreground">{t.detail.descTitle}</p>
            <p className="mt-1 whitespace-pre-line rounded-md bg-muted/40 p-3 text-sm leading-7 text-foreground/90">
              {demand.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{t.manage.contactTitle}</span>
            <Badge variant="outline">{t.manage.contactBadge}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">{t.detail.contactName}</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {demand.contactName}
              </dd>
            </div>
            {demand.company && (
              <div>
                <dt className="text-xs text-muted-foreground">{t.detail.company}</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {demand.company}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">{t.detail.phone}</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {demand.contactPhone}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t.detail.email}</dt>
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
            {t.manage.inquiriesTitle}（{demand.inquiries.length} {t.manage.inquiriesUnit}）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {demand.inquiries.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Eye className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t.manage.emptyInquiries}
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
          {t.manage.viewPublic}
        </Link>
      </div>
    </div>
  )
}
