import Link from "next/link"
import { CheckCircle2, Mail, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import { ResendVerify } from "./ResendVerify"

export default async function PublishSuccessPage({
  searchParams,
}: {
  searchParams?: { id?: string; mail?: string }
}) {
  const t = getMessages(getLocale())
  const mailFailed = searchParams?.mail === "failed" && !!searchParams?.id

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </span>
      <h1 className="mt-6 text-xl font-bold text-foreground sm:text-2xl">
        {t.publish.successTitle}
      </h1>
      <p className="mt-4 flex max-w-lg items-start gap-2 text-left text-sm leading-relaxed text-muted-foreground">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        {t.publish.successDesc}
      </p>

      {mailFailed && (
        <div className="mt-6 w-full max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            验证邮件发送失败
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-amber-700">
            系统未能将验证邮件送达您的邮箱。常见原因：邮箱地址填写有误、邮件被拦截进垃圾箱，或平台发信域名尚未通过验证。
            请先检查邮箱地址与垃圾邮件箱，然后点击下方按钮重试；若多次失败，平台管理员会在后台看到您的需求并可以直接为您审核上线。
          </p>
          {searchParams?.id && <ResendVerify demandId={searchParams.id} />}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/demands">{t.verify.goToDemands}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t.verify.backHome}</Link>
        </Button>
      </div>
      <p className="mt-10 max-w-lg text-xs text-muted-foreground">
        {t.publish.successHint}
      </p>
    </div>
  )
}
