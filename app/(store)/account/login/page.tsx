import { redirect } from "next/navigation"

export default function OldAccountLoginPage() {
  redirect("/auth/login")
}
