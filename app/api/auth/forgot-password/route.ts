import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { forgotPasswordSchema } from "@/lib/validations"
import { success, error } from "@/lib/api-response"
import { isResetRateLimited, createAndSendResetToken } from "@/lib/password-reset"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return error(firstIssue?.message ?? "Invalid input")
    }

    const { email } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    const limited = await isResetRateLimited(normalizedEmail)
    if (limited) {
      return success({ message: "If an account exists, we sent a password reset link." })
    }

    if (user) {
      await createAndSendResetToken(normalizedEmail)
    }

    return success({ message: "If an account exists, we sent a password reset link." })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    return error(message)
  }
}
