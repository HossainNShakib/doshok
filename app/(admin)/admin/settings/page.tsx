import Link from "next/link"
import { Settings } from "lucide-react"
import { AdminHubCard, AdminPageHeader } from "@/components/admin/admin-ui"

const sections = [
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings, desc: "Brand info, contact details, social links, theme settings, and footer menus" },
]

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader eyebrow="Settings" title="Settings Hub" description="Configure brand details, theme preferences, social links, and store-wide settings." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((section) => (
          <AdminHubCard key={section.href} href={section.href} title={section.label} description={section.desc} icon={section.icon} />
        ))}
      </div>
    </div>
  )
}