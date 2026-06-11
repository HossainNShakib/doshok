"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AdminPageHeader, AdminSectionCard } from "@/components/admin/admin-ui"
import { Plus, Trash2, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

type FooterLinkItem = { label: string; href: string; group: string }
type MenuLink = { label: string; href: string }

const HEADER_QUICK_LINKS: MenuLink[] = [
  { label: "Help", href: "/help" },
  { label: "Policy", href: "/policy" },
  { label: "About Doshok", href: "/about" },
  { label: "Track Order", href: "/track-order" },
]

const VALID_INTERNAL_PATHS = [
  { value: "/products", label: "/products — All Products" },
  { value: "/new-arrivals", label: "/new-arrivals — New Arrivals" },
  { value: "/about", label: "/about — About" },
  { value: "/contact", label: "/contact — Contact" },
  { value: "/faq", label: "/faq — FAQ" },
  { value: "/size-guide", label: "/size-guide — Size Guide" },
  { value: "/care-guide", label: "/care-guide — Care Guide" },
  { value: "/track-order", label: "/track-order — Track Order" },
  { value: "/privacy", label: "/privacy — Privacy Policy" },
  { value: "/terms", label: "/terms — Terms" },
  { value: "/return-policy", label: "/return-policy — Return Policy" },
  { value: "/delivery", label: "/delivery — Delivery" },
  { value: "/shipping", label: "/shipping — Shipping" },
  { value: "/cookies", label: "/cookies — Cookies" },
  { value: "/help", label: "/help — Help Hub" },
  { value: "/policy", label: "/policy — Policy Hub" },
  { value: "/stories", label: "/stories — Stories" },
  { value: "/store-locator", label: "/store-locator — Store Locator" },
  { value: "/gift-cards", label: "/gift-cards — Gift Cards" },
  { value: "/careers", label: "/careers — Careers" },
]

function FooterGroupEditor({
  group,
  links,
  onAdd,
  onUpdate,
  onRemove,
}: {
  group: "Shop" | "Help" | "Policy"
  links: MenuLink[]
  onAdd: () => void
  onUpdate: (index: number, field: "label" | "href", value: string) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-700">Footer — {group}</h3>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
          {links.length} link{links.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {links.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-3">No links added. Default {group.toLowerCase()} links will be shown.</p>
        )}
        {links.map((link, i) => (
          <div key={i} className="flex gap-1.5 items-end">
            <div className="flex-1 space-y-1 min-w-0">
              <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Label</Label>
              <Input
                value={link.label}
                onChange={(e) => onUpdate(i, "label", e.target.value)}
                placeholder="e.g. All Products"
                className="h-8 text-xs"
              />
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Path</Label>
              <Select value={link.href} onValueChange={(v) => v && onUpdate(i, "href", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VALID_INTERNAL_PATHS.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => onRemove(i)}
              className="shrink-0 mb-1 h-7 w-7 text-slate-400 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="w-full mt-2 rounded-lg h-8 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
        </Button>
      </div>
    </div>
  )
}

export default function CMSMenusPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [headerLinks, setHeaderLinks] = useState<string[]>([])
  const [footerShopLinks, setFooterShopLinks] = useState<MenuLink[]>([])
  const [footerHelpLinks, setFooterHelpLinks] = useState<MenuLink[]>([])
  const [footerPolicyLinks, setFooterPolicyLinks] = useState<MenuLink[]>([])

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          try {
            const footerLinks: FooterLinkItem[] = JSON.parse(d.data.footerLinks || "[]")
            setHeaderLinks(d.data.headerQuickLinks ? JSON.parse(d.data.headerQuickLinks) : HEADER_QUICK_LINKS.map(l => l.href))
            setFooterShopLinks(footerLinks.filter((l) => l.group === "Shop"))
            setFooterHelpLinks(footerLinks.filter((l) => l.group === "Help"))
            setFooterPolicyLinks(footerLinks.filter((l) => l.group === "Policy"))
          } catch {
            setHeaderLinks(HEADER_QUICK_LINKS.map(l => l.href))
          }
        }
      })
      .catch(() => toast.error("Failed to load menus"))
      .finally(() => setLoading(false))
  }, [])

  function updateHeaderLinks(index: number, href: string) {
    const updated = [...headerLinks]
    updated[index] = href
    setHeaderLinks(updated)
  }

  function removeHeaderLink(index: number) {
    setHeaderLinks(headerLinks.filter((_, i) => i !== index))
  }

  function addHeaderLink() {
    setHeaderLinks([...headerLinks, "/products"])
  }

  function addFooterLink(group: "Shop" | "Help" | "Policy") {
    const setter = group === "Shop" ? setFooterShopLinks : group === "Help" ? setFooterHelpLinks : setFooterPolicyLinks
    setter(prev => [...prev, { label: "", href: "/products", group }])
  }

  function updateFooterLink(group: "Shop" | "Help" | "Policy", index: number, field: "label" | "href", value: string) {
    const setter = group === "Shop" ? setFooterShopLinks : group === "Help" ? setFooterHelpLinks : setFooterPolicyLinks
    const getter = group === "Shop" ? footerShopLinks : group === "Help" ? footerHelpLinks : footerPolicyLinks
    const updated = [...getter]
    updated[index] = { ...updated[index], [field]: value }
    setter(updated)
  }

  function removeFooterLink(group: "Shop" | "Help" | "Policy", index: number) {
    const setter = group === "Shop" ? setFooterShopLinks : group === "Help" ? setFooterHelpLinks : setFooterPolicyLinks
    const getter = group === "Shop" ? footerShopLinks : group === "Help" ? footerHelpLinks : footerPolicyLinks
    setter(getter.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const footerLinks: FooterLinkItem[] = [
        ...footerShopLinks.map(l => ({ ...l, group: "Shop" })),
        ...footerHelpLinks.map(l => ({ ...l, group: "Help" })),
        ...footerPolicyLinks.map(l => ({ ...l, group: "Policy" })),
      ]
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headerQuickLinks: JSON.stringify(headerLinks),
          footerLinks: JSON.stringify(footerLinks),
        }),
      })
      const d = await res.json()
      if (d.success) {
        toast.success("Menu links saved")
      } else {
        toast.error(d.error ?? "Failed to save")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400 py-8">Loading menus...</p>
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="CMS"
        title="Navigation Menus"
        description="Configure storefront navigation links shown in the header and footer."
        backHref="/admin/cms"
      />

      <AdminSectionCard
        title="Header Quick Links"
        description="Links shown in the top bar of the storefront header."
      >
        <div className="space-y-2">
          {headerLinks.length === 0 && (
            <p className="text-xs text-slate-500">No header links configured. Default links will be shown.</p>
          )}
          {headerLinks.map((href, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Page</Label>
                <Select value={href} onValueChange={(v) => v && updateHeaderLinks(i, v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VALID_INTERNAL_PATHS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeHeaderLink(i)}
                className="shrink-0 mb-1 h-7 w-7 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addHeaderLink} className="mt-2 rounded-lg h-8 text-xs font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
          </Button>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Footer Menu"
        description="Three-column footer navigation. Each column appears as a group on the storefront."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <FooterGroupEditor
            group="Shop"
            links={footerShopLinks}
            onAdd={() => addFooterLink("Shop")}
            onUpdate={(i, f, v) => updateFooterLink("Shop", i, f, v)}
            onRemove={(i) => removeFooterLink("Shop", i)}
          />
          <FooterGroupEditor
            group="Help"
            links={footerHelpLinks}
            onAdd={() => addFooterLink("Help")}
            onUpdate={(i, f, v) => updateFooterLink("Help", i, f, v)}
            onRemove={(i) => removeFooterLink("Help", i)}
          />
          <FooterGroupEditor
            group="Policy"
            links={footerPolicyLinks}
            onAdd={() => addFooterLink("Policy")}
            onUpdate={(i, f, v) => updateFooterLink("Policy", i, f, v)}
            onRemove={(i) => removeFooterLink("Policy", i)}
          />
        </div>
      </AdminSectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="h-9 rounded-lg px-6 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white">
          {saving ? "Saving..." : "Save Menu Links"}
        </Button>
      </div>
    </div>
  )
}