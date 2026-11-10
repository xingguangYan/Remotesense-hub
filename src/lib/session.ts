import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

/**
 * ModelScope OAuth 登录态：HMAC 签名 cookie（与 admin 会话同思路，但独立 cookie）。
 * 只保存展示所需的最小资料，不保存任何 access_token / refresh_token。
 */
export type SessionUser = {
  id: string
  sub: string
  username: string | null
  name: string | null
  avatarUrl: string | null
}

const COOKIE_NAME = "rs_user_session"
const SALT = process.env.TOKEN_SALT || "remotesense-hub-dev-salt"
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 天

function sign(payload: string): string {
  return createHmac("sha256", SALT).update(payload).digest("hex")
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

/** 生成会话 cookie 值（payload.signature），供 route handler 在 Response 上直接设置 */
export function serializeSession(user: SessionUser): string {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS
  const payload = Buffer.from(JSON.stringify({ ...user, exp: expires })).toString("base64url")
  return `${payload}.${sign(payload)}`
}

export function parseSession(raw: string | undefined | null): SessionUser | null {
  if (!raw) return null
  const dot = raw.lastIndexOf(".")
  if (dot <= 0) return null
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  if (!safeEqual(sig, sign(payload))) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser & {
      exp?: number
    }
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null
    return {
      id: data.id,
      sub: data.sub,
      username: data.username ?? null,
      name: data.name ?? null,
      avatarUrl: data.avatarUrl ?? null,
    }
  } catch {
    return null
  }
}

/** 服务端读取当前登录用户（Server Component / Route Handler 均可） */
export function getSessionUser(): SessionUser | null {
  return parseSession(cookies().get(COOKIE_NAME)?.value)
}

export const sessionCookie = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS,
}
