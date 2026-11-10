import { prisma } from "./prisma"
import { maskEmail, maskPhone } from "./mask"
import { startOfTodayUtc } from "./utils"

/**
 * 展示层(国内静态导出)的唯一数据出口。
 * 只在主站 CI 构建期运行，产出 cn/public/data/demands.json。
 * 规则：仅 published 且未过截止；联系方式脱敏；字段顺序固定；不含任何时间戳，保证 JSON 可确定性比对。
 */
export type PublicDemand = {
  id: string
  title: string
  category: string
  region: string
  area: string | null
  resolution: string | null
  timeRange: string
  budget: string | null
  description: string
  contactName: string
  contactPhone: string
  contactEmail: string
  company: string | null
  allowDirectContact: boolean
  createdAt: string
  startAt: string | null
  deadlineAt: string | null
  inquiriesCount: number
}

export type DemandDataset = { demands: PublicDemand[] }

export async function buildPublicDataset(): Promise<DemandDataset> {
  const rows = await prisma.demand.findMany({
    where: {
      status: "published",
      OR: [{ deadlineAt: null }, { deadlineAt: { gte: startOfTodayUtc() } }],
    },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    include: { _count: { select: { inquiries: true } } },
  })

  const demands: PublicDemand[] = rows.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    region: d.region,
    area: d.area,
    resolution: d.resolution,
    timeRange: d.timeRange,
    budget: d.budget,
    description: d.description,
    contactName: d.contactName,
    contactPhone: maskPhone(d.contactPhone),
    contactEmail: maskEmail(d.contactEmail),
    company: d.company,
    allowDirectContact: d.allowDirectContact,
    createdAt: d.createdAt.toISOString(),
    startAt: d.startAt ? d.startAt.toISOString() : null,
    deadlineAt: d.deadlineAt ? d.deadlineAt.toISOString() : null,
    inquiriesCount: d._count.inquiries,
  }))

  return { demands }
}
