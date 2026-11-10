/**
 * ModelScope OAuth（OIDC）接入。
 * - 创空间（Docker/Streamlit/Gradio）开启 OAuth 后，运行时自动注入：
 *   OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET / OAUTH_SCOPES / OPENID_PROVIDER_URL / STUDIO_HOST
 * - 未注入时（本地 / Vercel）视为未启用，站点保持原有免注册流程。
 */

export function isOAuthConfigured(): boolean {
  return Boolean(process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET)
}

export function getProviderUrl(): string {
  const raw = (process.env.OPENID_PROVIDER_URL || "https://www.modelscope.cn").replace(/\/+$/, "")
  // 平台注入的 OPENID_PROVIDER_URL 可能为 http://www.modelscope.cn，
  // OIDC 端点与回调都要求 https，统一升级（localhost 保持原样便于本地调试）
  try {
    const url = new URL(raw)
    if (url.protocol === "http:" && !["localhost", "127.0.0.1"].includes(url.hostname)) {
      url.protocol = "https:"
    }
    return url.toString().replace(/\/+$/, "")
  } catch {
    return raw
  }
}

/** 站点对外地址：优先显式配置，其次创空间域名，最后本地默认 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit && !explicit.includes("localhost")) return explicit.replace(/\/+$/, "")
  const studioHost = process.env.STUDIO_HOST
  if (studioHost) return `https://${studioHost.replace(/\/+$/, "")}`
  return (explicit || "http://localhost:3000").replace(/\/+$/, "")
}

export function getRedirectUri(): string {
  return `${getSiteUrl()}/auth/callback`
}

export type OidcEndpoints = {
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
}

let cached: { at: number; value: OidcEndpoints } | null = null

/** OIDC discovery（进程内缓存 1 小时） */
export async function getOidcEndpoints(): Promise<OidcEndpoints> {
  if (cached && Date.now() - cached.at < 60 * 60 * 1000) return cached.value
  const res = await fetch(`${getProviderUrl()}/.well-known/openid-configuration`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`OIDC discovery 失败: HTTP ${res.status}`)
  const data = (await res.json()) as Partial<OidcEndpoints>
  if (!data.authorization_endpoint || !data.token_endpoint || !data.userinfo_endpoint) {
    throw new Error("OIDC discovery 缺少必要端点")
  }
  const value = {
    authorization_endpoint: data.authorization_endpoint,
    token_endpoint: data.token_endpoint,
    userinfo_endpoint: data.userinfo_endpoint,
  }
  cached = { at: Date.now(), value }
  return value
}

export type ModelScopeProfile = {
  sub: string
  name?: string | null
  preferred_username?: string | null
  picture?: string | null
}
