import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { success, error } from "@/lib/api-response"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return error("Unauthorized", 401)

  const { id } = await params

  try {
    const item = await prisma.abandonedCheckout.findUnique({ where: { id } })
    if (!item) return error("Not found", 404)
    return success(item)
  } catch {
    return error("Failed to fetch abandoned checkout")
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return error("Unauthorized", 401)

  const { id } = await params

  try {
    const body = await request.json()
    const allowed = ["contacted", "notes"]
    const filtered: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) filtered[key] = body[key]
    }
    const item = await prisma.abandonedCheckout.update({
      where: { id },
      data: filtered,
    })
    return success(item)
  } catch {
    return error("Failed to update abandoned checkout")
  }
}
