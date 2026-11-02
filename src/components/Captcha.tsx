"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Captcha({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [question, setQuestion] = useState("加载中…")

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/captcha")
      const data = await res.json()
      setQuestion(data.question)
    } catch {
      setQuestion("加载失败，请点击刷新")
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
        人机验证 <span className="text-destructive">*</span>
      </label>
      <div className="mt-1 flex items-center gap-3">
        <span
          className="inline-flex h-10 min-w-[110px] select-none items-center justify-center rounded-md bg-muted px-3 font-mono text-sm tabular-nums text-foreground"
          aria-label="验证码题目"
        >
          {question}
        </span>
        <Input
          id="captcha-answer"
          name="captchaAnswer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入计算结果"
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
          aria-label="刷新验证码"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
