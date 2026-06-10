import Link from "next/link"
import { Users, ShoppingCart, MapPin, Star } from "lucide-react"
import { AdminHubCard, AdminPageHeader } from "@/components/admin/admin-ui"

const sections = [
  { href: "/admin/customers/list", label: "Customer List", icon: Users, desc: "View and manage registered customers and their profiles", badge: "Active" as const },
  { href: "/admin/customers/orders", label: "Customer Orders", icon: ShoppingCart, desc: "Browse orders filtered by customer account", badge: "Active" as const },
  { href: "/admin/customers/addresses", label: "Customer Addresses", icon: MapPin, desc: "Manage saved delivery addresses per customer", badge: "Active" as const },
  { href: "/admin/reviews", label: "Reviews", icon: Star, desc: "Product reviews and ratings management", badge: "Coming later" as const },
]

export default function CustomersHubPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Customers" title="Customers Hub" description="Manage customer accounts, order history, saved addresses, and product reviews." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => (
          <AdminHubCard key={section.href} href={section.href} title={section.label} description={section.desc} icon={section.icon} badge={section.badge} />
        ))}
      </div>
    </div>
  )
}