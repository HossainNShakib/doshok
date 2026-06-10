import { AdminPageHeader } from "@/components/admin/admin-ui"
import { MessageSquare } from "lucide-react"

export default function SupportMessagesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Support" title="Contact Messages" description="Customer inquiries submitted through the contact form." />
      <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-white p-12 text-center">
        <MessageSquare className="mx-auto mb-4 h-10 w-10 text-neutral-300" />
        <h2 className="text-lg font-black tracking-[-0.02em]">This module is ready for setup.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
          Contact form submissions and customer inquiries will be visible here.
        </p>
      </div>
    </div>
  )
}