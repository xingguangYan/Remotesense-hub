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
import { useTranslations } from "@/i18n/LocaleProvider"
import { inquirySchema, type InquiryInput } from "@/lib/validations"

function fieldError(message?: string) {
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
  const { t } = useTranslations()
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
        const code = data?.error?.code as keyof typeof t.errors | undefined
        throw new Error(
          code && code in t.errors
            ? t.errors[code]
            : data?.error?.message || t.errors.fallback,
        )
      }
      setDone(true)
      reset()
      setCaptcha("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.errors.fallback)
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

  const f = t.inquiry.fields

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <Handshake className="h-4 w-4" />
          {t.detail.inquiryButton}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {done ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {t.inquiry.successTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {allowDirectContact ? t.inquiry.successDirect : t.inquiry.successRelay}
            </p>
            <Button className="mt-6" onClick={() => handleOpenChange(false)}>
              {t.common.confirm}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t.inquiry.title}</DialogTitle>
              <DialogDescription>
                {allowDirectContact ? t.inquiry.descDirect : t.inquiry.descRelay}
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
                    {f.name} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inquiry-name"
                    className="mt-1.5"
                    placeholder={f.namePlaceholder}
                    {...register("name")}
                  />
                  {fieldError(errors.name?.message)}
                </div>
                <div>
                  <Label htmlFor="inquiry-phone">
                    {f.phone} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inquiry-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    className="mt-1.5"
                    placeholder={t.publish.fields.phonePlaceholder}
                    {...register("phone")}
                  />
                  {fieldError(errors.phone?.message)}
                </div>
              </div>
              <div>
                <Label htmlFor="inquiry-email">
                  {f.email} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="inquiry-email"
                  type="email"
                  className="mt-1.5"
                  placeholder={f.emailPlaceholder}
                  {...register("email")}
                />
                {fieldError(errors.email?.message)}
              </div>
              <div>
                <Label htmlFor="inquiry-message">
                  {f.message} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="inquiry-message"
                  rows={4}
                  className="mt-1.5"
                  placeholder={f.messagePlaceholder}
                  {...register("message")}
                />
                {fieldError(errors.message?.message)}
              </div>
              <Captcha key={captchaKey} value={captcha} onChange={setCaptcha} />
              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={submitting}
                >
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t.common.submitting : t.inquiry.submit}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
