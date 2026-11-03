"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { useTranslations } from "@/i18n/LocaleProvider"
import { Input } from "@/components/ui/input"

export function Captcha({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useTranslations()
  const [question, setQuestion] = useState("")

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/captcha")
      const data = await res.json()
      setQuestion(data.question)
    } catch {
      setQuestion("")
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <div>
      <label
        htmlFor="captcha-answer"
        className="block text-sm font-medium text-foreground"
      >
        {t.captcha.label} <span className="text-destructive">*</span>
      </label>
      <div className="mt-1 flex items-center gap-3">
        <span
          className="inline-flex h-10 min-w-[110px] select-none items-center justify-center rounded-md bg-muted px-3 font-mono text-sm tabular-nums text-foreground"
          aria-label={t.captcha.question}
        >
          {question}
        </span>
        <Input
          id="captcha-answer"
          name="captchaAnswer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.captcha.placeholder}
          inputMode="numeric"
          autoComplete="off"
          className="max-w-[160px]"
          required
        />
        <button
          type="button"
          onClick={() => {
            void refresh()
            onChange("")
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t.captcha.refresh}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
