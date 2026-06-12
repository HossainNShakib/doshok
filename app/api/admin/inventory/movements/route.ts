import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { success, error } from "@/lib/api-response"
import { getStockMovements } from "@/lib/services/inventory.service"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return error("Unauthorized", 401)
  if (session.user.role !== "admin") return error("Forbidden", 403)

  const { searchParams } = new URL(request.url)
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10))
  const offset = parseInt(searchParams.get("offset") ?? "0", 10)
  const type = searchParams.get("type") ?? undefined

  const result = await getStockMovements(
    type ? { type } : {},
    limit,
    offset
  )

  return success(result)
}