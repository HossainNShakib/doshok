import Link from "next/link"
import { Home, FileText, MapPin, Tag, Image, BriefcaseBusiness } from "lucide-react"
import { AdminHubCard, AdminPageHeader } from "@/components/admin/admin-ui"

const sections = [
  { href: "/admin/homepage", label: "Homepage", icon: Home, desc: "Hero banner, featured products, and storefront copy", badge: "Ready" as const },
  { href: "/admin/landing-pages", label: "Landing Pages", icon: FileText, desc: "Campaign landing pages for ad traffic", badge: "Active" as const },
  { href: "/admin/cms/pages", label: "Pages", icon: FileText, desc: "Static pages and policy content overview", badge: "Ready" as const },
  { href: "/admin/cms/footer", label: "Footer", icon: MapPin, desc: "Footer content and information blocks", badge: "Active" as const },
  { href: "/admin/cms/menus", label: "Menus", icon: Tag, desc: "Header and footer navigation links", badge: "Active" as const },
  { href: "/admin/cms/banners", label: "Banners", icon: Image, desc: "Announcement bar and promotional banners", badge: "Active" as const },
  { href: "/admin/careers", label: "Careers", icon: BriefcaseBusiness, desc: "Job listings and career page content", badge: "Coming later" as const },
]

export default function CMSPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="CMS" title="CMS Hub" description="Manage storefront content, static pages, campaigns, and informational blocks." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <AdminHubCard key={section.href} href={section.href} title={section.label} description={section.desc} icon={section.icon} badge={section.badge} />
        ))}
      </div>
    </div>
  )
}