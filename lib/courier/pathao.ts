import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import type {
  PathaoCredentials,
  PathaoTokenCache,
  PathaoTokenResponse,
  PathaoParcelPayload,
  PathaoParcelResponse,
  PathaoErrorResponse,
  ParcelCreateResult,
  PathaoValidationResult,
} from "./types"

const tokenCache: Record<string, PathaoTokenCache> = {}
const TOKEN_TTL_MS = 50 * 60 * 1000

const SANDBOX_BASE = "https://merchant.sandbox.pathao.com"
const LIVE_BASE = "https://merchant.pathao.com"

async function loadCredentials(
  mode: "SANDBOX" | "LIVE"
): Promise<PathaoCredentials | null> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "PATHAO" },
  })

  if (!setting || !setting.enabled) return null
  if (setting.mode !== mode) return null

  let creds: PathaoCredentials = {
    clientId: "",
    clientSecret: "",
    username: "",
    password: "",
    storeId: "",
    baseUrl: "",
  }

  if (setting.credentialsJson) {
    try {
      const decrypted = decrypt(setting.credentialsJson, "courier")
      creds = { ...creds, ...JSON.parse(decrypted) }
    } catch {
      return null
    }
  }

  const clientId = creds.clientId || process.env.PATHAO_CLIENT_ID || ""
  const clientSecret = creds.clientSecret || process.env.PATHAO_CLIENT_SECRET || ""
  const username = creds.username || process.env.PATHAO_USERNAME || ""
  const password = creds.password || process.env.PATHAO_PASSWORD || ""
  const storeId = creds.storeId || process.env.PATHAO_STORE_ID || ""
  const baseUrl = creds.baseUrl || (mode === "SANDBOX" ? SANDBOX_BASE : LIVE_BASE)

  return { clientId, clientSecret, username, password, storeId, baseUrl }
}

function getCacheKey(mode: string, clientId: string): string {
  return `${mode}:${clientId.slice(0, 8)}`
}

export async function getPathaoMode(): Promise<"SANDBOX" | "LIVE"> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "PATHAO" },
  })
  return (setting?.mode as "SANDBOX" | "LIVE") || "SANDBOX"
}

export async function isPathaoEnabled(): Promise<boolean> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "PATHAO" },
  })
  return setting?.enabled ?? false
}

export async function validatePathaoCredentials(): Promise<PathaoValidationResult> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "PATHAO" },
  })

  if (!setting) return { valid: false, reason: "not_configured" }
  if (!setting.enabled) return { valid: false, reason: "not_enabled" }

  let creds: PathaoCredentials = {
    clientId: "",
    clientSecret: "",
    username: "",
    password: "",
    storeId: "",
    baseUrl: "",
  }

  if (setting.credentialsJson) {
    try {
      const decrypted = decrypt(setting.credentialsJson, "courier")
      creds = { ...creds, ...JSON.parse(decrypted) }
    } catch {
      return { valid: false, reason: "missing_credentials" }
    }
  }

  const clientId = creds.clientId || process.env.PATHAO_CLIENT_ID || ""
  const clientSecret = creds.clientSecret || process.env.PATHAO_CLIENT_SECRET || ""
  const username = creds.username || process.env.PATHAO_USERNAME || ""
  const password = creds.password || process.env.PATHAO_PASSWORD || ""
  const storeId = creds.storeId || process.env.PATHAO_STORE_ID || ""

  if (!clientId || !clientSecret || !username || !password) {
    return { valid: false, reason: "missing_credentials" }
  }

  if (!storeId) {
    return { valid: false, reason: "missing_store_id" }
  }

  return { valid: true, mode: setting.mode as "SANDBOX" | "LIVE", storeId }
}

export async function getPathaoToken(mode: "SANDBOX" | "LIVE"): Promise<{
  token: string
  baseUrl: string
  storeId: string
} | null> {
  const creds = await loadCredentials(mode)
  if (!creds) return null

  const cacheKey = getCacheKey(mode, creds.clientId)
  const cached = tokenCache[cacheKey]

  if (cached && Date.now() < cached.expiresAt) {
    return { token: cached.token, baseUrl: creds.baseUrl, storeId: creds.storeId }
  }

  const res = await fetch(`${creds.baseUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "password",
      username: creds.username,
      password: creds.password,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    }),
  })

  if (!res.ok) {
    let msg = "Failed to obtain Pathao token"
    try {
      const errBody = await res.json() as PathaoErrorResponse
      msg = errBody.message || msg
    } catch {}
    console.error("[pathao/token]", msg)
    return null
  }

  const data = (await res.json()) as PathaoTokenResponse
  if (!data.access_token) return null

  tokenCache[cacheKey] = {
    token: data.access_token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  }

  return { token: data.access_token, baseUrl: creds.baseUrl, storeId: creds.storeId }
}

export type OrderForParcel = {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  total: number
  paidAmount: number
  dueAmount: number
  paymentMethod: string
  paymentStatus: string
  items: { quantity: number; name: string }[]
  address: {
    division: string
    district: string
    thana: string
    fullAddress: string
  } | null
}

export async function mapOrderToPathaoPayload(
  order: OrderForParcel,
  storeId: string,
  overrideCityId?: string,
  overrideAreaId?: string
): Promise<PathaoParcelPayload> {
  const amountToCollect = order.dueAmount > 0 ? order.dueAmount : 0

  const fullAddress = order.address
    ? [
        order.address.fullAddress,
        order.address.thana,
        order.address.district,
        order.address.division,
      ]
        .filter(Boolean)
        .join(", ")
    : "Address not provided"

  return {
    store_id: storeId,
    merchant_order_id: order.orderNumber,
    recipient_name: order.customerName,
    recipient_phone: order.customerPhone,
    recipient_address: fullAddress,
    item_quantity: order.items.reduce((sum, item) => sum + item.quantity, 1),
    item_weight: "0.5",
    amount_to_collect: amountToCollect,
    special_instruction: order.paymentMethod.toLowerCase() === "cod"
      ? "COD - Please collect payment upon delivery"
      : "Prepaid order",
    recipient_city: overrideCityId || "1",
    recipient_zone: overrideAreaId || "1",
  }
}

export async function createPathaoParcel(
  orderId: string,
  order: OrderForParcel,
  overrideCityId?: string,
  overrideAreaId?: string
): Promise<ParcelCreateResult> {
  const mode = await getPathaoMode()

  if (mode === "LIVE" && (!overrideCityId || !overrideAreaId)) {
    return {
      success: false,
      reason: "City ID and Area ID are required for LIVE mode parcel creation",
      detail: "Please provide Pathao city_id and zone/area_id values before creating the parcel.",
    }
  }

  const tokenData = await getPathaoToken(mode)
  if (!tokenData) {
    return {
      success: false,
      reason: "Failed to obtain Pathao API token",
      detail: "Please check Pathao credentials in Courier Methods settings.",
    }
  }

  const payload = await mapOrderToPathaoPayload(
    order,
    tokenData.storeId,
    overrideCityId,
    overrideAreaId
  )

  const res = await fetch(`${tokenData.baseUrl}/api/v2/trigger-parcel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenData.token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok || (data as PathaoErrorResponse).error) {
    const err = data as PathaoErrorResponse
    console.error("[pathao/create-parcel]", err)
    return {
      success: false,
      reason: err.message || "Pathao API error",
      detail: err.detail || err.message,
    }
  }

  const parcel = data as PathaoParcelResponse

  return {
    success: true,
    consignmentId: String(parcel.consignment_id),
    trackingCode: parcel.tracking_code || String(parcel.id),
    status: parcel.status || "pending",
    response: parcel,
  }
}

export async function getPathaoStoreId(): Promise<string | null> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "PATHAO" },
  })
  if (!setting) return null

  let creds = { storeId: "" }
  if (setting.credentialsJson) {
    try {
      const decrypted = decrypt(setting.credentialsJson, "courier")
      creds = JSON.parse(decrypted)
    } catch {}
  }
  return creds.storeId || process.env.PATHAO_STORE_ID || null
}