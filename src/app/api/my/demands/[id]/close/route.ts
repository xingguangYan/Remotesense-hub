import { NextResponse } from "next/server"
import { apiError } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

/** 发布者关闭自己的需求（登录态校验，仅允许本人操作） */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser()
  if (!user) return apiError(401, "UNAUTHORIZED", "请先登录")

  const demand = await prisma.demand.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true, status: true },
  })
  if (!demand || demand.userId !== user.id) {
    return apiError(404, "NOT_FOUND", "需求不存在或无权操作")
  }
  if (demand.status === "closed") {
    return NextResponse.json({ ok: true, status: "closed" })
  }

  await prisma.demand.update({
    where: { id: demand.id },
    data: { status: "closed" },
  })
  return NextResponse.json({ ok: true, status: "closed" })
}
