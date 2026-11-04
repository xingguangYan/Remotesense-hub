import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api"
import { isAdmin } from "@/lib/admin"
import { demandSchema } from "@/lib/validations"

export const runtime = "nodejs"

/** 管理员直接新增需求（免邮件验证，直接上线） */
export async function POST(req: Request) {
  if (!isAdmin()) {
    return apiError(401, "UNAUTHORIZED", "请先登录管理后台")
  }

  const parsed = demandSchema.safeParse(await req.json())
  if (!parsed.success) {
    return apiError(422, "VALIDATION_ERROR", "表单校验未通过", {
      fieldErrors: parsed.error.flatten().fieldErrors,
    })
  }

  const d = parsed.data
  const demand = await prisma.demand.create({
    data: {
      title: d.title,
      category: d.category,
      region: d.region,
      area: d.area || null,
      resolution: d.resolution || null,
      timeRange: d.timeRange,
      budget: d.budget || null,
      description: d.description,
      contactName: d.contactName,
      contactPhone: d.contactPhone,
      contactEmail: d.contactEmail,
      company: d.company || null,
      allowDirectContact: d.allowDirectContact,
      status: "published",
    },
  })

  return NextResponse.json({ id: demand.id }, { status: 201 })
}
