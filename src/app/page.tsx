import Link from "next/link"
import {
  ArrowRight,
  BrainCog,
  Building2,
  FileText,
  Globe2,
  Layers,
  LineChart,
  MailCheck,
  Map as MapIcon,
  Mountain,
  MousePointerClick,
  PhoneCall,
  Ruler,
  ScanSearch,
  Satellite,
  Sprout,
  Waves,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DemandCard } from "@/components/DemandCard"
import { EmptyState } from "@/components/EmptyState"
import { StatCounter } from "@/components/StatCounter"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import { DEMAND_CATEGORIES, siteConfig } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import type { DemandCategory } from "@/lib/constants"

const CATEGORY_ICONS: Record<DemandCategory, typeof FileText> = {
  IMAGE_ACQUISITION: MapIcon,
  DATA_PROCESSING: Layers,
  MODEL_TRAINING: BrainCog,
  CHANGE_DETECTION: ScanSearch,
  THEMATIC_MAPPING: Ruler,
  OTHER: MousePointerClick,
}

const SCENARIOS = [
  { key: "agriculture" as const, icon: Sprout, accent: "from-emerald-400/20 to-emerald-400/0" },
  { key: "urban" as const, icon: Building2, accent: "from-sky-400/20 to-sky-400/0" },
  { key: "disaster" as const, icon: Waves, accent: "from-amber-400/20 to-amber-400/0" },
  { key: "mining" as const, icon: Mountain, accent: "from-orange-400/20 to-orange-400/0" },
]

const PROCESS_ICONS = [FileText, MailCheck, PhoneCall] as const

export default async function HomePage() {
  const locale = getLocale()
  const t = getMessages(locale)

  const [latestDemands, publishedCount, inquiryCount] = await Promise.all([
    prisma.demand.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { _count: { select: { inquiries: true } } },
    }),
    prisma.demand.count({ where: { status: "published" } }),
    prisma.inquiry.count(),
  ])

  const stats = [
    { value: publishedCount, label: t.home.stats.published, icon: FileText },
    { value: inquiryCount, label: t.home.stats.inquiries, icon: LineChart },
    { value: DEMAND_CATEGORIES.length, label: t.home.stats.categories, icon: Layers },
    { value: SCENARIOS.length, label: t.home.stats.scenarios, icon: Globe2 },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    description: t.meta.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_SITE_URL}/demands`,
      "query-input": "required name=search_string",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#122456]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 -top-24 h-[520px] w-[520px] rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <svg
          className="pointer-events-none absolute right-0 top-1/2 hidden h-[560px] w-[560px] -translate-y-1/2 text-white/30 lg:block"
          viewBox="0 0 560 560"
          fill="none"
          aria-hidden
        >
          <circle cx="280" cy="280" r="120" stroke="currentColor" strokeOpacity="0.5" />
          <circle
            cx="280"
            cy="280"
            r="180"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeDasharray="6 8"
          />
          <circle cx="280" cy="280" r="248" stroke="currentColor" strokeOpacity="0.2" />
          <ellipse
            cx="280"
            cy="280"
            rx="248"
            ry="90"
            stroke="#0EA5E9"
            strokeOpacity="0.55"
            strokeDasharray="3 10"
          />
          <ellipse cx="280" cy="280" rx="180" ry="60" stroke="#0EA5E9" strokeOpacity="0.35" />
          <circle cx="400" cy="190" r="5" fill="#0EA5E9" />
          <circle cx="150" cy="330" r="4" fill="white" fillOpacity="0.7" />
          <circle cx="460" cy="360" r="3" fill="white" fillOpacity="0.5" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pb-20 sm:pt-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur">
              <Satellite className="h-3.5 w-3.5" />
              {t.home.heroBadge}
            </span>
            <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              {t.home.heroDesc}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <Link href="/publish">
                  {t.common.publishCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/demands">{t.common.browseCta}</Link>
              </Button>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/15 bg-white/10 backdrop-blur sm:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-[#122456]/60 px-5 py-6">
                  <div className="flex items-center gap-2 text-white/60">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{stat.label}</span>
                  </div>
                  <div className="mt-2 text-3xl font-bold text-white">
                    <StatCounter value={stat.value} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 平台能力 */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            {t.home.capabilitiesTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.home.capabilitiesDesc}</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMAND_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category]
            const cat = t.home.cat[category]
            return (
              <Link
                key={category}
                href={`/demands?category=${category}`}
                className="group relative overflow-hidden rounded-lg border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {cat.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cat.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {t.common.viewAll}
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 应用场景 */}
      <section className="bg-[#0B1B45] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {t.home.scenariosTitle}
            </h2>
            <p className="mt-2 text-sm text-white/60">{t.home.scenariosDesc}</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCENARIOS.map((scenario) => {
              const Icon = scenario.icon
              const s = t.home.scenario[scenario.key]
              return (
                <div
                  key={scenario.key}
                  className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/25"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${scenario.accent}`}
                    aria-hidden
                  />
                  <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="relative mt-4 text-base font-semibold text-white">
                    {s.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/65">
                    {s.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 最新需求 */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {t.home.latestTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.home.latestDesc}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/demands">
              {t.common.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {latestDemands.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title={t.home.latestEmptyTitle}
              description={t.home.latestEmptyDesc}
              action={
                <Button asChild>
                  <Link href="/publish">{t.common.publishCta}</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestDemands.map((demand) => (
              <DemandCard key={demand.id} demand={demand} t={t} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {/* 三步流程 */}
      <section className="bg-muted/40 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            {t.home.processTitle}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {t.home.steps.map((step, i) => {
              const Icon = PROCESS_ICONS[i] ?? FileText
              return (
                <div
                  key={step.title}
                  className="relative overflow-hidden rounded-lg border border-border bg-white p-6 shadow-sm"
                >
                  <span
                    className="absolute right-5 top-4 select-none text-5xl font-bold text-primary/[0.07]"
                    aria-hidden
                  >
                    0{i + 1}
                  </span>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0B1B45] py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {t.home.ctaBandTitle}
            </h2>
            <p className="mt-2 text-sm text-white/60">{t.home.ctaBandDesc}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent">
              <Link href="/publish">
                {t.common.publishCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/cooperation">{t.nav.cooperation}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
