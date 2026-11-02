import { cookies } from "next/headers"
import { hashToken, verifyTokenHash } from "./tokens"

export const CAPTCHA_COOKIE = "rs_hub_captcha"
const CAPTCHA_TTL_SECONDS = 600

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 生成数学验证码题目并将答案哈希写入 HttpOnly cookie */
export function generateCaptcha(): { question: string } {
  const a = randomNumber(1, 9)
  const b = randomNumber(1, 9)
  const op = Math.random() > 0.5 ? "+" : "-"
  const answer = op === "+" ? a + b : a - b
  const question = `${a} ${op} ${b} = ?`

  cookies().set(
    CAPTCHA_COOKIE,
    JSON.stringify({ question, answerHash: hashToken(String(answer)) }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CAPTCHA_TTL_SECONDS,
    },
  )

  return { question }
}

/** 校验用户提交的答案与 cookie 中哈希是否匹配 */
export function verifyCaptcha(answer: string): boolean {
  const raw = cookies().get(CAPTCHA_COOKIE)?.value
  if (!raw) return false
  try {
    const parsed = JSON.parse(raw) as { answerHash: string }
    return verifyTokenHash(String(answer).trim(), parsed.answerHash)
  } catch {
    return false
  }
}
