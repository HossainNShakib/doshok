import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams: Record<string, string | undefined>
}

function buildHref(basePath: string, params: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const merged = { ...params, ...overrides }
  const entries = Object.entries(merged).filter(([, v]) => v !== undefined && v !== "")
  if (entries.length === 0) return basePath
  const qs = entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`).join("&")
  return `${basePath}?${qs}`
}

export function ProductPagination({ currentPage, totalPages, basePath, searchParams }: Props) {
  if (totalPages <= 1) return null

  const pages: (number | "ellipsis")[] = []
  const delta = 1
  const left = Math.max(2, currentPage - delta)
  const right = Math.min(totalPages - 1, currentPage + delta)

  pages.push(1)
  if (left > 2) pages.push("ellipsis")
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages - 1) pages.push("ellipsis")
  if (totalPages > 1) pages.push(totalPages)

  const pageParams = (page: number) => {
    if (page === 1) return { ...searchParams, page: undefined }
    return { ...searchParams, page: String(page) }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      {currentPage > 1 ? (
        <Link
          href={buildHref(basePath, searchParams, { page: String(currentPage - 1) })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground/30 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="h-9 flex items-center px-2 text-xs text-muted-foreground">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, searchParams, { page: String(p) })}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-all ${
              p === currentPage
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-input bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(basePath, searchParams, { page: String(currentPage + 1) })}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground/30 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  )
}
