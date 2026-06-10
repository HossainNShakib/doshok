import { AdminPageHeader } from "@/components/admin/admin-ui"
import { FileText } from "lucide-react"

export default function CMSPagesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="CMS" title="Pages" description="Manage static pages and policy content for the storefront." />
      <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-white p-12 text-center">
        <FileText className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
        <h2 className="text-lg font-black tracking-[-0.02em]">This module is ready for setup.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
          Static pages, policy pages, and custom content blocks will be configurable here.
        </p>
      </div>
    </div>
  )
}