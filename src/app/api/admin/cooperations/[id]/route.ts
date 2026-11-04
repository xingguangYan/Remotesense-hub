import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api"
import { isAdmin } from "@/lib/admin"

export const runtime = "nodejs"

/** 删除一条商务合作咨询 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin()) {
    return apiError(401, "UNAUTHORIZED", "请先登录管理后台")
  }

  await prisma.cooperation.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
