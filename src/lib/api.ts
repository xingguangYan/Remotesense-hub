import { NextResponse } from "next/server"

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "CAPTCHA_INVALID"
  | "RATE_LIMITED"
  | "SENSITIVE_CONTENT"
  | "NOT_FOUND"
  | "INVALID_TOKEN"
  | "EXPIRED_TOKEN"
  | "ALREADY_VERIFIED"
  | "INTERNAL_ERROR"

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    fieldErrors?: Record<string, string[]>
  }
}

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  extra?: Record<string, unknown>,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code, message, ...extra } },
    { status },
  )
}

export function getClientIP(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return req.headers.get("x-real-ip") || "127.0.0.1"
}
