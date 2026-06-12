import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { recalculateProductRating } from "@/lib/reviews"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { rating, title, content } = body

    const review = await prisma.productReview.findUnique({
      where: { id },
    })

    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 })
    }

    if (review.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 })
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const updated = await prisma.productReview.update({
      where: { id },
      data: {
        rating,
        title: title?.trim() || null,
        content: content.trim(),
        status: "pending",
        approvedAt: null,
        approvedBy: null,
      },
    })

    return NextResponse.json({ success: true, data: { id: updated.id } })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update review" }, { status: 500 })
  }
}