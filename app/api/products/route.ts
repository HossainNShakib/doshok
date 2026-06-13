import { prisma } from "@/lib/prisma"
import { success, error } from "@/lib/api-response"
import { productSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pageType = searchParams.get("pageType")
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const selector = searchParams.get("selector") === "true"
  const ids = searchParams.get("ids")

  const where: Record<string, unknown> = {}
  if (pageType) where.pageType = pageType
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ]
  }
  if (ids) {
    where.id = { in: ids.split(",").filter(Boolean) }
  }
  if (selector && !status && !search && !ids) {
    where.status = "Active"
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: selector ? {
      id: true,
      name: true,
      slug: true,
      price: true,
      oldPrice: true,
      images: true,
      status: true,
      variants: { select: { stock: true } },
    } : {
      id: true,
      name: true,
      price: true,
    },
  })
  return success(products)
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return error("Unauthorized", 401)

    const body = await request.json()
    const { relatedProductIds, crossSellProductIds, upsellProductIds, ...restBody } = body

    const parsed = productSchema.safeParse(restBody)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid input")

    const { variants, specifications, sizeChartIds, ...productData } = parsed.data

    const product = await prisma.product.create({
      data: {
        ...productData,
        specifications: specifications ? {
          create: specifications.map((spec, index) => ({
            label: spec.label,
            value: spec.value,
            position: index,
          })),
        } : undefined,
        variants: {
          create: variants?.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
            sku: v.sku,
          })) ?? [],
        },
        sizeCharts: sizeChartIds ? {
          create: sizeChartIds.map((sizeChartId) => ({ sizeChartId })),
        } : undefined,
      },
      include: { variants: true, category: true, specifications: true, sizeCharts: { include: { sizeChart: true } } },
    })

    const relationsToCreate: { relatedProductId: string; type: string; position: number }[] = []

    if (relatedProductIds && Array.isArray(relatedProductIds)) {
      relatedProductIds.forEach((rid: string, idx: number) => {
        if (rid !== product.id) relationsToCreate.push({ relatedProductId: rid, type: "RELATED", position: idx })
      })
    }
    if (crossSellProductIds && Array.isArray(crossSellProductIds)) {
      crossSellProductIds.forEach((rid: string, idx: number) => {
        if (rid !== product.id) relationsToCreate.push({ relatedProductId: rid, type: "CROSS_SELL", position: idx })
      })
    }
    if (upsellProductIds && Array.isArray(upsellProductIds)) {
      upsellProductIds.forEach((rid: string, idx: number) => {
        if (rid !== product.id) relationsToCreate.push({ relatedProductId: rid, type: "UPSELL", position: idx })
      })
    }

    if (relationsToCreate.length > 0) {
      await prisma.productRelation.createMany({
        data: relationsToCreate.map((r) => ({
          productId: product.id,
          relatedProductId: r.relatedProductId,
          type: r.type,
          position: r.position,
        })),
      })
    }

    return success({ ...product, relations: { RELATED: [], CROSS_SELL: [], UPSELL: [] } }, 201)
  } catch {
    return error("Failed to create product")
  }
}
