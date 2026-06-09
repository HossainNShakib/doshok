import { cert, initializeApp, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let privateKey = process.env.FIREBASE_PRIVATE_KEY

if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1)
}
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, "\n")
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  if (!projectId || !clientEmail || !privateKey) {
    return undefined
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

export function getFirebaseAdminAuth() {
  const fbApp = getFirebaseAdminApp()
  if (!fbApp) return undefined
  return getAuth(fbApp)
}

export async function verifyFirebaseIdToken(idToken: string) {
  const adminAuth = getFirebaseAdminAuth()
  if (!adminAuth) {
    return { success: false, error: "Firebase Admin not configured" } as const
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    return { success: true, decoded } as const
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid token"
    return { success: false, error: message } as const
  }
}
