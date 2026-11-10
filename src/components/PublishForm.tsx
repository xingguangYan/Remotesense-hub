"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertCircle, ArrowLeft, ArrowRight, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Captcha } from "@/components/Captcha"
import { useTranslations } from "@/i18n/LocaleProvider"
import {
  BUDGETS,
  BUDGET_LABELS,
  CATEGORY_LABELS,
  DEMAND_CATEGORIES,
} from "@/lib/constants"
import { demandFormSchema, type DemandFormInput } from "@/lib/validations"

const STEP_FIELDS: (keyof DemandFormInput)[][] = [
  ["title", "category", "region", "area", "resolution", "timeRange", "budget", "startAt", "deadlineAt"],
  ["description"],
  ["contactName", "contactPhone", "contactEmail", "company"],
]

function fieldErrorMessage(
  t: ReturnType<typeof useTranslations>["t"],
  message: string | undefined,
) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

/** 服务端错误体 -> 本地化提示 */
function serverError(
  t: ReturnType<typeof useTranslations>["t"],
  data: { error?: { code?: string; message?: string } } | undefined,
) {
  const code = data?.error?.code as keyof typeof t.errors | undefined
  return code && code in t.errors
    ? t.errors[code]
    : data?.error?.message || t.errors.fallback
}

export function PublishForm({ defaultName = "" }: { defaultName?: string }) {
  const router = useRouter()
  const { t, locale } = useTranslations()
  const [step, setStep] = useState(0)
  const [captcha, setCaptcha] = useState("")
  const [captchaKey, setCaptchaKey] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<DemandFormInput>({
    resolver: zodResolver(demandFormSchema),
    defaultValues: {
      contactName: defaultName,
      allowDirectContact: true,
      budget: "",
      area: "",
      resolution: "",
      company: "",
     startAt: "",
     deadlineAt: "",
    } as DemandFormInput,
  })

  async function next() {
    const ok = await trigger(STEP_FIELDS[step])
    if (ok) setStep((s) => Math.min(s + 1, t.publish.steps.length - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function onValid(values: DemandFormInput) {
    setConfirmOpen(false)
    setSubmitting(true)
    try {
      const res = await fetch("/api/demands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, captchaAnswer: captcha }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login?next=/publish")
          return
        }
        throw new Error(serverError(t, data))
      }
      toast.success(t.publish.toastSuccess, { duration: 6000 })
      router.push(`/demands?new=${data.id}&manage=${data.manageToken}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.errors.fallback)
      setCaptcha("")
      setCaptchaKey((k) => k + 1)
    } finally {
      setSubmitting(false)
    }
  }

  const f = t.publish.fields

  return (
    <div>
      <ol className="mb-8 flex items-center gap-2 sm:gap-4">
        {t.publish.steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span
              className={`hidden text-sm font-medium sm:inline ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < t.publish.steps.length - 1 && (
              <span className="ml-auto h-px flex-1 bg-border sm:mx-2" />
            )}
          </li>
        ))}
      </ol>
      <p className="mb-6 text-xs font-medium text-muted-foreground" aria-live="polite">
        {t.publish.stepHint
          .replace("{step}", String(step + 1))
          .replace("{total}", String(t.publish.steps.length))}
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(() => setConfirmOpen(true))}
        className="space-y-6"
      >
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="title">
                {f.title} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder={f.titlePlaceholder}
                aria-describedby="title-hint"
                className="mt-1.5"
                {...register("title")}
              />
              <p id="title-hint" className="mt-1 text-xs text-muted-foreground">
                {f.titleHint}
              </p>
              {fieldErrorMessage(t, errors.title?.message)}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">
                  {f.category} <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="category"
                  defaultValue=""
                  className="mt-1.5"
                  {...register("category")}
                >
                  <option value="">{f.categoryPlaceholder}</option>
                  {DEMAND_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[locale][c]}
                    </option>
                  ))}
                </Select>
                {fieldErrorMessage(t, errors.category?.message)}
              </div>
              <div>
                <Label htmlFor="budget">{f.budget}</Label>
                <Select
                  id="budget"
                  defaultValue=""
                  className="mt-1.5"
                  {...register("budget")}
                >
                  <option value="">{f.budgetPlaceholder}</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>
                      {BUDGET_LABELS[locale][b]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="region">
                {f.region} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="region"
                placeholder={f.regionPlaceholder}
                className="mt-1.5"
                {...register("region")}
              />
              {fieldErrorMessage(t, errors.region?.message)}
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="resolution">{f.resolution}</Label>
                <Input
                  id="resolution"
                  placeholder={f.resolutionPlaceholder}
                  className="mt-1.5"
                  {...register("resolution")}
                />
              </div>
              <div>
                <Label htmlFor="area">{f.area}</Label>
                <Input
                  id="area"
                  placeholder={f.areaPlaceholder}
                  className="mt-1.5"
                  {...register("area")}
                />
              </div>
              <div>
                <Label htmlFor="timeRange">
                  {f.time} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="timeRange"
                  placeholder={f.timePlaceholder}
                  className="mt-1.5"
                  {...register("timeRange")}
                />
                {fieldErrorMessage(t, errors.timeRange?.message)}
              </div>
            </div>
          </div>
        )}
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="startAt">{f.startAt}</Label>
              <Input
                id="startAt"
                type="date"
                aria-describedby="startAt-hint"
                className="mt-1.5"
                {...register("startAt")}
              />
              <p id="startAt-hint" className="mt-1 text-xs text-muted-foreground">
                {f.startAtHint}
              </p>
              {fieldErrorMessage(t, errors.startAt?.message)}
            </div>
            <div>
              <Label htmlFor="deadlineAt">{f.deadlineAt}</Label>
              <Input
                id="deadlineAt"
                type="date"
                aria-describedby="deadlineAt-hint"
                className="mt-1.5"
                {...register("deadlineAt")}
              />
              <p id="deadlineAt-hint" className="mt-1 text-xs text-muted-foreground">
                {f.deadlineAtHint}
              </p>
              {fieldErrorMessage(t, errors.deadlineAt?.message)}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <Label htmlFor="description">
              {f.description} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              rows={10}
              aria-describedby="description-hint"
              placeholder={f.descriptionPlaceholder}
              className="mt-1.5"
              {...register("description")}
            />
            <p id="description-hint" className="mt-1 text-xs text-muted-foreground">
              {f.descriptionHint}
            </p>
            {fieldErrorMessage(t, errors.description?.message)}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
              <p className="flex items-start gap-2 text-sm text-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {t.publish.mailNotice}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactName">
                  {f.contactName} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactName"
                  placeholder={f.contactNamePlaceholder}
                  className="mt-1.5"
                  {...register("contactName")}
                />
                {fieldErrorMessage(t, errors.contactName?.message)}
              </div>
              <div>
                <Label htmlFor="company">{f.company}</Label>
                <Input
                  id="company"
                  placeholder={f.companyPlaceholder}
                  className="mt-1.5"
                  {...register("company")}
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactPhone">{f.phone}</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder={f.phonePlaceholder}
                  className="mt-1.5"
                  {...register("contactPhone")}
                />
                {fieldErrorMessage(t, errors.contactPhone?.message)}
              </div>
              <div>
                <Label htmlFor="contactEmail">{f.email}</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder={f.emailPlaceholder}
                  className="mt-1.5"
                  {...register("contactEmail")}
                />
                {fieldErrorMessage(t, errors.contactEmail?.message)}
              </div>
            </div>
            <p className="-mt-3 flex items-start gap-1.5 text-xs text-amber-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t.common.contactAtLeastOne}
            </p>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                {t.common.securityNotice}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-4">
              <input
                id="allowDirectContact"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border accent-[#0EA5E9]"
                {...register("allowDirectContact")}
              />
              <label htmlFor="allowDirectContact" className="text-sm text-foreground">
                {f.allowDirect}
              </label>
            </div>
            <div>
              <Captcha key={captchaKey} value={captcha} onChange={setCaptcha} />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={back}>
              <ArrowLeft className="h-4 w-4" />
              {t.publish.prev}
            </Button>
          ) : (
            <span />
          )}
          {step < t.publish.steps.length - 1 ? (
            <Button type="button" onClick={next}>
              {t.publish.next}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? t.common.submitting : t.publish.submit}
            </Button>
          )}
        </div>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.publish.confirmTitle}</DialogTitle>
            <DialogDescription>{t.publish.confirmDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              {t.publish.confirmBack}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onValid)}
              disabled={submitting}
            >
              {submitting ? t.common.submitting : t.publish.confirmSubmit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
