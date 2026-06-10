import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { AdminPageHeader, AdminSectionCard, AdminStatCard, AdminTableShell, AdminStatusBadge } from "@/components/admin/admin-ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, DollarSign, Package, ShoppingBag, ShoppingCart, Timer, TrendingUp, Users } from "lucide-react"
import { LOW_STOCK_THRESHOLD } from "@/types"

export default async function AdminDashboardPage() {
  const [
    productCount,
    orderCount,
    pendingOrders,
    abandonedCount,
    paidOrders,
    recentOrders,
    totalRevenueResult,
    customerCount,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "pending" } }),
    prisma.abandonedCheckout.count(),
    prisma.order.count({ where: { paymentStatus: "paid" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { items: true } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "paid" },
    }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.productVariant.findMany({
      where: { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
      include: { product: true },
      take: 10,
    }),
  ])

  const totalRevenue = totalRevenueResult._sum.total ?? 0

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products", icon: Package },
    { label: "Total Orders", value: orderCount, href: "/admin/orders", icon: ShoppingCart },
    { label: "Total Revenue", value: `৳${totalRevenue.toLocaleString()}`, href: "/admin/orders", icon: DollarSign, tone: totalRevenue > 0 ? "success" as const : "default" as const },
    { label: "Pending Orders", value: pendingOrders, href: "/admin/orders", icon: Timer, tone: pendingOrders > 0 ? "warning" as const : "default" as const },
    { label: "Customers", value: customerCount, href: "/admin/customers", icon: Users },
    { label: "Abandoned", value: abandonedCount, href: "/admin/abandoned", icon: ShoppingBag },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Real-time overview of your Doshok store performance."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {stats.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminSectionCard title="Recent Orders" description="Latest customer orders.">
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
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell className="text-right font-bold">৳{order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <AdminStatusBadge status={order.paymentStatus === "paid" ? "Paid" : "Pending"} type="payment" />
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge status={order.orderStatus} type="order" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end p-3 border-t border-black/5">
                <Link href="/admin/orders" className="text-xs font-bold text-neutral-500 hover:text-neutral-950 transition-colors">
                  View all orders →
                </Link>
              </div>
            </AdminTableShell>
          )}
        </AdminSectionCard>

        <AdminSectionCard title="Low Stock Alerts" description="Products that need restocking soon.">
          {lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="mb-3 h-8 w-8 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-500">Stock levels look good</p>
              <p className="text-xs text-neutral-400 mt-1">No products are running low on stock.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between rounded-xl border border-black/5 bg-neutral-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{variant.product.name}</p>
                      <p className="text-xs text-neutral-500">{variant.size} / {variant.color}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">{variant.stock} left</p>
                    <Link href={`/admin/products/${variant.product.id}`} className="text-[10px] text-neutral-400 hover:text-neutral-950">
                      Edit →
                    </Link>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Link href="/admin/products?status=Active" className="text-xs font-bold text-neutral-500 hover:text-neutral-950 transition-colors">
                  Manage products →
                </Link>
              </div>
            </div>
          )}
        </AdminSectionCard>
      </div>
    </div>
  )
}
