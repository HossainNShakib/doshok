import Link from "next/link"
import { Eye, FileText } from "lucide-react"
import { AdminPageHeader, AdminStatusBadge, AdminTableShell } from "@/components/admin/admin-ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const INFO_PAGES = [
  { title: "About", slug: "/about", description: "Brand story, values, and team" },
  { title: "Contact", slug: "/contact", description: "Contact form and support information" },
  { title: "FAQ", slug: "/faq", description: "Common questions about orders, delivery, and returns" },
  { title: "Delivery", slug: "/delivery", description: "Delivery timelines, zones, and tracking" },
  { title: "Shipping", slug: "/shipping", description: "Shipping policy and delivery details" },
  { title: "Return Policy", slug: "/return-policy", description: "Return window, steps, and refund info" },
  { title: "Returns", slug: "/returns", description: "Returns and exchanges guide" },
  { title: "Privacy Policy", slug: "/privacy", description: "How Doshok handles customer data" },
  { title: "Terms", slug: "/terms", description: "Terms and conditions for using Doshok" },
  { title: "Cookies", slug: "/cookies", description: "Cookie usage and preferences" },
  { title: "Size Guide", slug: "/size-guide", description: "Size measurements and fit guide" },
  { title: "Care Guide", slug: "/care-guide", description: "Fabric care and maintenance tips" },
  { title: "Accessibility", slug: "/accessibility", description: "Accessibility commitment and features" },
  { title: "Careers", slug: "/careers", description: "Job openings and hiring process" },
  { title: "Gift Cards", slug: "/gift-cards", description: "Gift card options and redemption" },
  { title: "Stories", slug: "/stories", description: "Editorial content and brand stories" },
  { title: "Store Locator", slug: "/store-locator", description: "Physical store locations" },
]

export default function CMSPagesPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="CMS"
        title="Pages"
        description="Static information pages available on the storefront. These are pre-configured and currently view-only."
        backHref="/admin/cms"
      />

      <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100">
            <FileText className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Content editing not available yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              These pages contain pre-written static content. Page content editing is planned for a future update. You can preview each page using the View action below.
            </p>
          </div>
        </div>
      </div>

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100">
              <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Page Title</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">URL Path</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Description</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Status</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold text-right">Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INFO_PAGES.map((page) => (
              <TableRow key={page.slug} className="border-slate-50 hover:bg-slate-50/60">
                <TableCell className="text-xs font-semibold text-slate-800">{page.title}</TableCell>
                <TableCell className="font-mono text-[11px] text-slate-500">{page.slug}</TableCell>
                <TableCell className="text-xs text-slate-500 max-w-[240px]">{page.description}</TableCell>
                <TableCell>
                  <AdminStatusBadge status="Active" />
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={page.slug}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-md text-[11px] font-semibold h-7 px-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  )
}