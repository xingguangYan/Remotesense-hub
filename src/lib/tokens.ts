import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

const SALT = process.env.TOKEN_SALT || "remotesense-hub-dev-salt"

/** 生成一次性凭证（192 bit 熵），明文只出现在邮件链接里 */
export function generateToken(): string {
  return randomBytes(24).toString("hex")
}

/** 入库只存哈希，链接丢失后无法从数据库反推 */
export function hashToken(token: string): string {
  return scryptSync(token, SALT, 32).toString("hex")
}

export function verifyTokenHash(token: string, hash: string): boolean {
 try {
    const a = Buffer.from(hashToken(token), "hex")
    const b = Buffer.from(hash, "hex")
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
 } catch {
    return false
 }
}
