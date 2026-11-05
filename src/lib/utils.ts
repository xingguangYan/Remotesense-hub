import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: Date | string): string {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const minute = 60_000
  const hour = 3_600_000
  const day = 86_400_000
  if (diff < 0) return "刚刚"
  if (diff < minute) return "刚刚"
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < day * 30) return `${Math.floor(diff / day)} 天前`
  return d.toLocaleDateString("zh-CN")
}

/** YYYY-MM-DD 字符串 → UTC 零点 Date（前端 date input 的值入库用） */
export function parseOptionalDate(value?: string | null): Date | null {
  return value ? new Date(`${value}T00:00:00Z`) : null
}

/** 今天零点（UTC），用于按天判断是否过期 */
export function startOfTodayUtc(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

/** 截止日期是否已过（按天粒度，截止当天仍算有效） */
export function isExpired(deadlineAt?: Date | string | null): boolean {
  if (!deadlineAt) return false
  return new Date(deadlineAt).getTime() < startOfTodayUtc().getTime()
}

/** Date → YYYY-MM-DD 展示 */
export function fmtDateOnly(value?: Date | string | null): string {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}
