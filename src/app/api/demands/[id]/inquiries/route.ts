import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getClientIP } from "@/lib/api"
import { rateLimit, INQUIRY_LIMIT } from "@/lib/rate-limit"
import { verifyCaptcha } from "@/lib/captcha"
import { checkSensitive } from "@/lib/sensitive-words"
import { inquirySchema } from "@/lib/validations"
import { sendEmail } from "@/lib/email/client"
import {
  inquiryNotificationHtml,
  manualRelayHtml,
} from "@/lib/email/templates"
import { siteConfig } from "@/lib/constants"

/** 服务方对需求提交意向：校验 -> 验证码 -> 限流 -> 敏感词 -> 入库 -> 通知 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const parsed = inquirySchema.safeParse(await req.json())
  if (!parsed.success) {
    return apiError(422, "VALIDATION_ERROR", "表单校验未通过", {
      fieldErrors: parsed.error.flatten().fieldErrors,
    })
  }

  if (!verifyCaptcha(parsed.data.captchaAnswer)) {
    return apiError(400, "CAPTCHA_INVALID", "验证码错误，请重新输入")
  }

  const limited = await rateLimit(getClientIP(req), INQUIRY_LIMIT)
  if (!limited.ok) {
    return apiError(429, "RATE_LIMITED", "提交过于频繁，每个 IP 每小时最多提交 10 条咨询")
  }

  const demand = await prisma.demand.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      status: true,
      contactEmail: true,
      allowDirectContact: true,
    },
  })

  if (!demand || demand.status !== "published") {
    return apiError(404, "NOT_FOUND", "需求不存在或未通过验证，无法提交意向")
  }

  const { passed, hits } = checkSensitive(
    `${parsed.data.name} ${parsed.data.message}`,
  )
  if (!passed) {
    return apiError(400, "SENSITIVE_CONTENT", `提交内容包含敏感词：${hits.join("、")}，请修改后重试`)
  }

  await prisma.inquiry.create({
    data: {
      demandId: demand.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message,
    },
  })

  try {
    if (demand.allowDirectContact) {
      await sendEmail({
        to: demand.contactEmail,
        subject: `【RemoteSense Hub】新服务方意向：${demand.title}`,
        html: inquiryNotificationHtml({
          demandTitle: demand.title,
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          message: parsed.data.message,
          demandUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/demands/${demand.id}`,
        }),
      })
    } else {
      await sendEmail({
        to: siteConfig.cooperationEmail,
        subject: `【需人工转达】${demand.title} 收到新合作意向`,
        html: manualRelayHtml({
          demandTitle: demand.title,
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          message: parsed.data.message,
        }),
      })
    }
  } catch (error) {
    console.error("咨询通知邮件发送失败:", error)
  }

  return NextResponse.json(
    { ok: true, message: "意向已提交" },
    { status: 201 },
  )
}
