"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "@/i18n/LocaleProvider"
import {
  BUDGETS,
  BUDGET_LABELS,
  CATEGORY_LABELS,
  DEMAND_CATEGORIES,
} from "@/lib/constants"
import {
  manageEditSchema,
  type ManageEditInput,
} from "@/lib/validations"

type InitialData = {
  title: string
  category: string
  region: string
  area: string | null
  resolution: string | null
  timeRange: string
  budget: string | null
  description: string
}

function fieldError(message?: string) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

export function ManageEditForm({
  manageToken,
  initialData,
}: {
  manageToken: string
  initialData: InitialData
}) {
  const router = useRouter()
  const { t, locale } = useTranslations()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManageEditInput>({
    resolver: zodResolver(manageEditSchema),
    defaultValues: {
      title: initialData.title,
      category: initialData.category as ManageEditInput["category"],
      region: initialData.region,
      area: initialData.area || "",
      resolution: initialData.resolution || "",
      timeRange: initialData.timeRange,
      budget: (initialData.budget || "") as ManageEditInput["budget"],
      description: initialData.description,
    },
  })

  async function onValid(values: ManageEditInput) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/manage/${manageToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
      toast.success(t.manage.toastUpdated)
      router.push(`/manage/${manageToken}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.errors.fallback)
    } finally {
      setSubmitting(false)
    }
  }

  const f = t.publish.fields

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid)}
      className="space-y-6 rounded-lg border border-border bg-white p-6 shadow-sm"
    >
      <div>
        <Label htmlFor="title">
          {f.title} <span className="text-destructive">*</span>
        </Label>
        <Input id="title" className="mt-1.5" {...register("title")} />
        {fieldError(errors.title?.message)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">
            {f.category} <span className="text-destructive">*</span>
          </Label>
          <Select id="category" className="mt-1.5" {...register("category")}>
            {DEMAND_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[locale][c]}
              </option>
            ))}
          </Select>
          {fieldError(errors.category?.message)}
        </div>
        <div>
          <Label htmlFor="budget">{f.budget}</Label>
          <Select id="budget" className="mt-1.5" {...register("budget")}>
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
        <Input id="region" className="mt-1.5" {...register("region")} />
        {fieldError(errors.region?.message)}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="resolution">{f.resolution}</Label>
          <Input id="resolution" className="mt-1.5" {...register("resolution")} />
        </div>
        <div>
          <Label htmlFor="area">{f.area}</Label>
          <Input id="area" className="mt-1.5" {...register("area")} />
        </div>
        <div>
          <Label htmlFor="timeRange">
            {f.time} <span className="text-destructive">*</span>
          </Label>
          <Input id="timeRange" className="mt-1.5" {...register("timeRange")} />
          {fieldError(errors.timeRange?.message)}
        </div>
      </div>
      <div>
        <Label htmlFor="description">
          {f.description} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          rows={10}
          className="mt-1.5"
          {...register("description")}
        />
        {fieldError(errors.description?.message)}
      </div>
      <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
        {t.manage.contactImmutableNotice}
      </p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/manage/${manageToken}`)}
          disabled={submitting}
        >
          {t.manage.backManage}
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? t.common.saving : t.manage.editSave}
        </Button>
      </div>
    </form>
  )
}
