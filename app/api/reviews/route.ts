import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canReviewProduct, recalculateProductRating } from "@/lib/reviews"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await req.json()
    const { productId, rating, title, content, orderId } = body

    if (!productId || !rating || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required for verification" }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        orderStatus: "delivered",
        items: { some: { productId } },
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, error: "No delivered order found for this product" }, { status: 403 })
    }

    const existing = await prisma.productReview.findFirst({
      where: { productId, userId: session.user.id, status: { in: ["approved", "pending"] } },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: "You have already reviewed this product" }, { status: 409 })
    }

    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: session.user.id,
        orderId,
        rating,
        title: title?.trim() || null,
        content: content.trim(),
        isVerifiedBuyer: true,
        status: "pending",
      },
    })

    return NextResponse.json({ success: true, data: { id: review.id } })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to submit review" }, { status: 500 })
  }
}