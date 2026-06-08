import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { AdminPageHeader, AdminSectionCard, AdminStatCard, AdminTableShell, AdminStatusBadge } from "@/components/admin/admin-ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, ShoppingBag, ShoppingCart, Timer, TrendingUp } from "lucide-react"

export default async function AdminDashboardPage() {
  const [productCount, orderCount, pendingOrders, abandonedCount, paidOrders, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "pending" } }),
    prisma.abandonedCheckout.count(),
    prisma.order.count({ where: { paymentStatus: "paid" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { items: true } }),
  ])

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products", icon: Package },
    { label: "Total Orders", value: orderCount, href: "/admin/orders", icon: ShoppingCart },
    { label: "Paid Orders", value: paidOrders, href: "/admin/orders", icon: TrendingUp, tone: paidOrders > 0 ? "success" as const : "default" as const },
    { label: "Pending Orders", value: pendingOrders, href: "/admin/orders", icon: Timer, tone: pendingOrders > 0 ? "warning" as const : "default" as const },
    { label: "Abandoned", value: abandonedCount, href: "/admin/abandoned", icon: ShoppingBag },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Main"
        title="Dashboard"
        description="A focused control room for Doshok catalog, orders, recovery, and settings."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {stats.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <AdminSectionCard title="Recent Orders" description="Latest customer activity that may need attention.">
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <ShoppingCart className="mb-3 h-8 w-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-500">No orders yet</p>
            <p className="text-xs text-neutral-400 mt-1">Orders will appear here after customers complete checkout.</p>
          </div>
        ) : (
          <AdminTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                    <TableCell>
                      <p className="font-bold text-sm">{order.customerName}</p>
                      <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                    </TableCell>
                    <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                    <TableCell className="font-bold">৳{order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <AdminStatusBadge status={order.paymentStatus === "paid" ? "Paid" : "Pending"} type="payment" />
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge status={order.orderStatus} type="order" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center rounded-full text-sm font-medium h-7 px-3 hover:bg-muted hover:text-foreground transition-colors">View</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableShell>
        )}
      </AdminSectionCard>
    </div>
  )
}
