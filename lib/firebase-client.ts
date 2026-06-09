"use client"

import { initializeApp, getApps } from "firebase/app"
import { getAuth, type Auth, type RecaptchaVerifier, type ConfirmationResult } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: ReturnType<typeof initializeApp> | undefined
let auth: Auth | undefined

export function getFirebaseApp() {
  if (app) return app
  if (!firebaseConfig.apiKey) return undefined
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  return app
}

export function getFirebaseAuth(): Auth | undefined {
  if (auth) return auth
  const fbApp = getFirebaseApp()
  if (!fbApp) return undefined
  auth = getAuth(fbApp)
  auth.useDeviceLanguage()
  return auth
}

export async function sendPhoneOtp(
  phone: string,
  recaptchaContainerId: string,
): Promise<ConfirmationResult | null> {
  const fbAuth = getFirebaseAuth()
  if (!fbAuth) return null

  const { RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth")

  const recaptchaVerifier = new RecaptchaVerifier(fbAuth, recaptchaContainerId, {
    size: "invisible",
  })

  const confirmationResult = await signInWithPhoneNumber(fbAuth, phone, recaptchaVerifier)
  return confirmationResult
}

export async function confirmOtpAndGetIdToken(
  confirmationResult: ConfirmationResult,
  verificationCode: string,
): Promise<{ idToken: string; phone: string } | null> {
  try {
    const result = await confirmationResult.confirm(verificationCode)
    const idToken = await result.user.getIdToken()
    const phone = result.user.phoneNumber || ""
    return { idToken, phone }
  } catch {
    return null
  }
}

export type { ConfirmationResult, RecaptchaVerifier }
