"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BUDGETS,
  BUDGET_LABELS,
  CATEGORY_LABELS,
  DEMAND_CATEGORIES,
} from "@/lib/constants"

type DemandRow = {
  id: string
  title: string
  category: string
  region: string
  budget: string | null
  status: string
  contactName: string
  contactPhone: string
  contactEmail: string
  createdAt: string
  _count: { inquiries: number }
}

type InquiryRow = {
  id: string
  name: string
  phone: string
  email: string
  message: string
  createdAt: string
  demand: { title: string } | null
}

type CooperationRow = {
  id: number
  name: string
  company: string | null
  phone: string | null
  email: string
  message: string
  createdAt: string
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "待审核", cls: "bg-amber-100 text-amber-700" },
  published: { label: "已发布", cls: "bg-emerald-100 text-emerald-700" },
  closed: { label: "已关闭", cls: "bg-slate-200 text-slate-600" },
  rejected: { label: "已拒绝", cls: "bg-rose-100 text-rose-700" },
}

const zh = CATEGORY_LABELS.zh
const budgetZh = BUDGET_LABELS.zh

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.message || "操作失败")
  return data
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", { hour12: false })
}

const emptyForm = {
  title: "",
  category: "IMAGE_ACQUISITION" as string,
  region: "",
  timeRange: "",
  budget: "NEGOTIABLE" as string,
  description: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  allowDirectContact: true,
}

export function AdminPanel({
  demands,
  inquiries,
  cooperations,
}: {
  demands: DemandRow[]
  inquiries: InquiryRow[]
  cooperations: CooperationRow[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<"demands" | "inquiries" | "cooperations">("demands")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [busy, setBusy] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, published: 0, closed: 0, rejected: 0 }
    demands.forEach((d) => { c[d.status] = (c[d.status] || 0) + 1 })
    return c
  }, [demands])

  const filteredDemands = useMemo(
    () => (statusFilter === "all" ? demands : demands.filter((d) => d.status === statusFilter)),
    [demands, statusFilter],
  )

  async function refresh() {
    router.refresh()
  }

  async function setDemandStatus(id: string, status: string, confirmText: string) {
    if (!window.confirm(confirmText)) return
    setBusy(true)
    try {
      await api(`/api/admin/demands/${id}`, "PATCH", { status })
      toast.success(STATUS_META[status]?.label ? `已标记为「${STATUS_META[status].label}」` : "操作成功")
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败")
    } finally {
      setBusy(false)
    }
  }

  async function deleteDemand(id: string) {
    if (!window.confirm("删除后不可恢复，其下所有咨询记录也会一并删除。确定删除？")) return
    setBusy(true)
    try {
      await api(`/api/admin/demands/${id}`, "DELETE")
      toast.success("已删除该需求")
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败")
    } finally {
      setBusy(false)
    }
  }

  async function deleteRow(url: string, label: string) {
    if (!window.confirm(`确定删除这条${label}？`)) return
    setBusy(true)
    try {
      await api(url, "DELETE")
      toast.success(`已删除该${label}`)
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败")
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    await api("/api/admin/logout", "POST")
    router.push("/admin/login")
    router.refresh()
  }

  function updateForm(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submitNewDemand(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await api("/api/admin/demands", "POST", { ...form, captchaAnswer: "admin" })
      toast.success("需求已直接发布到需求大厅")
      setForm(emptyForm)
      setDialogOpen(false)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "发布失败")
    } finally {
      setBusy(false)
    }
  }

  const stats = [
    { label: "待审核", value: counts.pending ?? 0, cls: "text-amber-600" },
    { label: "已发布", value: counts.published ?? 0, cls: "text-emerald-600" },
    { label: "已关闭", value: counts.closed ?? 0, cls: "text-slate-600" },
    { label: "已拒绝", value: counts.rejected ?? 0, cls: "text-rose-600" },
    { label: "服务方意向", value: inquiries.length, cls: "text-sky-600" },
    { label: "商务合作", value: cooperations.length, cls: "text-violet-600" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">管理后台</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            在这里审核、增删需求，查看服务方意向与商务合作咨询。
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank">查看前台</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            退出登录
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-white p-4 text-center">
            <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 border-b border-border">
        {([
          ["demands", `需求管理（${demands.length}）`],
          ["inquiries", `服务方意向（${inquiries.length}）`],
          ["cooperations", `商务合作（${cooperations.length}）`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "demands" && (
        <div className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-48"
              aria-label="按状态筛选需求"
            >
              <option value="all">全部状态</option>
              <option value="pending">待审核</option>
              <option value="published">已发布</option>
              <option value="closed">已关闭</option>
              <option value="rejected">已拒绝</option>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>+ 新增需求（直接上线）</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新增需求</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitNewDemand} className="grid gap-4 py-2 sm:grid-cols-2">
                  <div className="col-span-2 flex flex-col gap-2">
                    <Label htmlFor="f-title">需求标题（10–80 字）*</Label>
                    <Input id="f-title" required minLength={10} maxLength={80} value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="f-category">需求类型 *</Label>
                    <Select id="f-category" value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                      {DEMAND_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{zh[c]}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="f-region">目标区域 *</Label>
                    <Input id="f-region" required minLength={2} maxLength={100} value={form.region} onChange={(e) => updateForm("region", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="f-time">时间要求 *</Label>
                    <Input id="f-time" required minLength={2} maxLength={100} value={form.timeRange} onChange={(e) => updateForm("timeRange", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="f-budget">预算区间</Label>
                    <Select id="f-budget" value={form.budget} onChange={(e) => updateForm("budget", e.target.value)}>
                      {BUDGETS.map((b) => (
                        <option key={b} value={b}>{budgetZh[b]}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-2 flex flex-col gap-2">
                    <Label htmlFor="f-desc">需求详细描述（50–2000 字）*</Label>
                    <Textarea id="f-desc" required minLength={50} maxLength={2000} rows={5} value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="f-name">联系人 *</Label>
                    <Input id="f-name" required minLength={2} maxLength={30} value={form.contactName} onChange={(e) => updateForm("contactName", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="f-phone">手机号（11 位）*</Label>
                    <Input id="f-phone" required pattern="^1[3-9]\d{9}$" value={form.contactPhone} onChange={(e) => updateForm("contactPhone", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="f-email">邮箱 *</Label>
                    <Input id="f-email" type="email" required value={form.contactEmail} onChange={(e) => updateForm("contactEmail", e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 sm:mt-6">
                    <input
                      id="f-direct"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.allowDirectContact}
                      onChange={(e) => updateForm("allowDirectContact", e.target.checked)}
                    />
                    <Label htmlFor="f-direct" className="text-sm font-normal">
                      允许服务方直接联系
                    </Label>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={busy}>
                      取消
                    </Button>
                    <Button type="submit" disabled={busy}>
                      {busy ? "发布中…" : "直接发布"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {filteredDemands.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              当前筛选条件下没有需求。
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">标题/区域</th>
                    <th className="py-2 pr-3 font-medium">类型</th>
                    <th className="py-2 pr-3 font-medium">预算</th>
                    <th className="py-2 pr-3 font-medium">状态</th>
                    <th className="py-2 pr-3 font-medium">联系方式</th>
                    <th className="py-2 pr-3 font-medium">发布时间</th>
                    <th className="py-2 pr-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemands.map((d) => {
                    const meta = STATUS_META[d.status] || { label: d.status, cls: "bg-slate-100" }
                    return (
                      <tr key={d.id} className="border-b border-border/70 align-top">
                        <td className="max-w-xs py-3 pr-3">
                          <Link href={`/demands/${d.id}`} className="font-medium text-primary hover:underline" target="_blank">
                            {d.title}
                          </Link>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {d.region}
                            {d._count.inquiries > 0 && ` · ${d._count.inquiries} 条意向`}
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-3 text-muted-foreground">
                          {zh[d.category as keyof typeof zh] || d.category}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-3 text-muted-foreground">
                          {d.budget ? budgetZh[d.budget as keyof typeof budgetZh] || d.budget : "—"}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-3 text-xs text-muted-foreground">
                          <div>{d.contactName}</div>
                          <div>{d.contactPhone}</div>
                          <div>{d.contactEmail}</div>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-3 text-xs text-muted-foreground">
                          {fmtDate(d.createdAt)}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {d.status === "pending" && (
                              <>
                                <Button size="sm" disabled={busy} onClick={() => setDemandStatus(d.id, "published", "审核通过并直接发布到需求大厅？")}>
                                  通过
                                </Button>
                                <Button size="sm" variant="outline" disabled={busy} onClick={() => setDemandStatus(d.id, "rejected", "拒绝该需求？拒绝后不会公开展示。")}>
                                  拒绝
                                </Button>
                              </>
                            )}
                            {d.status === "published" && (
                              <Button size="sm" variant="outline" disabled={busy} onClick={() => setDemandStatus(d.id, "closed", "关闭该需求？关闭后不再展示在需求大厅。")}>
                                关闭
                              </Button>
                            )}
                            {(d.status === "closed" || d.status === "rejected") && (
                              <Button size="sm" variant="outline" disabled={busy} onClick={() => setDemandStatus(d.id, "published", "恢复为已发布状态？")}>
                                恢复上架
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" disabled={busy} onClick={() => deleteDemand(d.id)}>
                              删除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "inquiries" && (
        <div className="mt-6">
          {inquiries.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              还没有服务方意向。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">服务方</th>
                    <th className="py-2 pr-3 font-medium">联系方式</th>
                    <th className="py-2 pr-3 font-medium">关联需求</th>
                    <th className="py-2 pr-3 font-medium">服务方案</th>
                    <th className="py-2 pr-3 font-medium">时间</th>
                    <th className="py-2 pr-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((i) => (
                    <tr key={i.id} className="border-b border-border/70 align-top">
                      <td className="whitespace-nowrap py-3 pr-3 font-medium">{i.name}</td>
                      <td className="whitespace-nowrap py-3 pr-3 text-xs text-muted-foreground">
                        <div>{i.phone}</div>
                        <div>{i.email}</div>
                      </td>
                      <td className="max-w-xs py-3 pr-3 text-muted-foreground">
                        {i.demand?.title || "（需求已删除）"}
                      </td>
                      <td className="max-w-sm py-3 pr-3 text-muted-foreground">{i.message}</td>
                      <td className="whitespace-nowrap py-3 pr-3 text-xs text-muted-foreground">{fmtDate(i.createdAt)}</td>
                      <td className="py-3">
                        <Button size="sm" variant="destructive" disabled={busy} onClick={() => deleteRow(`/api/admin/inquiries/${i.id}`, "意向")}>
                          删除
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "cooperations" && (
        <div className="mt-6">
          {cooperations.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              还没有商务合作咨询。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">联系人</th>
                    <th className="py-2 pr-3 font-medium">公司</th>
                    <th className="py-2 pr-3 font-medium">联系方式</th>
                    <th className="py-2 pr-3 font-medium">合作意向</th>
                    <th className="py-2 pr-3 font-medium">时间</th>
                    <th className="py-2 pr-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {cooperations.map((c) => (
                    <tr key={c.id} className="border-b border-border/70 align-top">
                      <td className="whitespace-nowrap py-3 pr-3 font-medium">{c.name}</td>
                      <td className="whitespace-nowrap py-3 pr-3 text-muted-foreground">{c.company || "—"}</td>
                      <td className="whitespace-nowrap py-3 pr-3 text-xs text-muted-foreground">
                        <div>{c.phone || "—"}</div>
                        <div>{c.email}</div>
                      </td>
                      <td className="max-w-sm py-3 pr-3 text-muted-foreground">{c.message}</td>
                      <td className="whitespace-nowrap py-3 pr-3 text-xs text-muted-foreground">{fmtDate(c.createdAt)}</td>
                      <td className="py-3">
                        <Button size="sm" variant="destructive" disabled={busy} onClick={() => deleteRow(`/api/admin/cooperations/${c.id}`, "咨询")}>
                          删除
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
