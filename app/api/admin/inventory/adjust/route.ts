import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { success, error } from "@/lib/api-response"
import { manualAdjustStock } from "@/lib/services/inventory.service"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return error("Unauthorized", 401)
  if (session.user.role !== "admin") return error("Forbidden", 403)

  try {
    const body = await request.json()
    const { variantId, quantity, reason, note } = body

    if (!variantId) return error("Variant ID is required")
    if (typeof quantity !== "number") return error("Quantity must be a number")
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return error("Reason is required for stock adjustment")
    }

    const result = await manualAdjustStock(
      variantId,
      quantity,
      reason.trim(),
      note?.trim() || undefined,
      session.user.id
    )

    if (!result.success) {
      return error(result.error ?? "Failed to adjust stock", 400)
    }

    return success({ message: "Stock adjusted successfully" })
  } catch (err) {
    console.error(err)
    return error("Failed to adjust stock")
  }
}