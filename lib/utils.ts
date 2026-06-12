import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BANGLADESH_COUNTRY_CODE = "+880"

export function isValidBangladeshPhone(localNumber: string): boolean {
  const digits = localNumber.replace(/\D/g, "")
  return /^(01[3-9])/.test(digits) && digits.length === 10
}

export function toE164(localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "")
  return `${BANGLADESH_COUNTRY_CODE}${digits}`
}

export function maskBangladeshPhone(localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "")
  if (digits.length < 6) return `${BANGLADESH_COUNTRY_CODE}${digits}`
  return `${BANGLADESH_COUNTRY_CODE}${digits.slice(0, 3)}****${digits.slice(-3)}`
}

export function stripCountryCode(input: string): string {
  const digits = input.replace(/\D/g, "")
  if (digits.length === 12 && digits.startsWith("880")) {
    return digits.slice(2)
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits
  }
  return digits
}
