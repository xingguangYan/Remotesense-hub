import Link from "next/link"
import {
  ArrowRight,
  FileText,
  Layers,
  MailCheck,
  Map as MapIcon,
  MousePointerClick,
  Ruler,
  ScanSearch,
  BrainCog,
  PhoneCall,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DemandCard } from "@/components/DemandCard"
import { EmptyState } from "@/components/EmptyState"
import {
  CATEGORY_LABELS,
  DEMAND_CATEGORIES,
  siteConfig,
  type DemandCategory,
} from "@/lib/constants"
import { prisma } from "@/lib/prisma"

const CATEGORY_ICONS: Record<DemandCategory, typeof FileText> = {
  IMAGE_ACQUISITION: MapIcon,
  DATA_PROCESSING: Layers,
  MODEL_TRAINING: BrainCog,
  CHANGE_DETECTION: ScanSearch,
  THEMATIC_MAPPING: Ruler,
  OTHER: MousePointerClick,
}

export default async function HomePage() {
  const latestDemands = await prisma.demand.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { _count: { select: { inquiries: true } } },
  })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    description: siteConfig.description,
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
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              发布遥感需求，精准对接专业服务
            </h1>
            <p className="mt-5 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
              {siteConfig.name} 是一个免注册的遥感需求撮合平台：影像获取、数据处理、模型训练、变化检测、专题制图，一条需求，多方案比选。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <Link href="/publish">
                  发布遥感需求
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/demands">浏览需求大厅</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 需求类型快捷入口 */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">需求类型</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          覆盖遥感产业链核心环节，点击直达对应需求大厅
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {DEMAND_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category]
            return (
              <Link
                key={category}
                href={`/demands?category=${category}`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {CATEGORY_LABELS[category]}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 最新需求 */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                最新需求
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                仅展示已完成邮件验证的需求，联系方式全程脱敏
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/demands">
                查看全部
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {latestDemands.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="暂时还没有已发布的需求"
                description="成为第一个发布遥感需求的人，服务方会主动找到您。"
                action={
                  <Button asChild>
                    <Link href="/publish">发布需求</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestDemands.map((demand) => (
                <DemandCard key={demand.id} demand={demand} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 三步流程 */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          三步完成需求对接
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "1. 发布需求",
              desc: "填写需求基本信息与联系方式，无需注册账号，提交即生成一次性凭证。",
            },
            {
              icon: MailCheck,
              title: "2. 邮件确认",
              desc: "验证链接发送至您的邮箱，点击确认后需求公开展示，同时收到专属管理链接。",
            },
            {
              icon: PhoneCall,
              title: "3. 服务方联系",
              desc: "服务方浏览需求并提交服务方案，您通过电话或邮箱直接对接，平台不介入交易。",
            },
          ].map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="rounded-lg border border-border bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-accent/10 text-accent">
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
      </section>
    </>
  )
}
