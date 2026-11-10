import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOidcEndpoints, getRedirectUri, getSiteUrl, type ModelScopeProfile } from "@/lib/oauth"
import { serializeSession, sessionCookie } from "@/lib/session"

export const dynamic = "force-dynamic"

function fail(req: NextRequest, reason: string) {
  console.error(`[oauth] 登录失败: ${reason}`)
  return NextResponse.redirect(`${getSiteUrl()}/?auth=error`)
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state")
  const cookieState = req.cookies.get("rs_oauth_state")?.value

  if (!code || !state || !cookieState) return fail(req, "缺少 code/state")
  const [cookieNonce, ...rest] = cookieState.split("|")
  if (cookieNonce !== state) return fail(req, "state 不匹配")
  const next = rest.join("|") || "/"

  const clientId = process.env.OAUTH_CLIENT_ID
  const clientSecret = process.env.OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) return fail(req, "未配置 OAuth 客户端")

  let endpoints
  try {
    endpoints = await getOidcEndpoints()
  } catch (error) {
    return fail(req, `discovery 失败: ${String(error)}`)
  }

  // 授权码换 token（client_secret_post）
  const tokenRes = await fetch(endpoints.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  })
  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => "")
    return fail(req, `token 交换失败 HTTP ${tokenRes.status}: ${text.slice(0, 200)}`)
  }
  const token = (await tokenRes.json()) as { access_token?: string }
  if (!token.access_token) return fail(req, "token 响应缺少 access_token")

  // 拉取用户资料
  const profileRes = await fetch(`${endpoints.userinfo_endpoint}`, {
    headers: { Authorization: `Bearer ${token.access_token}`, Accept: "application/json" },
    cache: "no-store",
  })
  if (!profileRes.ok) {
    const text = await profileRes.text().catch(() => "")
    return fail(req, `userinfo 失败 HTTP ${profileRes.status}: ${text.slice(0, 200)}`)
  }
  const profile = (await profileRes.json()) as ModelScopeProfile
  if (!profile.sub) return fail(req, "userinfo 缺少 sub")

  const name = profile.name || profile.preferred_username || null
  const user = await prisma.user.upsert({
    where: { msSub: profile.sub },
    create: {
      msSub: profile.sub,
      username: profile.preferred_username || null,
      name,
      avatarUrl: profile.picture || null,
    },
    update: {
      username: profile.preferred_username || null,
      name,
      avatarUrl: profile.picture || null,
      lastLoginAt: new Date(),
    },
    select: { id: true, msSub: true, username: true, name: true, avatarUrl: true },
  })

  const target = new URL(getSiteUrl())
  target.pathname = next.startsWith("/") ? next : "/"

  const res = NextResponse.redirect(target)
  res.cookies.set(
    sessionCookie.name,
    serializeSession({
      id: user.id,
      sub: user.msSub,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
    }),
    {
      httpOnly: true,
      // 创空间页面以 iframe 形式嵌在 modelscope.cn 下，Lax 会导致 iframe 内不发送登录态
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: sessionCookie.maxAge,
    },
  )
  res.cookies.delete("rs_oauth_state")
  return res
}
