"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type Status = "loading" | "success" | "error"

export function VerifyClient({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState("正在验证…")

  // dev StrictMode 会导致 effect 重复执行，用 ref 保证验证只发一次
  const calledRef = useRef(false)

  useEffect(() => {
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
          setMessage(`「${data.title}」已通过验证，现在公开展示在需求大厅。`)
        } else {
          setStatus("error")
          setMessage(data?.error?.message || "验证失败，链接可能已失效。")
        }
      } catch {
        setStatus("error")
        setMessage("网络错误，请稍后重试或重新发布需求。")
      }
    })()
  }, [token])

  if (status === "loading") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 sm:py-28 text-center">
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
          需求验证成功
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/demands">前往需求大厅</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">返回首页</Link>
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
        验证未通过
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/publish">重新发布需求</Link>
        </Button>
      </div>
    </div>
  )
}
