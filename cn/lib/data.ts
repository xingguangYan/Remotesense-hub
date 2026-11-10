import fs from "node:fs"
import path from "node:path"

/** 展示层公开字段（与 src/lib/cn-export.ts 输出严格一致，联系方式已脱敏） */
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

// 构建可能在仓库根目录或 cn/ 目录下发起，两种 cwd 都要能命中
function resolveSnapshotPath(): string {
  const candidates = [
    path.join(process.cwd(), "public", "data", "demands.json"),
    path.join(process.cwd(), "cn", "public", "data", "demands.json"),
  ]
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0]
}

/**
 * 构建时读取随产物部署的静态快照（cn/public/data/demands.json）。
 * 只在服务端 / 构建期调用，客户端组件不要 import 本文件。
 */
export function loadDataset(): DemandDataset {
  const file = resolveSnapshotPath()
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as DemandDataset
    if (Array.isArray(parsed?.demands)) return parsed
    console.warn(`[cn] demands.json(${file}) 结构非法，使用空数据`)
  } catch (error) {
    console.warn("[cn] 读取 demands.json 失败，使用空数据：", error)
  }
  return { demands: [] }
}
