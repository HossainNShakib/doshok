import { prisma } from "../lib/prisma"
import {
  aboutPage, faqPage, termsPage, cookiesPage,
  accessibilityPage, careGuidePage, sizeGuidePage,
} from "../lib/info-pages"
import type { InfoPageData } from "../components/store/info-page"

const pages: Array<{ slug: string; data: InfoPageData }> = [
  { slug: "about", data: aboutPage },
  { slug: "faq", data: faqPage },
  { slug: "terms", data: termsPage },
  { slug: "cookies", data: cookiesPage },
  { slug: "accessibility", data: accessibilityPage },
  { slug: "care-guide", data: careGuidePage },
  { slug: "size-guide", data: sizeGuidePage },
]

async function main() {
  console.log("Seeding CMS pages...")

  for (const { slug, data } of pages) {
    const existing = await prisma.page.findUnique({ where: { slug } })

    const payload = {
      title: data.title,
      slug,
      excerpt: data.eyebrow,
      content: JSON.stringify(data),
      seoTitle: `${data.title} — Doshok`,
      seoDescription: data.description,
      status: "active" as const,
    }

    if (existing) {
      await prisma.page.update({
        where: { slug },
        data: payload,
      })
      console.log(`  updated: /${slug}`)
    } else {
      await prisma.page.create({ data: payload })
      console.log(`  created: /${slug}`)
    }
  }

  console.log("Done.")
}

main()
  .then(() => { console.log("Seed complete"); process.exit(0) })
  .catch((e) => { console.error("Seed failed:", e); process.exit(1) })