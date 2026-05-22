export const INFINITEPAY_API_BASE = "https://api.checkout.infinitepay.io"
export const INFINITEPAY_CHECKOUT_PATH = "/links"
export const INFINITEPAY_PAYMENT_CHECK_PATH = "/payment_check"

export const INFINITE_PAY_CHECKOUT_LINK_PROXY_PATH = "/api/infinitepay/invoices/public/checkout/links"
export const INFINITE_PAY_PAYMENT_CHECK_PROXY_PATH = "/api/infinitepay/invoices/public/checkout/payment_check"

export const DEFAULT_HANDLE = "andrade-bruno-32p"
export const DEFAULT_DESCRIPTION = "assinatura"
export const DEFAULT_ORDER_PREFIX = "TSARA"

export function getHandle(): string {
  return process.env.INFINITEPAY_HANDLE || DEFAULT_HANDLE
}

export function buildOrderNsu(uid: string): string {
  const token = uid.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase()
  return `${DEFAULT_ORDER_PREFIX}-${token || "anon"}-${Date.now()}`
}
