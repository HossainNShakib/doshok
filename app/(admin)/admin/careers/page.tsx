import { AdminEmptyState, AdminPageHeader } from "@/components/admin/admin-ui"

export default function CareersPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader eyebrow="CMS" title="Careers" description="Manage job listings and career page content." backHref="/admin/cms" />
      <AdminEmptyState
        title="No job listings yet"
        description="Job listings and career page content will appear here when added."
      />
    </div>
  )
}