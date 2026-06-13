export type PaymentRuleType = "cod_only" | "full" | "partial_percent" | "fixed_advance" | "delivery_charge_only"

export function calculatePaymentAmounts(grandTotal: number, finalDeliveryFee: number, rule: PaymentRuleType, value?: number | null): { payNow: number; dueAmount: number } {
  let payNow: number
  switch (rule) {
    case "cod_only":
      payNow = 0
      break
    case "full":
      payNow = grandTotal
      break
    case "partial_percent": {
      const pct = value ?? 0
      payNow = Math.round(grandTotal * pct / 100)
      break
    }
    case "fixed_advance": {
      const fixed = value ?? 0
      payNow = Math.min(fixed, grandTotal)
      break
    }
    case "delivery_charge_only":
      payNow = finalDeliveryFee
      break
    default:
      payNow = 0
  }
  payNow = Math.max(0, Math.min(payNow, grandTotal))
  return { payNow, dueAmount: Math.max(0, grandTotal - payNow) }
}
