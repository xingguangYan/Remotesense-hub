import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api"
import { hashToken } from "@/lib/tokens"
import { verifyTokenSchema } from "@/lib/validations"

/** 校验邮件 token：通过则 published，过期则 rejected 并失效 */
export async function POST(req: Request) {
  const parsed = verifyTokenSchema.safeParse(await req.json())
  if (!parsed.success) {
    return apiError(400, "INVALID_TOKEN", "验证链接无效")
  }

  const demand = await prisma.demand.findUnique({
    where: { verifyTokenHash: hashToken(parsed.data.token) },
    select: { id: true, title: true, status: true, verifyExpiresAt: true },
  })

  if (!demand) {
    return apiError(404, "INVALID_TOKEN", "验证链接无效或已被使用")
  }

  if (demand.status === "published") {
    return apiError(409, "ALREADY_VERIFIED", "该需求已通过验证，无需重复确认")
  }

  if (demand.status === "closed" || demand.status === "rejected") {
    return apiError(410, "INVALID_TOKEN", "该需求已关闭或失效，验证链接不可用")
  }

  if (demand.verifyExpiresAt && demand.verifyExpiresAt < new Date()) {
    await prisma.demand.update({
      where: { id: demand.id },
      data: { status: "rejected", verifyTokenHash: null, verifyExpiresAt: null },
    })
    return apiError(
      410,
      "EXPIRED_TOKEN",
      "验证链接已过期（超过 24 小时未确认），该需求已被标记为失效，请重新发布",
    )
  }

  const updated = await prisma.demand.update({
    where: { id: demand.id },
    data: {
      status: "published",
      verifyTokenHash: null,
      verifyExpiresAt: null,
    },
  })

  return NextResponse.json({ id: updated.id, title: updated.title })
}
