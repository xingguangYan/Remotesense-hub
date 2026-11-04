import Link from "next/link"
import { CheckCircle2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import { ManageLinkBox } from "./ManageLinkBox"

export default async function PublishSuccessPage({
  searchParams,
}: {
  searchParams?: { manage?: string }
}) {
  const t = getMessages(getLocale())
  const token = searchParams?.manage
  const manageHref = token ? `/manage/${token}` : null

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

      {manageHref && <ManageLinkBox href={manageHref} />}

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
