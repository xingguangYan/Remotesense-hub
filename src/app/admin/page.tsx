import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"
import { AdminPanel } from "./AdminPanel"

export const metadata = { title: "管理后台" }

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  if (!isAdmin()) redirect("/admin/login")

  const [demands, inquiries, cooperations] = await Promise.all([
    prisma.demand.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { inquiries: true } } },
    }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: { demand: { select: { title: true } } },
    }),
    prisma.cooperation.findMany({ orderBy: { createdAt: "desc" } }),
  ])

  // RSC 序列化：Date → ISO 字符串
  const serializable = demands.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    verifyExpiresAt: d.verifyExpiresAt?.toISOString() ?? null,
  }))
  const inquiriesSer = inquiries.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  }))
  const cooperationsSer = cooperations.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }))

  return (
    <AdminPanel
      demands={serializable}
      inquiries={inquiriesSer}
      cooperations={cooperationsSer}
    />
  )
}
