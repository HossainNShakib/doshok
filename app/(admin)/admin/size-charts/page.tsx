import { AdminEmptyState, AdminPageHeader } from "@/components/admin/admin-ui"

export default function SizeChartsPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader eyebrow="Commerce" title="Size Charts" description="Create and manage size guides for products and categories." backHref="/admin/commerce" />
      <AdminEmptyState
        title="No size charts yet"
        description="Size guides and measurement tables for products will be managed here."
      />
    </div>
  )
}