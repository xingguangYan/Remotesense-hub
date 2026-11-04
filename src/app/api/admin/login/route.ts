import { NextResponse } from "next/server"
import { z } from "zod"
import { apiError, getClientIP } from "@/lib/api"
import { rateLimit } from "@/lib/rate-limit"
import { setAdminSession, verifyAdminCredentials } from "@/lib/admin"

export const runtime = "nodejs"

const loginSchema = z.object({
  username: z.string().min(1, "请输入账号").max(60),
  password: z.string().min(1, "请输入密码").max(120),
})

/** 管理员登录：限流防爆破，通过则下发签名 cookie */
export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await req.json())
  if (!parsed.success) {
    return apiError(422, "VALIDATION_ERROR", "请输入账号和密码", {
      fieldErrors: parsed.error.flatten().fieldErrors,
    })
  }

  const limited = await rateLimit(getClientIP(req), {
    action: "admin-login",
    limit: 10,
  })
  if (!limited.ok) {
    return apiError(429, "RATE_LIMITED", "登录尝试过于频繁，请稍后再试")
  }

  if (!verifyAdminCredentials(parsed.data.username, parsed.data.password)) {
    return apiError(401, "UNAUTHORIZED", "账号或密码错误")
  }

  setAdminSession()
  return NextResponse.json({ ok: true })
}
