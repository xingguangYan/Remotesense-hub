"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/LocaleProvider"

type Status = "loading" | "success" | "error"

export function VerifyClient({ token }: { token: string }) {
  const { t } = useTranslations()
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState(t.verify.verifying)
  const calledRef = useRef(false)

  useEffect(() => {
    // dev StrictMode 会导致 effect 重复执行，用 ref 保证验证只发一次
    if (calledRef.current) return
    calledRef.current = true

    void (async () => {
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage(
            t.verify.successDesc.replace("{title}", String(data.title || "")),
          )
        } else {
          setStatus("error")
          const code = data?.error?.code as keyof typeof t.errors | undefined
          setMessage(
            code && code in t.errors
              ? t.errors[code]
              : data?.error?.message || t.verify.networkError,
          )
        }
      } catch {
        setStatus("error")
        setMessage(t.verify.networkError)
      }
    })()
  }, [token, t])

  if (status === "loading") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="mt-6 text-sm text-muted-foreground">{message}</p>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </span>
        <h1 className="mt-6 text-xl font-bold text-foreground sm:text-2xl">
          {t.verify.successTitle}
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/demands">{t.verify.goToDemands}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t.verify.backHome}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <XCircle className="h-8 w-8 text-red-600" />
      </span>
      <h1 className="mt-6 text-xl font-bold text-foreground sm:text-2xl">
        {t.verify.errorTitle}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/publish">{t.verify.retry}</Link>
        </Button>
      </div>
    </div>
  )
}
