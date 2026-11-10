import { FileText, LogIn } from "lucide-react"
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
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-7 w-7 text-primary" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-foreground">登录后即可发布需求</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          国内站使用 ModelScope 账号登录。点击下方按钮在新窗口完成授权，授权后回到本页刷新即可发布。
        </p>
        <a
          href="/auth/login?next=/publish"
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <LogIn className="h-4 w-4" />
          使用 ModelScope 登录
        </a>
      </div>
    )
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
