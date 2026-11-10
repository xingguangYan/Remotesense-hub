import { FileText } from "lucide-react"
import { redirect } from "next/navigation"
import { PublishForm } from "@/components/PublishForm"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import { siteConfig } from "@/lib/constants"
import { isOAuthConfigured } from "@/lib/oauth"
import { getSessionUser } from "@/lib/session"

export default async function PublishPage() {
  const t = getMessages(getLocale())
  const user = getSessionUser()

  // 国内站（ModelScope 空间）开启 OAuth 后必须登录才能发布；Vercel 站保持原免注册流程
  if (isOAuthConfigured() && !user) {
    redirect("/auth/login?next=/publish")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <FileText className="h-6 w-6 text-accent" />
          {t.publish.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t.publish.intro}
        </p>
      </div>
      <PublishForm defaultName={user?.name || user?.username || ""} />
      <p className="mt-10 text-center text-xs text-muted-foreground">
        {siteConfig.cooperationEmail}
      </p>
    </div>
  )
}
