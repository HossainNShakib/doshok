import { prisma } from "@/lib/prisma"
import type { InfoPageData } from "@/components/store/info-page"

export async function getCmsPageData(slug: string): Promise<InfoPageData | null> {
  const page = await prisma.page.findUnique({
    where: { slug, status: "active" },
    select: { content: true },
  })

  if (!page?.content) return null

  try {
    const data = JSON.parse(page.content)
    if (data && typeof data === "object" && data.title && data.sections) {
      return data as InfoPageData
    }
  } catch { }

  return null
}