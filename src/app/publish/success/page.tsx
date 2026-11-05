import Link from "next/link"
import { CheckCircle2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import { CATEGORY_LABELS, BUDGET_LABELS, type BudgetRange, type DemandCategory } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { fmtDateOnly } from "@/lib/utils"
import { ManageLinkBox } from "./ManageLinkBox"

export default async function PublishSuccessPage({
  searchParams,
}: {
  searchParams?: { manage?: string; id?: string }
}) {
  const t = getMessages(getLocale())
  const token = searchParams?.manage
  const manageHref = token ? `/manage/${token}` : null
  const locale = getLocale()

  const demand = searchParams?.id
    ? await prisma.demand.findUnique({
        where: { id: searchParams.id },
        select: {
          id: true,
          title: true,
          category: true,
          region: true,
          budget: true,
          timeRange: true,
          startAt: true,
          deadlineAt: true,
          status: true,
        },
      })
    : null
  const isLive = demand?.status === "published"

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </span>
      <h1 className="mt-6 text-xl font-bold text-foreground sm:text-2xl">
        {t.publish.successTitle}
      </h1>
      <p className="mt-4 flex max-w-lg items-start gap-2 text-left text-sm leading-relaxed text-muted-foreground">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        {t.publish.successDesc}
      </p>

      {isLive && demand && (
        <div className="mt-8 w-full rounded-lg border border-emerald-200 bg-white p-5 text-left shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {CATEGORY_LABELS[locale][demand.category as DemandCategory] || demand.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {t.demands.newBannerTitle}
            </span>
          </div>
          <h2 className="mt-3 text-base font-semibold text-foreground">
            {demand.title}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <p>{demand.region}</p>
            <p>
              {demand.budget
                ? BUDGET_LABELS[locale][demand.budget as BudgetRange] || demand.budget
                : t.common.budgetNegotiable}
            </p>
            <p>{demand.timeRange}</p>
            <p>
              {demand.deadlineAt
                ? `${t.common.deadlineLabel} ${fmtDateOnly(demand.deadlineAt)}`
                : ""}
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild size="sm">
              <Link href={`/demands/${demand.id}`}>{t.publish.successViewMine}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/demands?new=${demand.id}`}>{t.verify.goToDemands}</Link>
            </Button>
          </div>
        </div>
      )}

      {manageHref && <ManageLinkBox href={manageHref} />}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant={!isLive ? "default" : "outline"}>
          <Link href="/demands">{t.verify.goToDemands}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t.verify.backHome}</Link>
        </Button>
      </div>
      <p className="mt-10 max-w-lg text-xs text-muted-foreground">
        {t.publish.successHint}
      </p>
    </div>
  )
}
