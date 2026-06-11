"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Copy, RefreshCw, ExternalLink, Clock } from "lucide-react"
import { AdminPageHeader, AdminSectionCard } from "@/components/admin/admin-ui"

type AbandonedCheckout = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
  productId: string | null
  variantId: string | null
  quantity: number | null
  size: string | null
  color: string | null
  deliveryZone: string | null
  step: string
  couponCode: string | null
  subtotal: number
  discount: number
  total: number
  contacted: boolean
  notes: string | null
  source: string | null
  lastSeenAt: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminAbandonedDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [item, setItem] = useState<AbandonedCheckout | null>(null)
  const [contacted, setContacted] = useState(false)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null)
  const [recoveryExpiresAt, setRecoveryExpiresAt] = useState<string | null>(null)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/abandoned/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setItem(d.data)
          setContacted(d.data.contacted)
          setNotes(d.data.notes ?? "")
        }
      })
      .catch(() => {})
  }, [id])

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/abandoned/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacted, notes }),
    })
    const d = await res.json()
    if (d.success) {
      toast.success("Updated")
      router.refresh()
    } else {
      toast.error(d.error ?? "Failed")
    }
    setSaving(false)
  }

  async function handleGenerateRecoveryLink() {
    setGeneratingLink(true)
    try {
      const res = await fetch(`/api/admin/abandoned/${id}/recovery-link`, { method: "POST" })
      const d = await res.json()
      if (d.success) {
        setRecoveryUrl(d.data.recoveryUrl)
        setRecoveryExpiresAt(d.data.expiresAt)
        toast.success("Recovery link generated")
      } else {
        toast.error(d.error ?? "Failed to generate link")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setGeneratingLink(false)
    }
  }

  async function handleCopyLink() {
    if (!recoveryUrl) return
    try {
      await navigator.clipboard.writeText(recoveryUrl)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  if (!item) return <div className="text-sm text-slate-400 py-10">Loading...</div>

  return (
    <div className="space-y-5 max-w-3xl">
      <AdminPageHeader eyebrow="Sales" title="Abandoned Checkout" description="Review checkout details and track recovery follow-up for this lead." backHref="/admin/abandoned" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AdminSectionCard title="Customer Info" description="Contact details captured during the abandoned checkout.">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-semibold text-slate-700">{item.name || "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Phone</span><span className="font-mono font-semibold text-slate-700">{item.phone || "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="font-medium text-slate-700">{item.email || "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Address</span><span className="font-medium text-slate-700">{item.address || "—"}</span></div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Checkout Details" description="Step at which the customer abandoned and what was in their cart.">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Step</span><span className="font-semibold text-slate-700">{item.step}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Variant</span><span className="font-medium text-slate-700">{[item.size, item.color].filter(Boolean).join(" / ") || "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Quantity</span><span className="font-medium text-slate-700">{item.quantity ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Delivery zone</span><span className="font-medium text-slate-700">{item.deliveryZone || "—"}</span></div>
            {item.couponCode && <div className="flex justify-between"><span className="text-slate-400">Coupon</span><span className="font-mono font-bold text-slate-800">{item.couponCode}</span></div>}
            {item.subtotal > 0 && <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span className="font-medium text-slate-700">৳{item.subtotal.toLocaleString()}</span></div>}
            {item.total > 0 && <div className="flex justify-between"><span className="text-slate-400">Total</span><span className="font-semibold text-slate-800">৳{item.total.toLocaleString()}</span></div>}
            <div className="flex justify-between"><span className="text-slate-400">Source</span><span className="font-medium text-slate-700">{item.source || "—"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-slate-400">Created</span><span className="text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</span></div>
            {item.lastSeenAt && <div className="flex justify-between"><span className="text-slate-400">Last seen</span><span className="text-slate-600">{new Date(item.lastSeenAt).toLocaleDateString()}</span></div>}
          </div>
        </AdminSectionCard>
      </div>

      <AdminSectionCard title="Follow-up" description="Mark contacted state and keep internal recovery notes.">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch id="contacted" checked={contacted} onCheckedChange={setContacted} />
            <Label htmlFor="contacted" className="text-xs font-medium text-slate-700">Contacted</Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium text-slate-600">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this abandoned checkout..." rows={3} className="text-xs" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="h-9 rounded-lg text-xs font-semibold">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Recovery Link" description="Generate a secure link so the customer can return to a prefilled checkout.">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Send this secure link to the customer via WhatsApp, SMS, or email so they can continue checkout.</p>

          {recoveryUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
                <Input value={recoveryUrl} readOnly className="flex-1 border-0 bg-transparent p-0 text-[11px] font-mono shadow-none focus-visible:ring-0 text-slate-600" />
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="shrink-0 gap-1 rounded-md h-7 text-[11px] font-semibold">
                  <Copy className="h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <a href={recoveryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white h-7 px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {recoveryExpiresAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>Expires {new Date(recoveryExpiresAt).toLocaleDateString()}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleGenerateRecoveryLink} disabled={generatingLink} className="gap-1.5 rounded-md h-8 text-[11px] font-semibold">
                <RefreshCw className="h-3 w-3" />
                Regenerate link
              </Button>
            </div>
          ) : (
            <Button onClick={handleGenerateRecoveryLink} disabled={generatingLink} className="gap-1.5 rounded-lg h-9 text-xs font-semibold">
              {generatingLink ? "Generating..." : "Generate Recovery Link"}
            </Button>
          )}
        </div>
      </AdminSectionCard>
    </div>
  )
}