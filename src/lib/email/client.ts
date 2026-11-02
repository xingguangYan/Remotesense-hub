import { Resend } from "resend"

let client: Resend | null = null

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null // 开发模式：邮件只打印到控制台
  if (!client) client = new Resend(apiKey)
  return client
}

export async function sendEmail(opts: {
  to: string | string[]
  subject: string
  html: string
}): Promise<{ id: string }> {
  const c = getClient()
  if (!c) {
    console.info(
      `[email:dev-mode] 模拟发送 -> ${opts.to} | ${opts.subject}`,
    )
    return { id: "dev-mode" }
  }

  const from =
    process.env.MAIL_FROM || "RemoteSense Hub <onboarding@resend.dev>"
  const res = await c.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })

  if (res.error) throw new Error(`邮件发送失败: ${res.error.message}`)
  return { id: res.data?.id || "sent" }
}
