import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getMessages, defaultLocale } from "@/i18n/messages"
import { siteConfig } from "@/lib/constants"
import { loadDataset } from "@cn/lib/data"
import { mainSiteHref } from "@cn/lib/main-site"
import { DemandDetailCN } from "@cn/components/DemandDetailCN"

type Params = { id: string }

// getStaticPaths：构建时读本地快照 JSON，不依赖主站运行时
export function generateStaticParams() {
  return loadDataset().demands.map((demand) => ({ id: demand.id }))
}

export function generateMetadata({
  params,
}: {
  params: Params
}): Metadata {
  const t = getMessages(defaultLocale)
  const demand = loadDataset().demands.find((item) => item.id === params.id)
  if (!demand) {
    return { title: t.errors.NOT_FOUND }
  }
  return {
    title: `${demand.title} - ${demand.region}`,
    description: demand.description.slice(0, 120),
  }
}

export default function DemandDetailPage({ params }: { params: Params }) {
  const t = getMessages(defaultLocale)
  const demand = loadDataset().demands.find((item) => item.id === params.id)

  if (!demand) {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Demand",
    name: demand.title,
    description: demand.description,
    category: demand.category,
    areaServed: demand.region,
    datePosted: demand.createdAt,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DemandDetailCN demand={demand} />
    </>
  )
}
