import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api"
import { hashToken } from "@/lib/tokens"
import { manageEditSchema } from "@/lib/validations"
import { triggerCnSync } from "@/lib/cn-sync"

async function findDemandByToken(token: string) {
  return prisma.demand.findUnique({
    where: { manageTokenHash: hashToken(token) },
    include: { inquiries: { orderBy: { createdAt: "desc" } } },
  })
}

/** 凭管理链接读取需求详情（含意向联系方式） */
export async function GET(
  _req: Request,
  { params }: { params: { token: string } },
) {
  const demand = await findDemandByToken(params.token)
  if (!demand) {
    return apiError(404, "INVALID_TOKEN", "管理链接无效或已失效")
  }
  return NextResponse.json(demand)
}

/** 凭管理链接编辑需求（联系方式不可改） */
export async function PATCH(
  req: Request,
  { params }: { params: { token: string } },
) {
  const demand = await findDemandByToken(params.token)
  if (!demand) {
    return apiError(404, "INVALID_TOKEN", "管理链接无效或已失效")
  }
  if (demand.status === "closed") {
    return apiError(400, "VALIDATION_ERROR", "需求已关闭，无法编辑")
  }

  const parsed = manageEditSchema.safeParse(await req.json())
  if (!parsed.success) {
    return apiError(422, "VALIDATION_ERROR", "表单校验未通过", {
      fieldErrors: parsed.error.flatten().fieldErrors,
    })
  }

  const updated = await prisma.demand.update({
    where: { id: demand.id },
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      region: parsed.data.region,
      area: parsed.data.area || null,
      resolution: parsed.data.resolution || null,
      timeRange: parsed.data.timeRange,
      budget: parsed.data.budget || null,
      description: parsed.data.description,
    },
  })

  // 同步国内展示层（限时等待，失败不阻塞编辑）
  await triggerCnSync("管理链接编辑需求")

  return NextResponse.json({ id: updated.id, updatedAt: updated.updatedAt })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { token: string } },
) {
  const demand = await findDemandByToken(params.token)
  if (!demand) {
    return apiError(404, "INVALID_TOKEN", "管理链接无效或已失效")
  }

  await prisma.demand.update({
    where: { id: demand.id },
    data: { status: "closed" },
  })

  // 同步国内展示层（限时等待，失败不阻塞关闭）
  await triggerCnSync("管理链接关闭需求")

  return NextResponse.json({ ok: true })
}
