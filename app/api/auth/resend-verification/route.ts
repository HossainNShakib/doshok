import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { resendVerificationSchema } from "@/lib/validations"
import { success, error } from "@/lib/api-response"
import { isRateLimited, createAndSendVerificationToken } from "@/lib/email-verification"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = resendVerificationSchema.safeParse(body)

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return error(firstIssue?.message ?? "Invalid input")
    }

    const { email } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true },
    })

    if (!user) {
      return error("No account found with this email")
    }

    if (user.emailVerified) {
      return error("This email is already verified")
    }

    const limited = await isRateLimited(normalizedEmail)
    if (limited) {
      return error("Too many requests. Please try again later.")
    }

    await createAndSendVerificationToken(normalizedEmail, user.id)

    return success({ message: "Verification email sent. Check your inbox." })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send verification email"
    return error(message)
  }
}
