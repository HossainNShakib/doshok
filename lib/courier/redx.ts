import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import type {
  RedxCredentials,
  RedxValidationResult,
  RedxParcelPayload,
  RedxParcelResponse,
  RedxErrorResponse,
  ParcelCreateResult,
} from "./types"

const SANDBOX_BASE = "https://sandbox.redx.com.bd"
const LIVE_BASE = "https://api.redx.com.bd"

export type OrderForRedx = {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  total: number
  paidAmount: number
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

async function loadRedxCredentials(
  mode: "SANDBOX" | "LIVE"
): Promise<RedxCredentials | null> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "REDX" },
  })

  if (!setting || !setting.enabled) return null
  if (setting.mode !== mode) return null

  let creds: RedxCredentials = {
    apiToken: "",
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

  const apiToken = creds.apiToken || process.env.REDX_API_TOKEN || ""
  const storeId = creds.storeId || process.env.REDX_STORE_ID || ""
  const baseUrl = creds.baseUrl || (mode === "SANDBOX" ? SANDBOX_BASE : LIVE_BASE)

  return { apiToken, storeId, baseUrl }
}

export async function getRedxMode(): Promise<"SANDBOX" | "LIVE"> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "REDX" },
  })
  return (setting?.mode as "SANDBOX" | "LIVE") || "SANDBOX"
}

export async function isRedxEnabled(): Promise<boolean> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "REDX" },
  })
  return setting?.enabled ?? false
}

export async function validateRedxCredentials(): Promise<RedxValidationResult> {
  const setting = await prisma.courierProviderSetting.findUnique({
    where: { provider: "REDX" },
  })

  if (!setting) return { valid: false, reason: "not_configured" }
  if (!setting.enabled) return { valid: false, reason: "not_enabled" }

  let creds: RedxCredentials = {
    apiToken: "",
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

  const apiToken = creds.apiToken || process.env.REDX_API_TOKEN || ""
  const storeId = creds.storeId || process.env.REDX_STORE_ID || ""

  if (!apiToken) {
    return { valid: false, reason: "missing_credentials" }
  }

  if (!storeId) {
    return { valid: false, reason: "missing_store_id" }
  }

  return { valid: true, mode: setting.mode as "SANDBOX" | "LIVE", storeId }
}

export async function mapOrderToRedxPayload(
  order: OrderForRedx,
  storeId: string
): Promise<RedxParcelPayload> {
  const codAmount = order.total - order.paidAmount
  const amountToCollect = order.paymentStatus.toLowerCase() === "paid" ? 0 : codAmount

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
    merchant_order_id: order.orderNumber,
    recipient_name: order.customerName,
    recipient_phone: order.customerPhone,
    recipient_address: fullAddress,
    cod_amount: amountToCollect,
    note: order.paymentMethod.toLowerCase() === "cod"
      ? "COD - Please collect payment upon delivery"
      : "Prepaid order",
    store_id: storeId,
  }
}

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.length >= 11 && cleaned.length <= 15
}

function validateAddress(address: string): boolean {
  return address.trim().length >= 5
}

function validateAmount(amount: number): boolean {
  return amount >= 0
}

export async function createRedxParcel(
  order: OrderForRedx
): Promise<ParcelCreateResult> {
  const mode = await getRedxMode()
  const creds = await loadRedxCredentials(mode)

  if (!creds) {
    return {
      success: false,
      reason: "RedX credentials not available",
      detail: "Please check RedX courier settings.",
    }
  }

  const payload = await mapOrderToRedxPayload(order, creds.storeId)

  if (!validatePhone(payload.recipient_phone)) {
    return {
      success: false,
      reason: "Invalid phone number",
      detail: "Phone must be 11-15 digits. Received: " + payload.recipient_phone,
    }
  }

  if (!validateAddress(payload.recipient_address)) {
    return {
      success: false,
      reason: "Invalid address",
      detail: "Address must be at least 5 characters.",
    }
  }

  if (!validateAmount(payload.cod_amount)) {
    return {
      success: false,
      reason: "Invalid COD amount",
      detail: "COD amount must be non-negative.",
    }
  }

  const res = await fetch(`${creds.baseUrl}/v1.0.0/parcels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${creds.apiToken}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    const err = data as RedxErrorResponse
    console.error("[redx/create-parcel]", err)
    return {
      success: false,
      reason: err.message || "RedX API error",
      detail: err.message,
    }
  }

  const parcel = data as RedxParcelResponse

  if (parcel.status === "ERROR" || !parcel.tracking_code) {
    console.error("[redx/create-parcel]", parcel)
    return {
      success: false,
      reason: parcel.message || "RedX parcel creation failed",
      detail: parcel.message,
    }
  }

  return {
    success: true,
    consignmentId: String(parcel.id),
    trackingCode: parcel.tracking_code,
    status: parcel.status || "PENDING",
    response: parcel,
  }
}