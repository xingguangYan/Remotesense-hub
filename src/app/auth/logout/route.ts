import { NextResponse } from "next/server"
import { getSiteUrl } from "@/lib/oauth"
import { sessionCookie } from "@/lib/session"

export async function GET() {
  const res = NextResponse.redirect(`${getSiteUrl()}/`)
  res.cookies.delete(sessionCookie.name)
  return res
}
