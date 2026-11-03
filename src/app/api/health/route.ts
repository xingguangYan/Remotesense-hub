import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// 健康检查：验证数据库连通性与数据状态（仅返回计数，不泄露联系方式）
export async function GET() {
  try {
    const [published, pending, inquiries] = await Promise.all([
      prisma.demand.count({ where: { status: "published" } }),
      prisma.demand.count({ where: { status: "pending" } }),
      prisma.inquiry.count(),
    ])
    return NextResponse.json({ ok: true, published, pending, inquiries })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    )
  }
}
