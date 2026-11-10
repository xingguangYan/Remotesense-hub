// 主站（Vercel）地址：展示层的写操作入口一律指向这里。
// CI 构建时注入 NEXT_PUBLIC_MAIN_SITE_URL；本地开发回落到 NEXT_PUBLIC_SITE_URL。
const raw =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000"

export const MAIN_SITE_URL = raw.replace(/\/+$/, "")

export function mainSiteHref(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${MAIN_SITE_URL}${p}`
}
