import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  currentPage: number
  totalPages: number
  status?: string
  search?: string
  sort?: string
}

function buildPageUrl(page: number, status?: string, search?: string, sort?: string) {
  const params = new URLSearchParams()
  if (status && status !== "All") params.set("status", status)
  if (search) params.set("search", search)
  if (sort && sort !== "newest") params.set("sort", sort)
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `/admin/products?${qs}` : "/admin/products"
}

export function AdminProductPagination({ currentPage, totalPages, status, search, sort }: Props) {
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

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1, status, search, sort)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-300 cursor-not-allowed">
          <ChevronLeft className="h-3.5 w-3.5" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="h-8 flex items-center px-1.5 text-xs text-slate-400">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildPageUrl(p, status, search, sort)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
              p === currentPage
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1, status, search, sort)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-300 cursor-not-allowed">
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  )
}
