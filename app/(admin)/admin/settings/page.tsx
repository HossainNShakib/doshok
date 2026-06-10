import Link from "next/link"
import { Settings, Palette } from "lucide-react"
import { AdminHubCard, AdminPageHeader } from "@/components/admin/admin-ui"

const sections = [
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings, desc: "Brand info, contact details, social links, theme settings, and footer menus", badge: "Active" as const },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Settings" title="Settings Hub" description="Configure brand details, theme preferences, social links, and store-wide settings." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <AdminHubCard key={section.href} href={section.href} title={section.label} description={section.desc} icon={section.icon} badge={section.badge} />
        ))}
      </div>
    </div>
  )
}