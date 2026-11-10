import { randomBytes } from "crypto"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getOidcEndpoints, getRedirectUri, getSiteUrl, isOAuthConfigured } from "@/lib/oauth"

/** 只允许站内相对路径，避免登录后被重定向到外站（开放重定向） */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/"
  return raw
}

export async function GET(req: NextRequest) {
  if (!isOAuthConfigured()) {
    return NextResponse.redirect(`${getSiteUrl()}/?auth=unavailable`)
  }

  const next = safeNext(req.nextUrl.searchParams.get("next"))
  const state = randomBytes(16).toString("base64url")

  let authorizeUrl: URL
  try {
    const endpoints = await getOidcEndpoints()
    authorizeUrl = new URL(endpoints.authorization_endpoint)
  } catch (error) {
    console.error("[oauth] discovery 失败:", error)
    return NextResponse.redirect(`${getSiteUrl()}/?auth=error`)
  }

  authorizeUrl.searchParams.set("response_type", "code")
  authorizeUrl.searchParams.set("client_id", process.env.OAUTH_CLIENT_ID || "")
  authorizeUrl.searchParams.set("redirect_uri", getRedirectUri())
  authorizeUrl.searchParams.set("scope", process.env.OAUTH_SCOPES || "openid profile")
  authorizeUrl.searchParams.set("state", state)

  const res = NextResponse.redirect(authorizeUrl)
  // state + 登录后跳转目标，10 分钟内有效
  res.cookies.set("rs_oauth_state", `${state}|${next}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  })
  return res
}
