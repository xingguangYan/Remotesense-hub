import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { sessionCookie } from "@/lib/session"

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url))
  res.cookies.delete(sessionCookie.name)
  return res
}
