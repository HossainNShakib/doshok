import Link from "next/link"
import { Wallet, Truck, MapPin } from "lucide-react"
import { AdminHubCard, AdminPageHeader } from "@/components/admin/admin-ui"

const sections = [
  { href: "/admin/payment-methods", label: "Payment Methods", icon: Wallet, desc: "Configure payment gateways and billing options" },
  { href: "/admin/courier-methods", label: "Courier Methods", icon: Truck, desc: "Set up delivery partners and shipping integrations" },
  { href: "/admin/delivery-zones", label: "Delivery Zones", icon: MapPin, desc: "Define delivery areas and pricing tiers" },
]

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Operations" title="Operations Hub" description="Manage payment gateways, courier integrations, and delivery zone configuration." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <AdminHubCard key={section.href} href={section.href} title={section.label} description={section.desc} icon={section.icon} />
        ))}
      </div>
    </div>
  )
}