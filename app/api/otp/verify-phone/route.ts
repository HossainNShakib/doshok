import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-response"
import { verifyFirebaseIdToken } from "@/lib/firebase-admin"
import { createPhoneVerifiedToken } from "@/lib/phone-verify-token"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firebaseIdToken, phone } = body

    if (!firebaseIdToken || typeof firebaseIdToken !== "string") {
      return error("firebaseIdToken is required")
    }
    if (!phone || typeof phone !== "string" || phone.length < 11) {
      return error("Valid phone number is required")
    }

    const result = await verifyFirebaseIdToken(firebaseIdToken)

    if (!result.success) {
      return error(result.error || "Firebase token verification failed")
    }

    const tokenPhone = result.decoded.phone_number
    if (!tokenPhone) {
      return error("Firebase token does not contain a phone number")
    }

    const submittedPhone = phone.replace(/[^+\d]/g, "")
    const decodedPhone = tokenPhone.replace(/[^+\d]/g, "")

    if (submittedPhone !== decodedPhone) {
      return error("Phone number does not match verified token")
    }

    const phoneVerifiedToken = createPhoneVerifiedToken(phone)

    return success({ verified: true, phoneVerifiedToken })
  } catch {
    return error("Phone verification failed")
  }
}
