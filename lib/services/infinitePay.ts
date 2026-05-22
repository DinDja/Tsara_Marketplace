interface CheckoutItem {
  description: string
  quantity: number
  price: number
}

interface CheckoutCustomer {
  name: string
  email: string
  phone_number?: string
}

interface CheckoutAddress {
  cep: string
  number: string
  complement?: string
}

interface CreateCheckoutParams {
  items: CheckoutItem[]
  orderNsu: string
  redirectUrl?: string
  subtotalCents?: number
  shippingCents?: number
  discountCents?: number
  customer?: CheckoutCustomer
  address?: CheckoutAddress
  cardType?: string
}

export async function createInfinitePayCheckout(params: CreateCheckoutParams) {
  const res = await fetch("/api/infinitepay/invoices/public/checkout/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Erro ao criar checkout")
  return data as { url: string; slug: string | null }
}

interface VerifyPaymentParams {
  orderNsu: string
  transactionNsu: string
  slug: string
}

export async function verifyInfinitePayPayment(params: VerifyPaymentParams) {
  const res = await fetch("/api/infinitepay/invoices/public/checkout/payment_check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Erro ao verificar pagamento")
  return data as {
    success: boolean
    paid: boolean
    amount: number
    paid_amount: number
    installments: number
    capture_method: string
  }
}
