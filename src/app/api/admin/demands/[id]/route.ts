import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api"
import { isAdmin } from "@/lib/admin"
import { DEMAND_STATUSES } from "@/lib/constants"

export const runtime = "nodejs"

/** 修改需求状态（审核通过 / 拒绝 / 关闭 / 恢复上架） */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) {
    return apiError(401, "UNAUTHORIZED", "请先登录管理后台")
  }

  const body = await req.json().catch(() => ({}))
  const status = body?.status
  if (!DEMAND_STATUSES.includes(status)) {
    return apiError(422, "VALIDATION_ERROR", "非法的需求状态")
  }

  const demand = await prisma.demand.update({
    where: { id: params.id },
    data: {
      status,
      // 审核通过即视为验证完成，清掉验证凭证
      ...(status === "published" && {
        verifyTokenHash: null,
        verifyExpiresAt: null,
      }),
    },
  })

  return NextResponse.json({ id: demand.id, status: demand.status })
}

/** 删除需求（级联删除其下所有咨询记录） */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) {
    return apiError(401, "UNAUTHORIZED", "请先登录管理后台")
  }

  await prisma.demand.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
