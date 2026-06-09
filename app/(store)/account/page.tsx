"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ShoppingBag, ArrowRight, BadgeCheck, AlertTriangle, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

type Order = {
  id: string
  orderNumber: string
  total: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
  items: { quantity: number }[]
}

export default function AccountDashboardPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch(`/api/orders?userId=${session.user.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data.slice(0, 5))
      })
      .catch(() => {})
  }, [session])

  const handleResend = useCallback(async () => {
    if (!session?.user?.email) return
    setResending(true)
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Verification email sent. Check your inbox.")
      } else {
        toast.error(data.error ?? "Failed to send")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setResending(false)
    }
  }, [session])

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    confirmed: "default",
    shipped: "default",
    delivered: "outline",
    cancelled: "destructive",
  }

  const displayName = session?.user?.firstName || session?.user?.name || "there"
  const isVerified = !!session?.user?.emailVerified

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Welcome back</p>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hello, {displayName}</h1>
          {isVerified && (
            <BadgeCheck className="h-6 w-6 text-primary shrink-0" />
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-sm">{session?.user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isVerified ? (
              <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4" />
                Verified
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-600 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Email not verified
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-xl"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                  ) : (
                    <Mail className="h-3 w-3 mr-1.5" />
                  )}
                  {resending ? "Sending..." : "Resend Verification"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Link href="/account/orders" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 px-6">No orders yet. Start shopping to see your orders here.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.orderNumber}`}
                  className="flex items-center justify-between py-4 px-6 text-sm hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-mono font-medium truncate text-xs">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} &middot;{" "}
                      {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-semibold">৳{order.total.toLocaleString()}</p>
                    <Badge variant={statusColors[order.orderStatus] ?? "secondary"} className="mt-1 text-[10px] rounded-full px-2">
                      {order.orderStatus}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
