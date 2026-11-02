/** 联系方式脱敏：13812345678 -> 138****5678 */
export function maskPhone(phone: string): string {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2")
}

/** 邮箱脱敏：wangwei@example.com -> wa***@example.com */
export function maskEmail(email: string): string {
  const atIndex = email.indexOf("@")
  if (atIndex <= 0) return email
  const name = email.slice(0, atIndex)
  const domain = email.slice(atIndex)
  const visible = name.slice(0, Math.min(2, name.length))
  return `${visible}${"*".repeat(Math.max(1, name.length - 2))}${domain}`
}
