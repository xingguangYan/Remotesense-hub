import { Database, Handshake, Mail, Network } from "lucide-react"
import { CopyEmail } from "@/components/CopyEmail"
import { CooperationForm } from "@/components/CooperationForm"
import { siteConfig } from "@/lib/constants"

const DIRECTIONS = [
  {
    icon: Database,
    title: "数据服务",
    desc: "卫星影像数据授权、历史影像供给、数据脱敏与合规处理，平台对接需求方数据采购场景。",
  },
  {
    icon: Network,
    title: "项目共建",
    desc: "共同承接区域级遥感监测项目，平台提供需求撮合与项目线索，伙伴提供技术与交付能力。",
  },
  {
    icon: Handshake,
    title: "渠道合作",
    desc: "行业渠道、代理商、测绘资质单位共赢合作，扩大平台在政府与科研单位的服务覆盖。",
  },
]

export default function CooperationPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <section className="rounded-lg border border-border bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              商务合作
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              欢迎数据厂商、遥感服务企业、测绘机构与平台洽谈合作。提交合作意向后我们会邮件回复，重要合作可直接发送邮件至商务合作邮箱。
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-md bg-muted/60 px-4 py-3">
              <Mail className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                {siteConfig.cooperationEmail}
              </span>
              <CopyEmail email={siteConfig.cooperationEmail} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          合作方向
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {DIRECTIONS.map((direction) => {
            const Icon = direction.icon
            return (
              <div
                key={direction.title}
                className="rounded-lg border border-border bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {direction.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {direction.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          提交合作意向
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          提交后咨询将自动转发至平台商务邮箱，通常 1 个工作日内回复。
        </p>
        <div className="mt-5">
          <CooperationForm />
        </div>
      </section>
    </div>
  )
}
