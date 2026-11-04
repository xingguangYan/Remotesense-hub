import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

/**
 * 管理员账号：优先读环境变量 ADMIN_USERNAME / ADMIN_PASSWORD，
 * 未配置时回落到默认账号（仓库为 public，强烈建议在 Vercel 环境变量里设置 ADMIN_*
 * 覆盖默认值，避免密码泄露在公开代码里）。
 */
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "346049806"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "xg346049806"

const COOKIE_NAME = "rs_admin_session"
const SALT = process.env.TOKEN_SALT || "remotesense-hub-dev-salt"
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 登录态有效期 7 天

function sign(payload: string): string {
  return createHmac("sha256", SALT).update(payload).digest("hex")
}

/** 账号密码校验（恒定时间比较，防计时攻击） */
export function verifyAdminCredentials(
  username: string,
  password: string,
): boolean {
  const a = Buffer.from(username)
  const b = Buffer.from(ADMIN_USERNAME)
  const c = Buffer.from(password)
  const d = Buffer.from(ADMIN_PASSWORD)
  if (a.length !== b.length || c.length !== d.length) return false
  return timingSafeEqual(a, b) && timingSafeEqual(c, d)
}

/** 签发登录态 cookie（httpOnly，前端 JS 不可读） */
export function setAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS
  const payload = `${ADMIN_USERNAME}|${expires}`
  const value = `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`
  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  })
}

export function clearAdminSession() {
  cookies().delete(COOKIE_NAME)
}

/** 校验登录态，供管理页面与 /api/admin/* 接口鉴权 */
export function isAdmin(): boolean {
  const raw = cookies().get(COOKIE_NAME)?.value
  if (!raw) return false
  const dot = raw.lastIndexOf(".")
  if (dot <= 0) return false
  const sig = raw.slice(dot + 1)
  let payload: string
  try {
    payload = Buffer.from(raw.slice(0, dot), "base64url").toString("utf8")
  } catch {
    return false
  }
  const [username, expiresStr] = payload.split("|")
  const expires = Number(expiresStr)
  if (username !== ADMIN_USERNAME) return false
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) {
    return false
  }
  const expected = sign(payload)
  try {
    const a = Buffer.from(sig, "hex")
    const b = Buffer.from(expected, "hex")
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
