import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { success, error } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sanitized = {
      email: body.email || null,
      phone: body.phone || null,
      name: body.name || null,
      step: body.step || null,
      data: body.data || null,
    }
    const abandoned = await prisma.abandonedCheckout.create({ data: sanitized })
    return success(abandoned, 201)
  } catch {
    return error("Failed to save abandoned checkout")
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return error("Unauthorized", 401)

  const items = await prisma.abandonedCheckout.findMany({
    orderBy: { createdAt: "desc" },
  })
  return success(items)
}
