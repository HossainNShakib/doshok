"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AdminPageHeader, AdminSectionCard } from "@/components/admin/admin-ui"

type Settings = {
  brandName: string
  supportEmail: string
  phone: string
  whatsapp: string
  facebookUrl: string
  instagramUrl: string
  address: string
  footerText: string
  accentColor: string
  buttonRadius: string
  cardRadius: string
  storefrontTone: string
  adminAccentTone: string
}

const ACCENT_COLORS = [
  { value: "#364152", label: "Charcoal (Default)" },
  { value: "#1a1a1a", label: "Pure Black" },
  { value: "#2d3748", label: "Dark Slate" },
  { value: "#4a5568", label: "Cool Gray" },
  { value: "#1e3a5f", label: "Navy" },
  { value: "#2d4a3e", label: "Forest" },
  { value: "#4a1942", label: "Plum" },
  { value: "#3d2914", label: "Espresso" },
  { value: "#364958", label: "Steel Blue" },
  { value: "#1f2937", label: "Graphite" },
]

const BUTTON_RADII = [
  { value: "none", label: "None (Sharp)" },
  { value: "sm", label: "Small (4px)" },
  { value: "md", label: "Medium (6px)" },
  { value: "lg", label: "Large (8px)" },
  { value: "xl", label: "Extra Large (12px)" },
  { value: "full", label: "Full (Pill)" },
  { value: "2xl", label: "2XL (16px)" },
  { value: "3xl", label: "3XL (20px)" },
]

const CARD_RADII = [
  { value: "none", label: "None (Sharp)" },
  { value: "sm", label: "Small (8px)" },
  { value: "md", label: "Medium (12px)" },
  { value: "lg", label: "Large (16px)" },
  { value: "xl", label: "Extra Large (20px)" },
  { value: "1.5rem", label: "1.5rem (24px)" },
  { value: "2rem", label: "2rem (32px)" },
  { value: "3rem", label: "3rem (48px)" },
]

const STOREFRONT_TONES = [
  { value: "light", label: "Light (Off-white)" },
  { value: "warm", label: "Warm (Cream)" },
  { value: "cool", label: "Cool (Blue-gray)" },
  { value: "neutral", label: "Neutral (Gray)" },
]

const ADMIN_TONES = [
  { value: "neutral", label: "Neutral (Gray)" },
  { value: "slate", label: "Slate" },
  { value: "zinc", label: "Zinc" },
  { value: "stone", label: "Stone" },
]

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const cleaned = {} as Settings
          const defaults: Settings = {
            brandName: "",
            supportEmail: "",
            phone: "",
            whatsapp: "",
            facebookUrl: "",
            instagramUrl: "",
            address: "",
            footerText: "",
            accentColor: "#364152",
            buttonRadius: "xl",
            cardRadius: "1.5rem",
            storefrontTone: "light",
            adminAccentTone: "neutral",
          }
          for (const key of Object.keys(defaults) as (keyof Settings)[]) {
            cleaned[key] = d.data[key] ?? defaults[key]
          }
          setSettings(cleaned)
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false))
  }, [])

  function update(field: keyof Settings, value: string) {
    setSettings((prev) => prev ? { ...prev, [field]: value } : prev)
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const d = await res.json()
      if (d.success) {
        toast.success("Settings saved")
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
    return <p className="text-muted-foreground py-8">Loading settings...</p>
  }

  if (!settings) {
    return <p className="text-destructive py-8">Failed to load settings.</p>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminPageHeader eyebrow="Settings" title="Site Settings" description="Set the brand details and theme preferences customers see across the storefront." />

      <AdminSectionCard title="Brand Info" description="Storefront brand label and short footer description.">
          <div className="space-y-2">
            <Label htmlFor="brandName">Brand name</Label>
            <Input id="brandName" value={settings.brandName} onChange={(e) => update("brandName", e.target.value)} placeholder="DOSHOK" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footerText">Footer short description</Label>
            <Textarea id="footerText" value={settings.footerText} onChange={(e) => update("footerText", e.target.value)} rows={3} placeholder="A short tagline shown site-wide in the footer." />
          </div>
      </AdminSectionCard>

      <AdminSectionCard title="Theme Settings" description="Customize the visual appearance of the storefront and admin panel.">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  id="accentColor"
                  value={settings.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="w-12 h-10 rounded-lg border cursor-pointer"
                />
                <Select value={settings.accentColor} onValueChange={(v) => { if (v) update("accentColor", v) }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENT_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: c.value }} />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Primary color used for buttons, links, and accents.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonRadius">Button Style</Label>
              <Select value={settings.buttonRadius} onValueChange={(v) => { if (v) update("buttonRadius", v) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUTTON_RADII.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Corner radius for buttons and interactive elements.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="cardRadius">Card Radius</Label>
              <Select value={settings.cardRadius} onValueChange={(v) => { if (v) update("cardRadius", v) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_RADII.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Corner radius for cards and container elements.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storefrontTone">Storefront Background</Label>
              <Select value={settings.storefrontTone} onValueChange={(v) => { if (v) update("storefrontTone", v) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STOREFRONT_TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Overall background tone of the storefront.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="adminAccentTone">Admin Accent</Label>
              <Select value={settings.adminAccentTone} onValueChange={(v) => { if (v) update("adminAccentTone", v) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Color tone for admin panel accent elements.</p>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Contact Information" description="Add the support channels customers can use for order and delivery help.">
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support email</Label>
            <Input id="supportEmail" type="email" value={settings.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} placeholder="hello@doshok.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" value={settings.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+880 17XXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp number <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="whatsapp" value={settings.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+880 17XXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Service area</Label>
            <Textarea id="address" value={settings.address} onChange={(e) => update("address", e.target.value)} rows={2} placeholder="e.g. All districts across Bangladesh" />
          </div>
      </AdminSectionCard>

      <AdminSectionCard title="Social Media Links" description="Optional public social links. Leave blank to hide from the storefront.">
          <div className="space-y-2">
            <Label htmlFor="facebookUrl">Facebook URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="facebookUrl" value={settings.facebookUrl} onChange={(e) => update("facebookUrl", e.target.value)} placeholder="https://facebook.com/doshok" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="instagramUrl" value={settings.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} placeholder="https://instagram.com/doshok" />
          </div>
      </AdminSectionCard>

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving} className="h-11 rounded-full px-8">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
