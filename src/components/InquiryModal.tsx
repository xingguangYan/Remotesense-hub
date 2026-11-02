"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Handshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Captcha } from "@/components/Captcha"
import { inquirySchema, type InquiryInput } from "@/lib/validations"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

export function InquiryModal({
  demandId,
  allowDirectContact,
}: {
  demandId: string
  allowDirectContact: boolean
}) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [captcha, setCaptcha] = useState("")
  const [captchaKey, setCaptchaKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { message: "" },
  })

  async function onValid(values: InquiryInput) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/demands/${demandId}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, captchaAnswer: captcha }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error?.message || "提交失败，请稍后重试")
      }
      setDone(true)
      reset()
      setCaptcha("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交失败，请稍后重试")
      setCaptcha("")
      setCaptchaKey((k) => k + 1)
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setTimeout(() => setDone(false), 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <Handshake className="h-4 w-4" />
          我对这个需求感兴趣
        </Button>
      </DialogTrigger>
      <DialogContent>
        {done ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              意向已提交
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {allowDirectContact
                ? "需求方将收到邮件通知并通过您留下的联系方式与您对接。"
                : "该需求方未开启直接联系，您的意向将由平台人工转达，请保持电话畅通。"}
            </p>
            <Button className="mt-6" onClick={() => handleOpenChange(false)}>
              知道了
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>提交服务意向</DialogTitle>
              <DialogDescription>
                {allowDirectContact
                  ? "请填写您的联系方式与服务方案，需求方将收到通知。"
                  : "该需求方未开启「允许直接联系」，您的意向将由平台人工转达。"}
              </DialogDescription>
            </DialogHeader>
            <form
              noValidate
              onSubmit={handleSubmit(onValid)}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="inquiry-name">
                    您的称呼 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inquiry-name"
                    className="mt-1.5"
                    placeholder="如：张经理"
                    {...register("name")}
                  />
                  <FieldError message={errors.name?.message} />
                </div>
                <div>
                  <Label htmlFor="inquiry-phone">
                    手机号 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inquiry-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    className="mt-1.5"
                    placeholder="中国大陆 11 位手机号"
                    {...register("phone")}
                  />
                  <FieldError message={errors.phone?.message} />
                </div>
              </div>
              <div>
                <Label htmlFor="inquiry-email">
                  邮箱 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="inquiry-email"
                  type="email"
                  className="mt-1.5"
                  placeholder="您的工作邮箱"
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>
              <div>
                <Label htmlFor="inquiry-message">
                  服务方案简述 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="inquiry-message"
                  rows={4}
                  className="mt-1.5"
                  placeholder="如：具备同类项目经验，可在 45 天内交付，初步报价…"
                  {...register("message")}
                />
                <FieldError message={errors.message?.message} />
              </div>
              <Captcha key={captchaKey} value={captcha} onChange={setCaptcha} />
              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "提交中…" : "提交意向"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
