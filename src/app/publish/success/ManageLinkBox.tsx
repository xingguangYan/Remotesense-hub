"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/LocaleProvider"

/** 专属管理链接：仅显示一次，复制保存后可随时编辑 / 关闭需求 */
export function ManageLinkBox({ href }: { href: string }) {
  const { t } = useTranslations()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t.publish.manageCopyFallback, href)
    }
  }

  return (
    <div className="mt-6 w-full max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
      <p className="text-sm font-semibold text-amber-800">
        {t.publish.manageNotice}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="sm" variant="outline">
          <Link href={href}>
            <ExternalLink className="h-3.5 w-3.5" />
            {t.publish.manageOpen}
          </Link>
        </Button>
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              {t.common.copied}
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              {t.common.copy}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
