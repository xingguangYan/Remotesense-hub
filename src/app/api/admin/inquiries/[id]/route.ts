import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api"
import { isAdmin } from "@/lib/admin"

export const runtime = "nodejs"

/** 删除一条服务方意向 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) {
    return apiError(401, "UNAUTHORIZED", "请先登录管理后台")
  }

  await prisma.inquiry.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
