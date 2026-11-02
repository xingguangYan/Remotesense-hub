import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/constants"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        关于 {siteConfig.name}
      </h1>

      <div className="mt-8 space-y-8 text-sm leading-7 text-foreground/90">
        <section>
          <h2 className="text-base font-semibold text-foreground">平台定位</h2>
          <p className="mt-2 text-muted-foreground">
            {siteConfig.name} 是一个轻量级的遥感需求撮合平台，面向政府、科研单位与企业用户，提供影像获取、数据处理、模型训练、变化检测、专题制图等遥感需求的一站式发布与对接服务。平台不参与交易，仅提供信息撮合与传达渠道。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">服务范围</h2>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>· 需求发布与公开展示（免注册，邮箱验证）</li>
            <li>· 需求筛选与服务方意向提交</li>
            <li>· 商务合作咨询转达</li>
            <li>· 需求状态自助管理（凭管理链接）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">服务流程</h2>
          <ol className="mt-2 space-y-1.5 text-muted-foreground">
            <li>1. 需求方填写并提交需求，系统发送验证邮件；</li>
            <li>2. 需求方在 24 小时内点击验证链接，需求公开展示；</li>
            <li>3. 服务方浏览需求并提交服务意向，需求方收到邮件通知；</li>
            <li>4. 双方通过电话、邮箱直接对接，平台不介入具体交易。</li>
          </ol>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-amber-900">
            <ShieldCheck className="h-5 w-5" />
            免责声明
          </h2>
          <p className="mt-2 text-amber-800">
            本平台仅提供信息发布与撮合服务，不对需求内容的真实性、服务方的履约能力、交易结果承担任何责任。双方在交易前请自行核实对方资质、签署正式合同，并通过对公账户完成款项往来。平台不对任何线下交易纠纷提供担保或赔偿。发布内容不得包含敏感或违法信息，平台有权在不通知的情况下下线违规内容。
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/publish">发布需求</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cooperation">商务合作</Link>
        </Button>
      </div>
    </div>
  )
}
