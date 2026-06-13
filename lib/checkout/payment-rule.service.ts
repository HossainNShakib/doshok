export type PaymentRuleType = "cod_only" | "full" | "partial_percent" | "fixed_advance" | "delivery_charge_only"

export type PaymentRuleSource = "landing" | "product" | "global"

export type PaymentRuleInput = {
  grandTotal: number
  finalDeliveryFee: number
  discountedProductTotal: number
  rule: PaymentRuleType
  value?: number | null
}

export type PaymentRuleOutput = {
  paymentRule: PaymentRuleType
  paymentRuleValue: number | null
  payNow: number
  dueAmount: number
}

export type ResolvedPaymentRule = {
  source: PaymentRuleSource
  rule: PaymentRuleType
  value: number | null
}

export function calculatePaymentAmounts(input: PaymentRuleInput): PaymentRuleOutput {
  const { grandTotal, finalDeliveryFee, rule, value } = input

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
  const dueAmount = Math.max(0, grandTotal - payNow)

  return {
    paymentRule: rule,
    paymentRuleValue: value ?? null,
    payNow,
    dueAmount,
  }
}

export function resolvePaymentRuleSource(params: {
  landingOverride?: { enabled: boolean; rule: string | null; value: number | null } | null
  productOverride?: { rule: string | null; value: number | null } | null
  globalDefault: { rule: string; value: number | null }
}): ResolvedPaymentRule {
  const { landingOverride, productOverride, globalDefault } = params

  if (landingOverride?.enabled && landingOverride.rule) {
    return {
      source: "landing",
      rule: landingOverride.rule as PaymentRuleType,
      value: landingOverride.value,
    }
  }

  if (productOverride?.rule) {
    return {
      source: "product",
      rule: productOverride.rule as PaymentRuleType,
      value: productOverride.value,
    }
  }

  return {
    source: "global",
    rule: globalDefault.rule as PaymentRuleType,
    value: globalDefault.value,
  }
}

export function resolvePaymentRule(params: {
  grandTotal: number
  finalDeliveryFee: number
  discountedProductTotal: number
  landingOverride?: { enabled: boolean; rule: string | null; value: number | null } | null
  productOverride?: { rule: string | null; value: number | null } | null
  globalDefault: { rule: string; value: number | null }
}): PaymentRuleOutput & { source: PaymentRuleSource } {
  const resolved = resolvePaymentRuleSource(params)
  const amounts = calculatePaymentAmounts({
    grandTotal: params.grandTotal,
    finalDeliveryFee: params.finalDeliveryFee,
    discountedProductTotal: params.discountedProductTotal,
    rule: resolved.rule,
    value: resolved.value,
  })
  return {
    paymentRule: amounts.paymentRule,
    paymentRuleValue: amounts.paymentRuleValue,
    payNow: amounts.payNow,
    dueAmount: amounts.dueAmount,
    source: resolved.source,
  }
}
