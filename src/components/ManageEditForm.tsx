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

function FieldError({ message }: { message?: string }) {
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
        throw new Error(data?.error?.message || "保存失败，请稍后重试")
      }
      toast.success("需求已更新。")
      router.push(`/manage/${manageToken}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid)}
      className="space-y-6 rounded-lg border border-border bg-white p-6 shadow-sm"
    >
      <div>
        <Label htmlFor="title">
          需求标题 <span className="text-destructive">*</span>
        </Label>
        <Input id="title" className="mt-1.5" {...register("title")} />
        <FieldError message={errors.title?.message} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">
            需求类型 <span className="text-destructive">*</span>
          </Label>
          <Select id="category" className="mt-1.5" {...register("category")}>
            {DEMAND_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
          <FieldError message={errors.category?.message} />
        </div>
        <div>
          <Label htmlFor="budget">预算区间</Label>
          <Select id="budget" className="mt-1.5" {...register("budget")}>
            <option value="">面议 / 不公开</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {BUDGET_LABELS[b]}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="region">
          目标区域 <span className="text-destructive">*</span>
        </Label>
        <Input id="region" className="mt-1.5" {...register("region")} />
        <FieldError message={errors.region?.message} />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="resolution">分辨率要求</Label>
          <Input id="resolution" className="mt-1.5" {...register("resolution")} />
        </div>
        <div>
          <Label htmlFor="area">面积 / 范围</Label>
          <Input id="area" className="mt-1.5" {...register("area")} />
        </div>
        <div>
          <Label htmlFor="timeRange">
            时间要求 <span className="text-destructive">*</span>
          </Label>
          <Input id="timeRange" className="mt-1.5" {...register("timeRange")} />
          <FieldError message={errors.timeRange?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="description">
          需求详细描述 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          rows={10}
          className="mt-1.5"
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>
      <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
        注意：为防止冒名修改，联系方式（手机号 / 邮箱）提交后不可自行更改，如需修改请联系平台商务邮箱。
      </p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/manage/${manageToken}`)}
          disabled={submitting}
        >
          返回管理页
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "保存中…" : "保存修改"}
        </Button>
      </div>
    </form>
  )
}
