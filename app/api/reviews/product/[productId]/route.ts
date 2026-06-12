import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "10")
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: { productId, status: "approved" },
        include: {
          user: { select: { name: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.productReview.count({
        where: { productId, status: "approved" },
      }),
    ])

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { averageRating: true, reviewCount: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          content: r.content,
          isVerifiedBuyer: r.isVerifiedBuyer,
          createdAt: r.createdAt.toISOString(),
          user: {
            name: r.user?.name ?? r.user?.firstName ?? "Anonymous",
          },
        })),
        summary: {
          averageRating: product?.averageRating ?? null,
          reviewCount: product?.reviewCount ?? 0,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 })
  }
}