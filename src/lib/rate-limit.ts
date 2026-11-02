import { prisma } from "./prisma"
import { RATE_LIMITS } from "./constants"

export const ONE_HOUR_MS = 60 * 60 * 1000

type LimitConfig = { action: string; limit: number }

export const PUBLISH_LIMIT: LimitConfig = {
  action: "publish",
  limit: RATE_LIMITS.publishPerHour,
}
export const INQUIRY_LIMIT: LimitConfig = {
  action: "inquiry",
  limit: RATE_LIMITS.inquiryPerHour,
}
export const COOPERATION_LIMIT: LimitConfig = {
  action: "cooperation",
  limit: RATE_LIMITS.cooperationPerHour,
}

/** 基于 IP + 动作的滚动窗口限流，窗口超时自动重置 */
export async function rateLimit(
  ip: string,
  config: LimitConfig,
  windowMs = ONE_HOUR_MS,
): Promise<{ ok: boolean; remaining: number }> {
  const record = await prisma.rateLimit.upsert({
    where: { ip_action: { ip, action: config.action } },
    update: {},
    create: { ip, action: config.action, count: 1, windowStart: new Date() },
  })

  const now = Date.now()
  if (now - record.windowStart.getTime() > windowMs) {
    await prisma.rateLimit.update({
      where: { id: record.id },
      data: { count: 1, windowStart: new Date() },
    })
    return { ok: true, remaining: config.limit - 1 }
  }

  if (record.count >= config.limit) {
    return { ok: false, remaining: 0 }
  }

  await prisma.rateLimit.update({
    where: { id: record.id },
    data: { count: { increment: 1 } },
  })
  return { ok: true, remaining: config.limit - record.count - 1 }
}
