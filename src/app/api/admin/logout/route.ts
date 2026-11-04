import { NextResponse } from "next/server"
import { clearAdminSession } from "@/lib/admin"

export const runtime = "nodejs"

/** 管理员登出：清除登录态 cookie */
export async function POST() {
  clearAdminSession()
  return NextResponse.json({ ok: true })
}
