"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type Review = {
  id: string
  rating: number
  title: string | null
  content: string
  isVerifiedBuyer: boolean
  createdAt: string
  user: { name: string }
}

type ProductReviewsProps = {
  productId: string
  initialSummary?: { averageRating: number | null; reviewCount: number }
}

export function ProductReviews({ productId, initialSummary }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState(initialSummary ?? { averageRating: null, reviewCount: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchReviews(1)
  }, [productId])

  async function fetchReviews(p: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews/product/${productId}?page=${p}&limit=5`)
      const data = await res.json()
      if (data.success) {
        if (p === 1) {
          setReviews(data.data.reviews)
        } else {
          setReviews((prev) => [...prev, ...data.data.reviews])
        }
        setSummary(data.data.summary)
        setHasMore(p < data.data.pagination.totalPages)
        setPage(p)
      }
    } catch { }
    setLoading(false)
  }

  if (loading && reviews.length === 0) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />)}</div>
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <Star className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="font-semibold text-muted-foreground">No reviews yet</p>
        <p className="text-sm text-muted-foreground mt-1">Be the first to review this product.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {summary.averageRating && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
          <div className="text-center">
            <p className="text-4xl font-black">{Number(summary.averageRating).toFixed(1)}</p>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-3.5 w-3.5",
                    star <= Math.round(summary.averageRating!)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted"
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{summary.reviewCount} review{summary.reviewCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-border/50 pb-4 last:border-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{review.user.name}</span>
                  {review.isVerifiedBuyer && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Verified Buyer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-3 w-3",
                        star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted"
                      )}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {review.title && <p className="font-semibold text-sm mt-2">{review.title}</p>}
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{review.content}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => fetchReviews(page + 1)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {loading ? "Loading..." : "Load More Reviews"}
          </button>
        </div>
      )}
    </div>
  )
}