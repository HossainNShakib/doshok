import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { success, error } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get("productId")
  const variantId = searchParams.get("variantId")
  const requestedQty = parseInt(searchParams.get("quantity") ?? "1", 10)

  if (!productId) return error("productId is required")

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true, name: true },
    })

    if (!product) return error("Product not found", 404)
    if (product.status !== "Active") {
      return error("This product is no longer available")
    }

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { id: true, stock: true, size: true, color: true },
      })

      if (!variant) return error("Variant not found")
      if (variant.stock === 0) {
        return error("This variant is out of stock")
      }

      const cappedQty = Math.min(requestedQty, variant.stock)
      return success({
        available: variant.stock,
        requested: requestedQty,
        capped: cappedQty,
        cappedMessage:
          cappedQty < requestedQty
            ? `Only ${variant.stock} available. Added ${cappedQty} to cart.`
            : null,
      })
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: { stock: true },
    })
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0)

    if (totalStock === 0) {
      return error("This product is out of stock")
    }

    const cappedQty = Math.min(requestedQty, totalStock)
    return success({
      available: totalStock,
      requested: requestedQty,
      capped: cappedQty,
      cappedMessage:
        cappedQty < requestedQty
          ? `Only ${totalStock} available. Added ${cappedQty} to cart.`
          : null,
    })
  } catch {
    return error("Failed to check stock")
  }
}