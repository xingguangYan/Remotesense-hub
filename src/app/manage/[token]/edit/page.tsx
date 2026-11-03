import { notFound } from "next/navigation"
import { ManageEditForm } from "@/components/ManageEditForm"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/tokens"

export default async function ManageEditPage({
  params,
}: {
  params: { token: string }
}) {
  const t = getMessages(getLocale())

  const demand = await prisma.demand.findUnique({
    where: { manageTokenHash: hashToken(params.token) },
    select: {
      title: true,
      category: true,
      region: true,
      area: true,
      resolution: true,
      timeRange: true,
      budget: true,
      description: true,
      status: true,
    },
  })

  if (!demand) notFound()
  if (demand.status === "closed") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">{t.manage.closedTitle}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t.manage.closedDesc}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        {t.manage.editTitle}
      </h1>
      <ManageEditForm manageToken={params.token} initialData={demand} />
    </div>
  )
}
