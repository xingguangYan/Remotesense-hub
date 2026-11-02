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
import { cooperationSchema, type CooperationInput } from "@/lib/validations"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

export function CooperationForm() {
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

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-3 text-base font-semibold text-foreground">
          咨询已提交
        </h3>
        <p className="mt-2 text-sm text-emerald-800">
          我们已收到您的合作意向，通常会在 1 个工作日内回复，请留意邮箱与来电。
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => setDone(false)}
        >
          再次提交
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
            姓名 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="coop-name"
            className="mt-1.5"
            placeholder="您的姓名"
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="coop-company">公司 / 机构</Label>
          <Input
            id="coop-company"
            className="mt-1.5"
            placeholder="选填"
            {...register("company")}
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="coop-phone">电话</Label>
          <Input
            id="coop-phone"
            type="tel"
            inputMode="numeric"
            maxLength={11}
            className="mt-1.5"
            placeholder="选填，中国大陆 11 位手机号"
            {...register("phone")}
          />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="coop-email">
            邮箱 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="coop-email"
            type="email"
            className="mt-1.5"
            placeholder="您的工作邮箱"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="coop-message">
          合作意向 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="coop-message"
          rows={5}
          className="mt-1.5"
          placeholder="请描述合作方向、可提供的资源或服务，10–1000 字"
          {...register("message")}
        />
        <FieldError message={errors.message?.message} />
      </div>
      <Captcha key={captchaKey} value={captcha} onChange={setCaptcha} />
      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "提交中…" : "提交合作咨询"}
      </Button>
    </form>
  )
}
