import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"

export async function verifyPathaoWebhook(
  request: NextRequest
): Promise<{ valid: boolean; reason?: string }> {
  const webhookSecret = process.env.PATHAO_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.warn("[pathao-webhook] PATHAO_WEBHOOK_SECRET not configured — allowing request in SANDBOX mode")
    return { valid: true }
  }

  const authHeader = request.headers.get("authorization") || request.headers.get("x-pathao-signature")
  if (!authHeader) {
    return { valid: false, reason: "Missing authorization header" }
  }

  const secretBytes = new TextEncoder().encode(webhookSecret)
  const body = await request.clone().text()
  const bodyBytes = new TextEncoder().encode(body)

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, bodyBytes)
  const expectedSig = Buffer.from(signatureBuffer).toString("base64")

  if (authHeader !== expectedSig) {
    return { valid: false, reason: "Invalid webhook signature" }
  }

  return { valid: true }
}

export async function getPathaoWebhookSecret(): Promise<string | null> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "PATHAO" },
  })

  if (!setting || !setting.enabled) return null

  if (setting.credentialsJson) {
    try {
      const decrypted = decrypt(setting.credentialsJson, "courier")
      const parsed = JSON.parse(decrypted)
      return parsed.webhookSecret || null
    } catch {
      return null
    }
  }

  return process.env.PATHAO_WEBHOOK_SECRET || null
}