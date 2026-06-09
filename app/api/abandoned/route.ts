import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { success, error } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const sanitized: Record<string, unknown> = {}
    const fields = ["landingSlug", "productId", "variantId", "quantity", "size", "color", "deliveryZone", "address", "name", "email", "phone", "step", "couponCode", "subtotal", "discount", "total", "notes", "data"]
    for (const key of fields) {
      if (body[key] !== undefined) sanitized[key] = body[key]
    }

    sanitized.data = body.data || JSON.stringify(body.data || {})

    if (body.email) {
      sanitized.email = body.email
    }
    if (body.phone) {
      sanitized.phone = body.phone
    }

    let abandoned

    if (body.email) {
      const existing = await prisma.abandonedCheckout.findFirst({
        where: { email: body.email },
        orderBy: { createdAt: "desc" },
      })
      if (existing) {
        abandoned = await prisma.abandonedCheckout.update({
          where: { id: existing.id },
          data: sanitized,
        })
        return success(abandoned)
      }
    }

    abandoned = await prisma.abandonedCheckout.create({ data: sanitized })
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
