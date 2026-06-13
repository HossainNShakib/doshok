"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
] as const

export function AdminProductSort({ currentSort }: { currentSort: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleSort(value: string | null) {
    if (!value) return
    const params = new URLSearchParams(searchParams.toString())
    if (value === "newest") params.delete("sort")
    else params.set("sort", value)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleSort}>
      <SelectTrigger size="sm" className="h-8 rounded-lg text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
