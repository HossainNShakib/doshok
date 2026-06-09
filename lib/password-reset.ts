import { randomBytes } from "crypto"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/mailer"

const TOKEN_EXPIRY_MINUTES = 30
const RATE_LIMIT_MAX = 1
const RATE_LIMIT_WINDOW_MINUTES = 2

export function generateResetToken(): string {
  return randomBytes(32).toString("hex")
}

export function getTokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)
}

export function getRateLimitWindowStart(): Date {
  return new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
}

export async function isResetRateLimited(email: string): Promise<boolean> {
  const windowStart = getRateLimitWindowStart()
  const count = await prisma.passwordResetToken.count({
    where: {
      email: email.toLowerCase(),
      createdAt: { gte: windowStart },
      usedAt: null,
    },
  })
  return count >= RATE_LIMIT_MAX
}

export async function invalidatePreviousTokens(email: string): Promise<void> {
  await prisma.passwordResetToken.updateMany({
    where: {
      email: email.toLowerCase(),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  })
}

export async function createAndSendResetToken(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase()
  const token = generateResetToken()

  await invalidatePreviousTokens(normalizedEmail)

  await prisma.passwordResetToken.create({
    data: {
      email: normalizedEmail,
      token,
      expiresAt: getTokenExpiry(),
    },
  })

  await sendPasswordResetEmail(normalizedEmail, token)
}

export async function validateResetToken(
  token: string
): Promise<{ success: boolean; error?: string; email?: string }> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!record) {
    return { success: false, error: "Invalid or expired reset link." }
  }

  if (record.usedAt) {
    return { success: false, error: "This reset link has already been used." }
  }

  if (record.expiresAt < new Date()) {
    return { success: false, error: "This reset link has expired. Please request a new one." }
  }

  return { success: true, email: record.email }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const validation = await validateResetToken(token)
  if (!validation.success) {
    return validation
  }

  const email = validation.email!

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (!user) {
    return { success: false, error: "User not found." }
  }

  const hashedPassword = await hash(newPassword, 12)

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { token },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
  ])

  return { success: true }
}
