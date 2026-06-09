import { createHmac, timingSafeEqual } from "crypto"

const TOKEN_EXPIRY_MS = 15 * 60 * 1000

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.FIREBASE_PRIVATE_KEY
  if (!secret) throw new Error("NEXTAUTH_SECRET or FIREBASE_PRIVATE_KEY must be set")
  return secret
}

function hmacSign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("hex")
}

export function createPhoneVerifiedToken(phone: string): string {
  const expiry = Date.now() + TOKEN_EXPIRY_MS
  const payload = `${phone}:${expiry}`
  const signature = hmacSign(payload)
  const token = Buffer.from(`${payload}:${signature}`).toString("base64url")
  return token
}

export function verifyPhoneVerifiedToken(token: string): { success: true; phone: string } | { success: false; error: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8")
    const parts = decoded.split(":")
    if (parts.length < 3) return { success: false, error: "Invalid token format" }

    const phone = parts[0]
    const expiry = parseInt(parts[1], 10)
    const signature = parts.slice(2).join(":")

    if (isNaN(expiry)) return { success: false, error: "Invalid token" }
    if (Date.now() > expiry) return { success: false, error: "Token expired" }

    const expectedPayload = `${phone}:${expiry}`
    const expectedSig = hmacSign(expectedPayload)

    const sigBuf = Buffer.from(signature)
    const expectedBuf = Buffer.from(expectedSig)

    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return { success: false, error: "Invalid token signature" }
    }

    return { success: true, phone }
  } catch {
    return { success: false, error: "Invalid token" }
  }
}
