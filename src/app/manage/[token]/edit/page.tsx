import { notFound } from "next/navigation"
import { ManageEditForm } from "@/components/ManageEditForm"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/tokens"

export default async function ManageEditPage({
  params,
}: {
  params: { token: string }
}) {
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
        <h1 className="text-xl font-bold text-foreground">需求已关闭</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          已关闭的需求不可编辑。如需重新开放，请联系平台商务邮箱。
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        编辑需求
      </h1>
      <ManageEditForm manageToken={params.token} initialData={demand} />
    </div>
  )
}
