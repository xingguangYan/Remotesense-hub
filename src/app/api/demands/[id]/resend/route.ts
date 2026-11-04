import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getClientIP } from "@/lib/api"
import { rateLimit } from "@/lib/rate-limit"
import { generateToken, hashToken } from "@/lib/tokens"
import { sendEmail } from "@/lib/email/client"
import { verificationEmailHtml } from "@/lib/email/templates"

export const runtime = "nodejs"

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000

/** 重新发送验证邮件：验证与管理 token 一并重新生成，旧链接失效 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const limited = await rateLimit(getClientIP(req), {
    action: "resend",
    limit: 5,
  })
  if (!limited.ok) {
    return apiError(429, "RATE_LIMITED", "重发过于频繁，请稍后再试")
  }

  const demand = await prisma.demand.findUnique({
    where: { id: params.id },
    select: { title: true, status: true, contactEmail: true },
  })
  if (!demand) {
    return apiError(404, "NOT_FOUND", "需求不存在")
  }
  if (demand.status !== "pending") {
    return apiError(409, "ALREADY_VERIFIED", "该需求无需验证")
  }

  const verifyToken = generateToken()
  const manageToken = generateToken()
  await prisma.demand.update({
    where: { id: params.id },
    data: {
      verifyTokenHash: hashToken(verifyToken),
      verifyExpiresAt: new Date(Date.now() + VERIFY_TTL_MS),
      manageTokenHash: hashToken(manageToken),
    },
  })

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  try {
    await sendEmail({
      to: demand.contactEmail,
      subject: `【RemoteSense Hub】请验证您发布的需求：${demand.title}`,
      html: verificationEmailHtml({
        title: demand.title,
        verifyUrl: `${base}/verify/${verifyToken}`,
        manageUrl: `${base}/manage/${manageToken}`,
      }),
    })
  } catch (error) {
    console.error("重发验证邮件失败:", error)
    return apiError(
      500,
      "INTERNAL_ERROR",
      "邮件发送失败，可能是邮箱地址有误或发送服务异常，请联系平台管理员",
    )
  }

  return NextResponse.json({ ok: true })
}
