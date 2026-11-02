"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Pencil, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/** 管理页的操作区：编辑入口 + 关闭需求（带确认弹窗） */
export function ManageControls({
  manageToken,
  closed,
}: {
  manageToken: string
  closed: boolean
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  async function closeDemand() {
    setClosing(true)
    try {
      const res = await fetch(`/api/manage/${manageToken}/close`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error?.message || "操作失败，请稍后重试")
      }
      toast.success("需求已关闭，不再对服务方展示。")
      setConfirmOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败，请稍后重试")
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {!closed && (
        <Button asChild variant="outline" size="lg">
          <Link href={`/manage/${manageToken}/edit`}>
            <Pencil className="h-4 w-4" />
            编辑需求
          </Link>
        </Button>
      )}
      {!closed && (
        <Button
          variant="outline"
          size="lg"
          className="text-destructive hover:bg-destructive/5"
          onClick={() => setConfirmOpen(true)}
        >
          <XCircle className="h-4 w-4" />
          关闭需求
        </Button>
      )}
      {closed && (
        <p className="text-sm text-muted-foreground">
          该需求已关闭，不再展示在需求大厅。如需重新开放，请联系平台商务邮箱。
        </p>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>关闭这条需求？</DialogTitle>
            <DialogDescription>
              关闭后该需求将从需求大厅下线，服务方无法再提交意向。此操作不可自行恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={closing}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={closeDemand}
              disabled={closing}
            >
              {closing ? "关闭中…" : "确认关闭"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
