import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-response"
import { sendCheckoutOtp } from "@/lib/checkout/otp.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone || typeof phone !== "string") {
      return error("Phone number is required")
    }

    const result = await sendCheckoutOtp(phone)
    return success(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send OTP"
    return error(message)
  }
}
