import type { Metadata } from "next"
import { InfoPage } from "@/components/store/info-page"
import { aboutPage } from "@/lib/info-pages"
import { getCmsPageData } from "@/lib/cms-pages"

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCmsPageData("about")
  if (cmsPage) {
    return {
      title: `About — Doshok`,
      description: cmsPage.description,
    }
  }
  return {
    title: "About — Doshok",
    description: "A wardrobe built in Bangladesh. Doshok is a single-house fashion label crafting clean essentials and occasion pieces for modern Bangladeshi life.",
  }
}

export default async function AboutPage() {
  const cmsPage = await getCmsPageData("about")
  return <InfoPage page={cmsPage ?? aboutPage} />
}