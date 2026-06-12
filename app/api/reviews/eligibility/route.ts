import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { canReviewProduct } from "@/lib/reviews"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const result = await canReviewProduct(session.user.id, productId)

    return NextResponse.json({
      success: true,
      data: {
        eligible: result.eligible,
        reason: result.eligible ? undefined : (result as { eligible: false; reason: string }).reason,
        orderId: result.eligible ? (result as { eligible: true; orderId: string }).orderId : undefined,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to check eligibility" }, { status: 500 })
  }
}