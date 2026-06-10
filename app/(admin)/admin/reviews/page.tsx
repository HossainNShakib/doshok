import { AdminPageHeader } from "@/components/admin/admin-ui"
import { Star } from "lucide-react"

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Customers" title="Product Reviews" description="Manage customer reviews and ratings for products." />
      <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-white p-12 text-center">
        <Star className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
        <h2 className="text-lg font-black tracking-[-0.02em]">This module is ready for setup.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
          Product reviews, ratings, and review moderation will be configurable here.
        </p>
      </div>
    </div>
  )
}