"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { toast } from "sonner"
import { AdminPageHeader, AdminSectionCard } from "@/components/admin/admin-ui"
import { ImageUploader } from "@/components/admin/image-uploader"
import { ArrowRight, Layout, Megaphone, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

type HomepageData = {
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  featuredIds: string
  announcementBarText: string
  announcementBarEnabled: boolean
  promoBannerText: string
  promoBannerImage: string
  promoBannerLink: string
  promoBannerEnabled: boolean
}

export default function CMSBannersPage() {
  const [data, setData] = useState<HomepageData>({
    heroTitle: "", heroSubtitle: "", heroImage: "", featuredIds: "[]",
    announcementBarText: "", announcementBarEnabled: false,
    promoBannerText: "", promoBannerImage: "", promoBannerLink: "", promoBannerEnabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/homepage")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setData({
            heroTitle: d.data.heroTitle ?? "",
            heroSubtitle: d.data.heroSubtitle ?? "",
            heroImage: d.data.heroImage ?? "",
            featuredIds: d.data.featuredIds ?? "[]",
            announcementBarText: d.data.announcementBarText ?? "",
            announcementBarEnabled: d.data.announcementBarEnabled ?? false,
            promoBannerText: d.data.promoBannerText ?? "",
            promoBannerImage: d.data.promoBannerImage ?? "",
            promoBannerLink: d.data.promoBannerLink ?? "",
            promoBannerEnabled: d.data.promoBannerEnabled ?? false,
          })
        }
      })
      .catch(() => toast.error("Failed to load banner settings"))
      .finally(() => setLoading(false))
  }, [])

  function update(field: keyof HomepageData, value: string | boolean) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroTitle: data.heroTitle, heroSubtitle: data.heroSubtitle, heroImage: data.heroImage, featuredIds: data.featuredIds,
          announcementBarText: data.announcementBarText, announcementBarEnabled: data.announcementBarEnabled,
          promoBannerText: data.promoBannerText, promoBannerImage: data.promoBannerImage,
          promoBannerLink: data.promoBannerLink, promoBannerEnabled: data.promoBannerEnabled,
        }),
      })
      const d = await res.json()
      if (d.success) toast.success("Banner settings saved")
      else toast.error(d.error ?? "Failed to save")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-slate-400 py-8">Loading banner settings...</p>

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="CMS"
        title="Banners"
        description="Manage the announcement bar and promotional banners shown across the storefront."
        backHref="/admin/cms"
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <AdminSectionCard
            title="Announcement Bar"
            description="A thin bar at the very top of every storefront page. Best for urgent offers or short messages."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium text-slate-700">Enable Announcement Bar</Label>
                  <p className="text-[11px] text-slate-400">Shown at the top of every page on the storefront.</p>
                </div>
                <Switch checked={data.announcementBarEnabled} onCheckedChange={(v) => update("announcementBarEnabled", v)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="announcementText" className="text-xs font-medium text-slate-600">Announcement Text</Label>
                <Input
                  id="announcementText"
                  value={data.announcementBarText}
                  onChange={(e) => update("announcementBarText", e.target.value)}
                  placeholder="e.g. Free delivery inside Chattogram on orders over ৳999"
                  disabled={!data.announcementBarEnabled}
                  className={cn("text-xs h-9", !data.announcementBarEnabled && "opacity-50")}
                />
                <p className="text-[10px] text-slate-400">Keep under 80 characters for best display across all devices.</p>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Promo Banner"
            description="An optional promotional banner shown below the hero section on the homepage."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium text-slate-700">Enable Promo Banner</Label>
                  <p className="text-[11px] text-slate-400">Appears below the hero banner on the homepage only.</p>
                </div>
                <Switch checked={data.promoBannerEnabled} onCheckedChange={(v) => update("promoBannerEnabled", v)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="promoText" className="text-xs font-medium text-slate-600">Promo Text</Label>
                  <Input
                    id="promoText"
                    value={data.promoBannerText}
                    onChange={(e) => update("promoBannerText", e.target.value)}
                    placeholder="e.g. Summer Sale — Up to 40% off"
                    disabled={!data.promoBannerEnabled}
                    className={cn("text-xs h-9", !data.promoBannerEnabled && "opacity-50")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="promoLink" className="text-xs font-medium text-slate-600">Link <span className="text-slate-400 font-normal text-[10px]">(optional)</span></Label>
                  <Input
                    id="promoLink"
                    value={data.promoBannerLink}
                    onChange={(e) => update("promoBannerLink", e.target.value)}
                    placeholder="/products or https://..."
                    disabled={!data.promoBannerEnabled}
                    className={cn("text-xs h-9", !data.promoBannerEnabled && "opacity-50")}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Banner Image <span className="text-slate-400 font-normal text-[10px]">(optional)</span></Label>
                <p className="text-[11px] text-slate-400">Optional background or side image for the promo banner block.</p>
                <ImageUploader
                  images={data.promoBannerImage ? [data.promoBannerImage] : []}
                  onChange={(imgs) => update("promoBannerImage", imgs[0] || "")}
                  single
                  label=""
                  helperText=""
                  folder="promo"
                />
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Hero Banner"
            description="The main homepage banner with title, subtitle, and background image."
          >
            <div className="space-y-3">
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                <p className="text-xs font-medium text-slate-600">Hero banner is managed in</p>
                <Link href="/admin/homepage" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:underline">
                  Homepage Settings <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50/40 p-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Current Title</p>
                  <p className="text-xs font-medium text-slate-700">{data.heroTitle || "(not set)"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Current Subtitle</p>
                  <p className="text-xs font-medium text-slate-700 line-clamp-2">{data.heroSubtitle || "(not set)"}</p>
                </div>
                {data.heroImage && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Background Image</p>
                    <img src={data.heroImage} alt="" className="h-16 w-24 rounded-md object-cover" />
                  </div>
                )}
              </div>
            </div>
          </AdminSectionCard>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Banner Locations</h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-slate-100">
                  <Megaphone className="h-3 w-3 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Announcement Bar</p>
                  <p className="text-[11px] text-slate-400">Top of every storefront page. Thin, single-line bar.</p>
                </div>
                <div className={cn("ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold", data.announcementBarEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                  {data.announcementBarEnabled ? "On" : "Off"}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-slate-100">
                  <Layout className="h-3 w-3 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Hero Banner</p>
                  <p className="text-[11px] text-slate-400">Homepage hero section. Full-width with overlay text.</p>
                </div>
                <div className={cn("ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-400")}>
                  Always
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-slate-100">
                  <Tag className="h-3 w-3 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Promo Banner</p>
                  <p className="text-[11px] text-slate-400">Below hero on homepage. Optional block.</p>
                </div>
                <div className={cn("ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold", data.promoBannerEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                  {data.promoBannerEnabled ? "On" : "Off"}
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full h-9 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white">
            {saving ? "Saving..." : "Save Banner Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}