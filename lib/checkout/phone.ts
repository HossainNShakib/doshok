const OPERATOR_PATTERN = /^1[3-9]\d{8}$/

function stripNonDigits(input: string): string {
  return input.replace(/\D/g, "")
}

function extractLocalDigits(input: string): string {
  const digits = stripNonDigits(input)

  if (digits.length === 13 && digits.startsWith("880")) {
    return digits.slice(3)
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1)
  }

  if (digits.length === 10) {
    return digits
  }

  throw new Error("Invalid Bangladeshi phone number")
}

export function normalizePhoneToE164(input: string): string {
  const local = extractLocalDigits(input)

  if (!OPERATOR_PATTERN.test(local)) {
    throw new Error("Invalid Bangladeshi phone number")
  }

  return `+880${local}`
}

export function isValidBdPhone(input: string): boolean {
  try {
    normalizePhoneToE164(input)
    return true
  } catch {
    return false
  }
}

export function assertValidBdPhone(input: string): string {
  return normalizePhoneToE164(input)
}
