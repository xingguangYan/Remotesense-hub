"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Captcha } from "@/components/Captcha"
import { useTranslations } from "@/i18n/LocaleProvider"
import { cooperationSchema, type CooperationInput } from "@/lib/validations"

function fieldError(message?: string) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

export function CooperationForm() {
  const { t } = useTranslations()
  const [done, setDone] = useState(false)
  const [captcha, setCaptcha] = useState("")
  const [captchaKey, setCaptchaKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CooperationInput>({
    resolver: zodResolver(cooperationSchema),
  })

  async function onValid(values: CooperationInput) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/cooperation", {
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

  const f = t.cooperation.fields

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-3 text-base font-semibold text-foreground">
          {t.cooperation.successTitle}
        </h3>
        <p className="mt-2 text-sm text-emerald-800">{t.cooperation.successDesc}</p>
        <Button variant="outline" className="mt-5" onClick={() => setDone(false)}>
          {t.cooperation.again}
        </Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid)}
      className="space-y-5 rounded-lg border border-border bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="coop-name">
            {f.name} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="coop-name"
            className="mt-1.5"
            placeholder={f.namePlaceholder}
            {...register("name")}
          />
          {fieldError(errors.name?.message)}
        </div>
        <div>
          <Label htmlFor="coop-company">{f.company}</Label>
          <Input
            id="coop-company"
            className="mt-1.5"
            placeholder={t.common.optional}
            {...register("company")}
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="coop-phone">{f.phone}</Label>
          <Input
            id="coop-phone"
            type="tel"
            inputMode="numeric"
            maxLength={11}
            className="mt-1.5"
            placeholder={f.phonePlaceholder}
            {...register("phone")}
          />
          {fieldError(errors.phone?.message)}
        </div>
        <div>
          <Label htmlFor="coop-email">
            {f.email} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="coop-email"
            type="email"
            className="mt-1.5"
            placeholder={f.emailPlaceholder}
            {...register("email")}
          />
          {fieldError(errors.email?.message)}
        </div>
      </div>
      <div>
        <Label htmlFor="coop-message">
          {f.message} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="coop-message"
          rows={5}
          className="mt-1.5"
          placeholder={f.messagePlaceholder}
          {...register("message")}
        />
        {fieldError(errors.message?.message)}
      </div>
      <Captcha key={captchaKey} value={captcha} onChange={setCaptcha} />
      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? t.common.submitting : t.common.submit}
      </Button>
    </form>
  )
}
