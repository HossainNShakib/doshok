import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/mailer"

const TOKEN_EXPIRY_HOURS = 24
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MINUTES = 10

export function generateToken(): string {
  return randomBytes(32).toString("hex")
}

export function getTokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
}

export function getRateLimitWindowStart(): Date {
  return new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
}

export async function isRateLimited(email: string): Promise<boolean> {
  const windowStart = getRateLimitWindowStart()
  const count = await prisma.emailVerificationToken.count({
    where: {
      email: email.toLowerCase(),
      createdAt: { gte: windowStart },
    },
  })
  return count >= RATE_LIMIT_MAX
}

export async function createAndSendVerificationToken(email: string, userId?: string): Promise<void> {
  const normalizedEmail = email.toLowerCase()
  const token = generateToken()

  await prisma.emailVerificationToken.create({
    data: {
      email: normalizedEmail,
      token,
      expiresAt: getTokenExpiry(),
      userId: userId ?? null,
    },
  })

  await sendVerificationEmail(normalizedEmail, token)
}

export async function verifyEmailToken(token: string): Promise<{ success: boolean; error?: string }> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  })

  if (!record) {
    return { success: false, error: "Invalid verification link." }
  }

  if (record.usedAt) {
    return { success: false, error: "This verification link has already been used." }
  }

  if (record.expiresAt < new Date()) {
    return { success: false, error: "This verification link has expired. Please request a new one." }
  }

  const user = await prisma.user.findUnique({
    where: { email: record.email },
    select: { id: true },
  })

  if (!user) {
    return { success: false, error: "User not found." }
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
  ])

  return { success: true }
}
