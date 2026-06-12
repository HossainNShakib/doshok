import type { Metadata } from "next"
import { InfoPage } from "@/components/store/info-page"
import { cookiesPage } from "@/lib/info-pages"
import { getCmsPageData } from "@/lib/cms-pages"

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCmsPageData("cookies")
  if (cmsPage) {
    return {
      title: `${cmsPage.title} — Doshok`,
      description: cmsPage.description,
    }
  }
  return {
    title: "Cookies — Doshok",
    description: cookiesPage.description,
  }
}

export default async function CookiesPage() {
  const cmsPage = await getCmsPageData("cookies")
  return <InfoPage page={cmsPage ?? cookiesPage} />
}