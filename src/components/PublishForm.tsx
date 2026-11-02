"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertCircle, ArrowLeft, ArrowRight, Mail } from "lucide-react"
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
import {
  BUDGETS,
  BUDGET_LABELS,
  CATEGORY_LABELS,
  DEMAND_CATEGORIES,
} from "@/lib/constants"
import { demandSchema, type DemandInput } from "@/lib/validations"

const STEPS = ["需求基本信息", "详细描述", "联系方式"]

const STEP_FIELDS: (keyof DemandInput)[][] = [
  ["title", "category", "region", "area", "resolution", "timeRange", "budget"],
  ["description"],
  ["contactName", "contactPhone", "contactEmail", "company"],
]

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

export function PublishForm() {
  const router = useRouter()
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
  } = useForm<DemandInput>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      allowDirectContact: true,
      budget: "",
      area: "",
      resolution: "",
      company: "",
    } as DemandInput,
  })

  async function next() {
    const ok = await trigger(STEP_FIELDS[step])
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function onValid(values: DemandInput) {
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
        throw new Error(data?.error?.message || "提交失败，请稍后重试")
      }
      toast.success("提交成功！验证邮件已发送，请查收后完成确认。")
      router.push("/publish/success")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交失败，请稍后重试")
      setCaptcha("")
      setCaptchaKey((k) => k + 1)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <ol className="mb-8 flex items-center gap-2 sm:gap-4">
        {STEPS.map((label, i) => (
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
            {i < STEPS.length - 1 && (
              <span className="ml-auto h-px flex-1 bg-border sm:mx-2" />
            )}
          </li>
        ))}
      </ol>

      <form
        noValidate
        onSubmit={handleSubmit(() => setConfirmOpen(true))}
        className="space-y-6"
      >
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="title">
                需求标题 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="如：长江中下游水稻种植面积遥感监测"
                aria-describedby="title-hint"
                className="mt-1.5"
                {...register("title")}
              />
              <p id="title-hint" className="mt-1 text-xs text-muted-foreground">
                10–80 字，概括需求核心
              </p>
              <FieldError message={errors.title?.message} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">
                  需求类型 <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="category"
                  defaultValue=""
                  className="mt-1.5"
                  {...register("category")}
                >
                  <option value="">请选择需求类型</option>
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
                <Select
                  id="budget"
                  defaultValue=""
                  className="mt-1.5"
                  {...register("budget")}
                >
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
              <Input
                id="region"
                placeholder="如：长江中下游 / 华东某地级市全域"
                className="mt-1.5"
                {...register("region")}
              />
              <FieldError message={errors.region?.message} />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="resolution">分辨率要求</Label>
                <Input
                  id="resolution"
                  placeholder="如：0.5m / 10m"
                  className="mt-1.5"
                  {...register("resolution")}
                />
              </div>
              <div>
                <Label htmlFor="area">面积 / 范围</Label>
                <Input
                  id="area"
                  placeholder="如：约 12000 平方公里"
                  className="mt-1.5"
                  {...register("area")}
                />
              </div>
              <div>
                <Label htmlFor="timeRange">
                  时间要求 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="timeRange"
                  placeholder="如：2026 年 Q2 前交付"
                  className="mt-1.5"
                  {...register("timeRange")}
                />
                <FieldError message={errors.timeRange?.message} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <Label htmlFor="description">
              需求详细描述 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              rows={10}
              aria-describedby="description-hint"
              placeholder="请描述需求背景、数据要求、成果形式、验收标准、交付节点等，50–2000 字"
              className="mt-1.5"
              {...register("description")}
            />
            <p id="description-hint" className="mt-1 text-xs text-muted-foreground">
              50–2000 字。描述越清晰，越容易匹配到合适的服务方。
            </p>
            <FieldError message={errors.description?.message} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
              <p className="flex items-start gap-2 text-sm text-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                提交后我们会向您的邮箱发送一封验证邮件（含验证链接与管理链接）。完成验证后需求才会公开展示，全程无需注册账号。
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactName">
                  联系人称呼 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactName"
                  placeholder="如：王工"
                  className="mt-1.5"
                  {...register("contactName")}
                />
                <FieldError message={errors.contactName?.message} />
              </div>
              <div>
                <Label htmlFor="company">单位 / 公司</Label>
                <Input
                  id="company"
                  placeholder="选填"
                  className="mt-1.5"
                  {...register("company")}
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactPhone">
                  手机号 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="中国大陆 11 位手机号"
                  className="mt-1.5"
                  {...register("contactPhone")}
                />
                <FieldError message={errors.contactPhone?.message} />
              </div>
              <div>
                <Label htmlFor="contactEmail">
                  邮箱 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="用于接收验证链接和管理链接"
                  className="mt-1.5"
                  {...register("contactEmail")}
                />
                <FieldError message={errors.contactEmail?.message} />
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-4">
              <input
                id="allowDirectContact"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border accent-[#0EA5E9]"
                {...register("allowDirectContact")}
              />
              <label htmlFor="allowDirectContact" className="text-sm text-foreground">
                允许服务方直接联系我（勾选后服务方可通过平台提交意向并获取您的联系方式；不勾选则意向由平台人工转达）
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
              上一步
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              下一步
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={submitting}>
              提交并等待邮件验证
            </Button>
          )}
        </div>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提交前确认</DialogTitle>
            <DialogDescription>
              您填写的联系方式将用于需求对接，请确保真实有效。提交后验证邮件将发送至您填写的邮箱。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              返回修改
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onValid)}
              disabled={submitting}
            >
              {submitting ? "提交中…" : "确认提交"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
