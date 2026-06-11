import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminTableShell } from "@/components/admin/admin-ui"

export default async function AdminAbandonedPage() {
  const abandoned = await prisma.abandonedCheckout.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-5">
      <AdminPageHeader eyebrow="Sales" title="Abandoned Checkouts" description={`${abandoned.length} checkout lead${abandoned.length === 1 ? "" : "s"} captured before order completion.`} />

      {abandoned.length === 0 ? (
        <AdminEmptyState title="No abandoned checkouts" description="Recovered checkout leads will appear here when customers leave checkout unfinished." />
      ) : (
      <AdminTableShell>
      <Table>
        <TableHeader>
          <TableRow className="border-slate-100">
            <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Customer</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Phone</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Email</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Step</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Est. Value</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Contacted</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Date</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {abandoned.map((item) => (
            <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/60">
              <TableCell className="text-xs font-semibold text-slate-800">{item.name || "—"}</TableCell>
              <TableCell className="font-mono text-[11px] text-slate-600">{item.phone || "—"}</TableCell>
              <TableCell className="text-xs text-slate-500">{item.email || "—"}</TableCell>
              <TableCell>
                <AdminStatusBadge status={item.step} />
              </TableCell>
              <TableCell className="text-xs font-semibold tabular-nums text-slate-800">
                {item.total > 0 ? `৳${item.total.toLocaleString()}` : "—"}
              </TableCell>
              <TableCell>
                <AdminStatusBadge status={item.contacted ? "Contacted" : "Pending"} />
              </TableCell>
              <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                {item.createdAt.toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/admin/abandoned/${item.id}`}
                  className="inline-flex items-center justify-center rounded-md text-[11px] font-semibold h-7 px-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Details
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </AdminTableShell>
      )}
    </div>
  )
}