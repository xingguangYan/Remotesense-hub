import { NextResponse } from "next/server"
import { generateCaptcha } from "@/lib/captcha"

export const dynamic = "force-dynamic"

export function GET() {
  const { question } = generateCaptcha()
  return NextResponse.json({ question })
}
