"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

/** 重发验证邮件：限流保护，失败时提示联系管理员 */
export function ResendVerify({ demandId }: { demandId: string }) {
  const [loading, setLoading] = useState(false)

  async function resend() {
    setLoading(true)
    try {
      const res = await fetch(`/api/demands/${demandId}/resend`, {
        method: "POST",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error?.message || "重发失败，请稍后再试")
        return
      }
      toast.success("验证邮件已重新发送，请查收（注意检查垃圾邮件箱）")
    } catch {
      toast.error("网络异常，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={resend}
      disabled={loading}
      variant="outline"
      size="sm"
      className="mt-3"
    >
      {loading ? "发送中…" : "重新发送验证邮件"}
    </Button>
  )
}
