import { prisma } from "@/lib/prisma"

export type EligibilityResult =
  | { eligible: true; orderId: string }
  | { eligible: false; reason: string }

export async function canReviewProduct(
  userId: string,
  productId: string
): Promise<EligibilityResult> {
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userId,
      orderStatus: "delivered",
      items: {
        some: { productId },
      },
    },
    select: { id: true },
  })

  if (!deliveredOrder) {
    return { eligible: false, reason: "You must purchase and receive this product before reviewing." }
  }

  const existingReview = await prisma.productReview.findFirst({
    where: {
      productId,
      userId,
      status: { in: ["approved", "pending"] },
    },
    select: { id: true },
  })

  if (existingReview) {
    return { eligible: false, reason: "You have already submitted a review for this product." }
  }

  return { eligible: true, orderId: deliveredOrder.id }
}

export async function recalculateProductRating(productId: string): Promise<void> {
  const result = await prisma.productReview.aggregate({
    where: { productId, status: "approved" },
    _avg: { rating: true },
    _count: { rating: true },
  })

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: result._avg.rating ?? null,
      reviewCount: result._count.rating,
    },
  })
}