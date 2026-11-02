"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  BUDGETS,
  BUDGET_LABELS,
  CATEGORY_LABELS,
  DEMAND_CATEGORIES,
} from "@/lib/constants"

export function DemandFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="filter-category"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            需求类型
          </label>
          <Select
            id="filter-category"
            defaultValue={searchParams.get("category") || ""}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">全部类型</option>
            {DEMAND_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label
            htmlFor="filter-budget"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            预算区间
          </label>
          <Select
            id="filter-budget"
            defaultValue={searchParams.get("budget") || ""}
            onChange={(e) => update("budget", e.target.value)}
          >
            <option value="">全部预算</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {BUDGET_LABELS[b]}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="filter-region"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            目标区域
          </label>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              update("region", String(formData.get("region") || ""))
            }}
          >
            <Input
              id="filter-region"
              name="region"
              defaultValue={searchParams.get("region") || ""}
              placeholder="输入区域关键词，如「长江中下游」"
              className="flex-1"
            />
            <Button type="submit" className="shrink-0">
              <Search className="h-4 w-4" />
              筛选
            </Button>
            {searchParams.get("region") && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="清除区域筛选"
                onClick={() => update("region", "")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
