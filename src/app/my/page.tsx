import Link from "next/link"
import { LogIn, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import {
  BUDGET_LABELS,
  CATEGORY_LABELS,
  type BudgetRange,
  type DemandCategory,
} from "@/lib/constants"
import { isOAuthConfigured } from "@/lib/oauth"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { timeAgo } from "@/lib/utils"
import { CloseDemandButton } from "./CloseDemandButton"

export const dynamic = "force-dynamic"

const STATUS_LABELS = {
  zh: { pending: "待审核", published: "已发布", closed: "已关闭", rejected: "已拒绝" },
  en: { pending: "Pending", published: "Published", closed: "Closed", rejected: "Rejected" },
} as const

export default async function MyDemandsPage() {
  const locale = getLocale()
  const t = getMessages(locale)
  const user = getSessionUser()

  if (isOAuthConfigured() && !user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-7 w-7 text-primary" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-foreground">{t.nav.myDemands}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          使用 ModelScope 账号登录后，可查看和管理自己发布的需求。
        </p>
        <a
          href="/auth/login?next=/my"
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <LogIn className="h-4 w-4" />
          使用 ModelScope 登录
        </a>
      </div>
    )
  }

  const demands = user
    ? await prisma.demand.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          region: true,
          budget: true,
          status: true,
          createdAt: true,
        },
      })
    : []

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="mb-8 flex items-center gap-3">
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-12 w-12 rounded-full border border-border object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserRound className="h-6 w-6 text-muted-foreground" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t.nav.myDemands}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user ? user.name || user.username || t.nav.loggedInAs : t.nav.login}
          </p>
        </div>
        <Button asChild className="ml-auto">
          <Link href="/publish">{t.nav.publish}</Link>
        </Button>
      </div>

      {demands.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-10 text-center text-sm text-muted-foreground">
          还没有发布过需求。
        </div>
      ) : (
        <ul className="space-y-3">
          {demands.map((d) => {
            const categoryLabel =
              CATEGORY_LABELS[locale][d.category as DemandCategory] || d.category
            const budgetLabel = d.budget
              ? BUDGET_LABELS[locale][d.budget as BudgetRange] || d.budget
              : t.common.budgetNegotiable
            const statusLabel =
              STATUS_LABELS[locale][d.status as keyof (typeof STATUS_LABELS)["zh"]] ?? d.status
            return (
              <li
                key={d.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{categoryLabel}</Badge>
                    <span className="text-xs text-muted-foreground">{d.region}</span>
                    <span className="text-xs text-muted-foreground">· {budgetLabel}</span>
                    <span className="text-xs text-muted-foreground">· {timeAgo(d.createdAt)}</span>
                  </div>
                  <p className="mt-1 truncate font-medium text-foreground">{d.title}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                      (d.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : d.status === "closed"
                          ? "bg-muted text-muted-foreground"
                          : "bg-amber-50 text-amber-700")
                    }
                  >
                    {statusLabel}
                  </span>
                  {d.status === "published" && (
                    <>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/demands/${d.id}`}>查看</Link>
                      </Button>
                      <CloseDemandButton demandId={d.id} label="关闭需求" />
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
