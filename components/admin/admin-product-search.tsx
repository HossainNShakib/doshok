"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search } from "lucide-react"

export function AdminProductSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const q = form.get("search") as string
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set("search", q)
    else params.delete("search")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
      <input
        name="search"
        defaultValue={searchParams.get("search") ?? ""}
        placeholder="Search by name, slug, or SKU..."
        className="h-8 w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
      />
    </form>
  )
}
