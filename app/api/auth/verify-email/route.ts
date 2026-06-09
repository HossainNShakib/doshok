import { NextRequest } from "next/server"
import { verifyEmailSchema } from "@/lib/validations"
import { success, error } from "@/lib/api-response"
import { verifyEmailToken } from "@/lib/email-verification"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = verifyEmailSchema.safeParse(body)

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return error(firstIssue?.message ?? "Invalid input")
    }

    const { token } = parsed.data
    const result = await verifyEmailToken(token)

    if (!result.success) {
      return error(result.error ?? "Verification failed")
    }

    return success({ message: "Email verified successfully" })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed"
    return error(message)
  }
}
