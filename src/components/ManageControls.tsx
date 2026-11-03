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
import { useTranslations } from "@/i18n/LocaleProvider"

/** 管理页的操作区：编辑入口 + 关闭需求（带确认弹窗） */
export function ManageControls({
  manageToken,
  closed,
}: {
  manageToken: string
  closed: boolean
}) {
  const router = useRouter()
  const { t } = useTranslations()
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
        const code = data?.error?.code as keyof typeof t.errors | undefined
        throw new Error(
          code && code in t.errors
            ? t.errors[code]
            : data?.error?.message || t.errors.fallback,
        )
      }
      toast.success(t.manage.toastClosed)
      setConfirmOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.errors.fallback)
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
            {t.manage.edit}
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
          {t.manage.close}
        </Button>
      )}
      {closed && (
        <p className="text-sm text-muted-foreground">{t.manage.closedNotice}</p>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.manage.closeConfirmTitle}</DialogTitle>
            <DialogDescription>{t.manage.closeConfirmDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={closing}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={closeDemand}
              disabled={closing}
            >
              {closing ? t.common.saving : t.manage.closeConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
