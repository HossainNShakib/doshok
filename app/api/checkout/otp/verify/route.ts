import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-response"
import { verifyCheckoutOtp } from "@/lib/checkout/otp.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    if (!phone || typeof phone !== "string") {
      return error("Phone number is required")
    }

    if (!code || typeof code !== "string") {
      return error("Verification code is required")
    }

    const result = await verifyCheckoutOtp(phone, code)
    return success(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to verify OTP"
    return error(message)
  }
}
