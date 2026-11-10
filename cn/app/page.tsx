import { getMessages, defaultLocale } from "@/i18n/messages"
import { siteConfig } from "@/lib/constants"
import { loadDataset } from "@cn/lib/data"
import { HomeCN } from "@cn/components/HomeCN"
import { mainSiteHref } from "@cn/lib/main-site"

export default function HomePage() {
  const t = getMessages(defaultLocale)
  const dataset = loadDataset()
  const siteUrl = mainSiteHref("")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl,
    description: t.meta.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/demands`,
      "query-input": "required name=search_string",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeCN demands={dataset.demands} />
    </>
  )
}
