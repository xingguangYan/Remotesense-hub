import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/demands`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/publish`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/cooperation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  const demands = await prisma.demand.findMany({
    where: { status: "published" },
    select: { id: true, updatedAt: true },
  }).catch(() => [])

  const demandPages: MetadataRoute.Sitemap = demands.map((demand) => ({
    url: `${base}/demands/${demand.id}`,
    lastModified: demand.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticPages, ...demandPages]
}
