import type { Metadata } from "next"
import { InfoPage } from "@/components/store/info-page"
import { careGuidePage } from "@/lib/info-pages"
import { getCmsPageData } from "@/lib/cms-pages"

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCmsPageData("care-guide")
  if (cmsPage) {
    return {
      title: `${cmsPage.title} — Doshok`,
      description: cmsPage.description,
    }
  }
  return {
    title: "Care Guide — Doshok",
    description: careGuidePage.description,
  }
}

export default async function CareGuidePage() {
  const cmsPage = await getCmsPageData("care-guide")
  return <InfoPage page={cmsPage ?? careGuidePage} />
}