import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login")
  }

  return <>{children}</>
}
