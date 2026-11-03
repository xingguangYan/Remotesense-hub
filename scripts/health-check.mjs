import { PrismaClient } from "@prisma/client"

// 构建期探针：验证线上 Postgres 可读写（输出计入构建日志）
const prisma = new PrismaClient()
try {
  const [demands, inquiries, cooperations] = await Promise.all([
    prisma.demand.count(),
    prisma.inquiry.count(),
    prisma.cooperation.count(),
  ])
  console.log(`HEALTH_CHECK demands=${demands} inquiries=${inquiries} cooperations=${cooperations}`)
  await prisma.$disconnect()
} catch (error) {
  console.error("HEALTH_CHECK_ERROR", error instanceof Error ? error.message : String(error))
  await prisma.$disconnect()
  process.exit(1)
}
