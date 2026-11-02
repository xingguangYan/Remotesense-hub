import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getClientIP } from "@/lib/api"
import { rateLimit, PUBLISH_LIMIT } from "@/lib/rate-limit"
import { verifyCaptcha } from "@/lib/captcha"
import { checkSensitive } from "@/lib/sensitive-words"
import { generateToken, hashToken } from "@/lib/tokens"
import {
  demandSchema,
} from "@/lib/validations"
import { sendEmail } from "@/lib/email/client"
import { verificationEmailHtml } from "@/lib/email/templates"
import { BUDGETS, DEMAND_CATEGORIES } from "@/lib/constants"

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000

/** 已发布需求列表（支持筛选，供客户端分页/筛选调用） */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") || undefined
  const region = searchParams.get("region") || undefined
  const budget = searchParams.get("budget") || undefined
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
  const pageSize = Math.min(
    24,
    Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10) || 12),
  )

  const where = {
    status: "published" as const,
    ...(category &&
      DEMAND_CATEGORIES.includes(category as never) && { category }),
    ...(budget && BUDGETS.includes(budget as never) && { budget }),
    ...(region && { region: { contains: region } }),
  }

  const [total, items] = await Promise.all([
    prisma.demand.count({ where }),
    prisma.demand.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        category: true,
        region: true,
        budget: true,
        createdAt: true,
      },
    }),
  ])

  return NextResponse.json({ items, total, page, pageSize })
}

/** 发布需求：校验 -> 限流 -> 验证码 -> 敏感词 -> 入库 pending -> 发验证邮件 */
export async function POST(req: Request) {
  const ip = getClientIP(req)

  const parsed = demandSchema.safeParse(await req.json())
  if (!parsed.success) {
    return apiError(422, "VALIDATION_ERROR", "表单校验未通过", {
      fieldErrors: parsed.error.flatten().fieldErrors,
    })
  }

  if (!verifyCaptcha(parsed.data.captchaAnswer)) {
    return apiError(400, "CAPTCHA_INVALID", "验证码错误，请重新输入")
  }

  const limited = await rateLimit(ip, PUBLISH_LIMIT)
  if (!limited.ok) {
    return apiError(429, "RATE_LIMITED", "发布过于频繁，每个 IP 每小时最多发布 3 条需求")
  }

  const { passed, hits } = checkSensitive(
    `${parsed.data.title} ${parsed.data.description} ${parsed.data.region}`,
  )
  if (!passed) {
    return apiError(400, "SENSITIVE_CONTENT", `提交内容包含敏感词：${hits.join("、")}，请修改后重试`)
  }

  const verifyToken = generateToken()
  const manageToken = generateToken()
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

 const demand = await prisma.demand.create({
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      region: parsed.data.region,
      area: parsed.data.area || null,
      resolution: parsed.data.resolution || null,
      timeRange: parsed.data.timeRange,
      budget: parsed.data.budget || null,
      description: parsed.data.description,
      contactName: parsed.data.contactName,
      contactPhone: parsed.data.contactPhone,
      contactEmail: parsed.data.contactEmail,
      company: parsed.data.company || null,
      allowDirectContact: parsed.data.allowDirectContact,
      status: "pending",
      verifyTokenHash: hashToken(verifyToken),
      verifyExpiresAt: new Date(Date.now() + VERIFY_TTL_MS),
      manageTokenHash: hashToken(manageToken),
    },
  })

  // 邮件发送失败不阻断发布（dev 模式下仅打印日志）
  try {
    await sendEmail({
      to: parsed.data.contactEmail,
      subject: `【RemoteSense Hub】请验证您发布的需求：${parsed.data.title}`,
      html: verificationEmailHtml({
        title: parsed.data.title,
        verifyUrl: `${base}/verify/${verifyToken}`,
        manageUrl: `${base}/manage/${manageToken}`,
      }),
    })
  } catch (error) {
    console.error("验证邮件发送失败:", error)
  }

  return NextResponse.json(
    { id: demand.id, status: "pending" },
    { status: 201 },
  )
}
