"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const { update } = useSession()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  )
  const [message, setMessage] = useState(
    token ? "" : "Missing verification token."
  )
  const fetched = useRef(false)

  useEffect(() => {
    if (!token || fetched.current) return
    fetched.current = true

    let cancelled = false

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (cancelled) return

        if (data.success) {
          setStatus("success")
          setMessage("Your email has been verified successfully!")
          update()
        } else {
          setStatus("error")
          setMessage(data.error ?? "Verification failed.")
        }
      } catch {
        if (!cancelled) {
          setStatus("error")
          setMessage("Something went wrong. Please try again.")
        }
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [token, update])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f1] px-4">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <div>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold tracking-tight mb-2">Verifying your email...</h1>
          </div>
        )}
        {status === "success" && (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Email Verified</h1>
            <p className="text-sm text-muted-foreground mb-8">{message}</p>
            <Link
              href="/account"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to Account
            </Link>
          </div>
        )}
        {status === "error" && (
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Verification Failed</h1>
            <p className="text-sm text-muted-foreground mb-8">{message}</p>
            <Link
              href="/account"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to Account
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f7f5f1] px-4"><Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
