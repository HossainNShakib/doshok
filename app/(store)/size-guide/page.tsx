import type { Metadata } from "next"
import { InfoPage } from "@/components/store/info-page"
import { sizeGuidePage } from "@/lib/info-pages"
import { getCmsPageData } from "@/lib/cms-pages"

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCmsPageData("size-guide")
  if (cmsPage) {
    return {
      title: `${cmsPage.title} — Doshok`,
      description: cmsPage.description,
    }
  }
  return {
    title: "Size Guide — Doshok",
    description: "Find your best Doshok fit with general measurements for tops, bottoms, and product-specific fit notes.",
  }
}

export default async function SizeGuidePage() {
  const cmsPage = await getCmsPageData("size-guide")
  return <InfoPage page={cmsPage ?? sizeGuidePage} />
}