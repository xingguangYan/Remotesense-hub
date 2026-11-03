import { FileText } from "lucide-react"
import { PublishForm } from "@/components/PublishForm"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import { siteConfig } from "@/lib/constants"

export default async function PublishPage() {
  const t = getMessages(getLocale())

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
      <PublishForm />
      <p className="mt-10 text-center text-xs text-muted-foreground">
        {siteConfig.cooperationEmail}
      </p>
    </div>
  )
}
