import Link from "next/link"
import { CheckCircle2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PublishSuccessPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </span>
      <h1 className="mt-6 text-xl font-bold text-foreground sm:text-2xl">
        需求已提交，请查收邮件完成确认
      </h1>
      <p className="mt-4 flex max-w-lg items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        我们已向您的邮箱发送了一封验证邮件，包含确认发布链接与专属管理链接。验证链接 24 小时内有效，确认后需求才会公开展示。
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/demands">浏览需求大厅</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">返回首页</Link>
        </Button>
      </div>
      <p className="mt-10 max-w-lg text-xs text-muted-foreground">
        没收到邮件？请检查垃圾邮件文件夹；若 24 小时内未完成验证，该需求将被自动标记为失效，需重新发布。
      </p>
    </div>
  )
}
