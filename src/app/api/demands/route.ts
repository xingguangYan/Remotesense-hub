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
import { newDemandNotifyHtml } from "@/lib/email/templates"
import { BUDGETS, CATEGORY_LABELS, DEMAND_CATEGORIES, siteConfig } from "@/lib/constants"

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
      status: "published",
      manageTokenHash: hashToken(manageToken),
    },
  })

  // 直接发布模式：不向用户发送任何邮件，仅通知平台管理员（COOPERATION_EMAIL）
  try {
    await sendEmail({
      to: siteConfig.cooperationEmail,
      subject: `【新需求上线】${parsed.data.title}`,
      html: newDemandNotifyHtml({
        title: parsed.data.title,
        category: CATEGORY_LABELS.zh[parsed.data.category],
        region: parsed.data.region,
        budget: parsed.data.budget || null,
        contactName: parsed.data.contactName,
        contactPhone: parsed.data.contactPhone,
        contactEmail: parsed.data.contactEmail,
        demandUrl: `${base}/demands/${demand.id}`,
        adminUrl: `${base}/admin`,
      }),
    })
  } catch (error) {
    console.error("新需求通知邮件发送失败:", error)
  }

  return NextResponse.json(
    { id: demand.id, status: "published", manageToken },
    { status: 201 },
  )
}
