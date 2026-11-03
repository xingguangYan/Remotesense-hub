"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { useTranslations } from "@/i18n/LocaleProvider"
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
  const { t, locale } = useTranslations()

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
            {t.demands.filters.category}
          </label>
          <Select
            id="filter-category"
            defaultValue={searchParams.get("category") || ""}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">{t.demands.filters.allCategories}</option>
            {DEMAND_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[locale][c]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label
            htmlFor="filter-budget"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            {t.demands.filters.budget}
          </label>
          <Select
            id="filter-budget"
            defaultValue={searchParams.get("budget") || ""}
            onChange={(e) => update("budget", e.target.value)}
          >
            <option value="">{t.demands.filters.allBudgets}</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {BUDGET_LABELS[locale][b]}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="filter-region"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            {t.demands.filters.region}
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
              placeholder={t.demands.filters.regionPlaceholder}
              className="flex-1"
            />
            <Button type="submit" className="shrink-0">
              <Search className="h-4 w-4" />
              {t.demands.filters.search}
            </Button>
            {searchParams.get("region") && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={t.demands.filters.clear}
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
