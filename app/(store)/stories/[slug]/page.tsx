import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const story = await prisma.story.findUnique({
    where: { slug, status: "active" },
  })

  if (!story) notFound()

  return (
    <main className="container mx-auto container-px py-12 max-w-3xl">
      <Link
        href="/stories"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Stories
      </Link>

      {story.image && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-muted">
          <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
        </div>
      )}

      <article>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">{story.title}</h1>
        <div
          className="mt-6 prose prose-sm max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: story.content }}
        />
      </article>
    </main>
  )
}