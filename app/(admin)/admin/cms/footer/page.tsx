"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminPageHeader, AdminSectionCard } from "@/components/admin/admin-ui"
import { ArrowRight, Settings, ExternalLink } from "lucide-react"

type SiteSettings = {
  brandName: string
  footerText: string
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
  youtubeUrl: string
  phone: string
  supportEmail: string
  address: string
}

export default function CMSFooterPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setSettings({
            brandName: d.data.brandName ?? "",
            footerText: d.data.footerText ?? "",
            facebookUrl: d.data.facebookUrl ?? "",
            instagramUrl: d.data.instagramUrl ?? "",
            tiktokUrl: d.data.tiktokUrl ?? "",
            youtubeUrl: d.data.youtubeUrl ?? "",
            phone: d.data.phone ?? "",
            supportEmail: d.data.supportEmail ?? "",
            address: d.data.address ?? "",
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="CMS"
        title="Footer Content"
        description="Footer brand info, contact details, and social links are managed in Site Settings."
        backHref="/admin/cms"
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <AdminSectionCard
            title="Footer Settings Location"
            description="All footer content is configured through the Site Settings panel."
          >
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                The footer is built from multiple setting areas in Site Settings. Each field controls a specific part of the footer on the storefront.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Brand Name", desc: "Shown in the footer logo area" },
                  { label: "Footer Description", desc: "Short tagline below brand name" },
                  { label: "Contact Info", desc: "Phone, email, and address" },
                  { label: "Social Links", desc: "Facebook, Instagram, TikTok, YouTube" },
                  { label: "Footer Menu Links", desc: "Shop, Help, Policy columns" },
                  { label: "Copyright Text", desc: "Generated from brand name automatically" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/40 p-3">
                    <div className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded bg-slate-200">
                      <Settings className="h-2.5 w-2.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/site-settings"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" />
                Open Site Settings
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AdminSectionCard>

          {settings && !loading && (
            <AdminSectionCard
              title="Current Footer Preview"
              description="Read-only view of your current footer content."
            >
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Brand Name</span>
                  <span className="font-medium text-slate-700">{settings.brandName || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Footer Text</span>
                  <span className="font-medium text-slate-700 max-w-[240px] truncate">{settings.footerText || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-medium text-slate-700">{settings.phone || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium text-slate-700">{settings.supportEmail || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Address</span>
                  <span className="font-medium text-slate-700 max-w-[240px] truncate">{settings.address || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Social Links</span>
                  <div className="flex gap-1.5">
                    {settings.facebookUrl && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">FB</span>}
                    {settings.instagramUrl && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">IG</span>}
                    {settings.tiktokUrl && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">TT</span>}
                    {settings.youtubeUrl && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">YT</span>}
                    {!settings.facebookUrl && !settings.instagramUrl && !settings.tiktokUrl && !settings.youtubeUrl && (
                      <span className="text-slate-400">None set</span>
                    )}
                  </div>
                </div>
              </div>
            </AdminSectionCard>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Footer Structure</h3>
            <div className="space-y-2.5 text-[11px] text-slate-500">
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-center">
                <p className="font-semibold text-slate-700">Brand Area</p>
                <p className="text-slate-400">Logo, brand name, description</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-center">
                <p className="font-semibold text-slate-700">Footer Menu</p>
                <p className="text-slate-400">Shop · Help · Policy columns</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-center">
                <p className="font-semibold text-slate-700">Contact Info</p>
                <p className="text-slate-400">Phone, email, address, social</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-center">
                <p className="font-semibold text-slate-700">Copyright</p>
                <p className="text-slate-400">Auto-generated from brand name</p>
              </div>
            </div>
          </div>

          <Link
            href="/admin/site-settings"
            className="flex items-center justify-center gap-2 h-9 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Settings className="h-3.5 w-3.5" />
            Edit in Site Settings
          </Link>
        </div>
      </div>
    </div>
  )
}