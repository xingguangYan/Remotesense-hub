import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getClientIP } from "@/lib/api"
import { rateLimit, COOPERATION_LIMIT } from "@/lib/rate-limit"
import { verifyCaptcha } from "@/lib/captcha"
import { checkSensitive } from "@/lib/sensitive-words"
import { cooperationSchema } from "@/lib/validations"
import { sendEmail } from "@/lib/email/client"
import { cooperationNotificationHtml } from "@/lib/email/templates"
import { siteConfig } from "@/lib/constants"

/** 商务合作咨询：校验 -> 验证码 -> 限流 -> 敏感词 -> 入库 -> 转发到商务邮箱 */
export async function POST(req: Request) {
  const parsed = cooperationSchema.safeParse(await req.json())
  if (!parsed.success) {
    return apiError(422, "VALIDATION_ERROR", "表单校验未通过", {
      fieldErrors: parsed.error.flatten().fieldErrors,
    })
  }

  if (!verifyCaptcha(parsed.data.captchaAnswer)) {
    return apiError(400, "CAPTCHA_INVALID", "验证码错误，请重新输入")
  }

  const limited = await rateLimit(getClientIP(req), COOPERATION_LIMIT)
  if (!limited.ok) {
    return apiError(429, "RATE_LIMITED", "提交过于频繁，请稍后再试")
  }

  const { passed, hits } = checkSensitive(
    `${parsed.data.name} ${parsed.data.message}`,
  )
  if (!passed) {
    return apiError(400, "SENSITIVE_CONTENT", `提交内容包含敏感词：${hits.join("、")}，请修改后重试`)
  }

  const record = await prisma.cooperation.create({
    data: {
      name: parsed.data.name,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email,
      message: parsed.data.message,
    },
  })

  try {
    await sendEmail({
      to: siteConfig.cooperationEmail,
      subject: `【RemoteSense Hub】新的商务合作咨询 - ${parsed.data.name}`,
      html: cooperationNotificationHtml({
        name: parsed.data.name,
        company: parsed.data.company || "",
        phone: parsed.data.phone || "",
        email: parsed.data.email,
        message: parsed.data.message,
      }),
    })
  } catch (error) {
    console.error("合作咨询转发邮件发送失败:", error)
  }

  return NextResponse.json({ id: record.id, ok: true }, { status: 201 })
}
