import type { CartItem } from "@/types"

const CART_KEY = "doshok_cart"

export type StockValidationResult =
  | { ok: true; available: number; capped: number; cappedMessage: string | null }
  | { ok: false; error: string }

export async function validateStock(
  productId: string,
  variantId: string | undefined,
  requestedQty: number
): Promise<StockValidationResult> {
  try {
    const params = new URLSearchParams({ productId, quantity: String(requestedQty) })
    if (variantId) params.set("variantId", variantId)

    const res = await fetch(`/api/stock?${params.toString()}`)
    const data = await res.json()

    if (!data.success) {
      return { ok: false, error: data.error ?? "Stock check failed" }
    }

    return {
      ok: true,
      available: data.data.available,
      capped: data.data.capped,
      cappedMessage: data.data.cappedMessage,
    }
  } catch {
    return { ok: false, error: "Could not verify stock" }
  }
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToCart(item: CartItem) {
  const cart = getCart()
  const index = cart.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  )
  if (index >= 0) {
    cart[index].quantity += item.quantity
  } else {
    cart.push(item)
  }
  setCart(cart)
  return cart
}

export function updateCartQuantity(productId: string, variantId: string | undefined, quantity: number) {
  const cart = getCart()
  const index = cart.findIndex(
    (i) => i.productId === productId && i.variantId === variantId
  )
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1)
    } else {
      cart[index].quantity = quantity
    }
  }
  setCart(cart)
  return cart
}

export function removeFromCart(productId: string, variantId: string | undefined) {
  const cart = getCart()
  const filtered = cart.filter(
    (i) => !(i.productId === productId && i.variantId === variantId)
  )
  setCart(filtered)
  return filtered
}

export function clearCart() {
  setCart([])
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0)
}

export function getCartSubtotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0)
}
