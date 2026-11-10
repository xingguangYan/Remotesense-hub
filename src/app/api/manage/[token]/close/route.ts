import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api"
import { hashToken } from "@/lib/tokens"
import { triggerCnSync } from "@/lib/cn-sync"

/** 凭管理链接关闭需求：从需求大厅下线 */
export async function POST(
  _req: Request,
  { params }: { params: { token: string } },
) {
  const demand = await prisma.demand.findUnique({
    where: { manageTokenHash: hashToken(params.token) },
    select: { id: true, status: true },
  })

  if (!demand) {
    return apiError(404, "INVALID_TOKEN", "管理链接无效或已失效")
  }
  if (demand.status === "closed") {
    return apiError(400, "VALIDATION_ERROR", "需求已关闭，无需重复操作")
  }

  await prisma.demand.update({
    where: { id: demand.id },
    data: { status: "closed" },
  })

  // 同步国内展示层（限时等待，失败不阻塞关闭）
  await triggerCnSync("管理链接关闭需求")

  return NextResponse.json({ ok: true })
}
