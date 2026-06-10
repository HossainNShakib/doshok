import Link from "next/link"
import { Package, FolderTree, TicketPercent, Tag } from "lucide-react"
import { AdminHubCard, AdminPageHeader } from "@/components/admin/admin-ui"

const sections = [
  { href: "/admin/products", label: "Products", icon: Package, desc: "Manage your product catalog, inventory, and pricing", badge: "Active" as const },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, desc: "Organize products into categories and sub-categories", badge: "Active" as const },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent, desc: "Set up discounts and promotional codes", badge: "Active" as const },
  { href: "/admin/landing-pages", label: "Landing Pages", icon: Tag, desc: "Create and manage promotional landing pages for campaigns", badge: "Active" as const },
]

export default function CommerceOverviewPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Commerce" title="Commerce Hub" description="Manage catalog structure, campaign pages, and promotional tools." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <AdminHubCard key={section.href} href={section.href} title={section.label} description={section.desc} icon={section.icon} badge={section.badge} />
        ))}
      </div>
    </div>
  )
}
