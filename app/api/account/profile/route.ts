import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { profileSchema } from "@/lib/validations"
import { success, error } from "@/lib/api-response"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return error("Unauthorized", 401)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
    },
  })

  if (!user) return error("User not found", 404)

  return success({
    ...user,
    dateOfBirth: user.dateOfBirth?.toISOString().split("T")[0] ?? null,
  })
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return error("Unauthorized", 401)

  try {
    const body = await request.json()
    const parsed = profileSchema.safeParse(body)

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return error(firstIssue?.message ?? "Invalid input")
    }

    const { firstName, lastName, phone, dateOfBirth, gender } = parsed.data

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
      },
    })

    return success({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth?.toISOString().split("T")[0] ?? null,
      gender: user.gender,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile"
    return error(message)
  }
}
