"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function CloseDemandButton({ demandId, label }: { demandId: string; label: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function close() {
    if (!confirm(`${label}?`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/my/demands/${demandId}/close`, { method: "POST" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success("已关闭")
      router.refresh()
    } catch (error) {
      toast.error(`关闭失败：${error instanceof Error ? error.message : "未知错误"}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={close} disabled={busy}>
      {label}
    </Button>
  )
}
