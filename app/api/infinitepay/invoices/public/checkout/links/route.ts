import { NextRequest, NextResponse } from "next/server"
import { INFINITEPAY_API_BASE, INFINITEPAY_CHECKOUT_PATH, getHandle } from "@/lib/infinitePay/config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, orderNsu, customer, address, redirectUrl, subtotalCents, shippingCents, discountCents, cardType } = body

    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: "Items são obrigatórios" }, { status: 400 })
    }
    if (!orderNsu) {
      return NextResponse.json({ error: "orderNsu é obrigatório" }, { status: 400 })
    }

    const handle = getHandle()
    const origin = request.nextUrl.origin
    const redirect = redirectUrl || `${origin}/pagamento/sucesso`

    const apiItems: Array<{ description: string; quantity: number; price: number }> = []
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      const description = typeof it?.description === "string" ? it.description.trim() : ""
      const quantity = Number(it?.quantity)
      const price = Number(it?.price)
      if (!description) {
        return NextResponse.json({ error: `Item ${i + 1}: descrição obrigatória` }, { status: 400 })
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ error: `Item ${i + 1}: quantidade inválida` }, { status: 400 })
      }
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: `Item ${i + 1}: preço inválido` }, { status: 400 })
      }
      apiItems.push({
        description,
        quantity,
        price: Math.max(100, Math.round(price)),
      })
    }

    const shipping = Number(shippingCents) || 0
    const discount = Number(discountCents) || 0
    const hasShipping = shipping > 0
    const hasDiscount = discount > 0

    if (hasShipping) {
      apiItems.push({
        description: "Frete",
        quantity: 1,
        price: shipping,
      })
    }

    if (hasDiscount) {
      const totalItemsCents = apiItems.reduce((s: number, it: any) => s + it.price * it.quantity, 0)
      if (totalItemsCents > 0) {
        const ratio = Math.max(0, (totalItemsCents - discount) / totalItemsCents)
        for (const item of apiItems) {
          item.price = Math.max(100, Math.round(item.price * ratio))
        }
      }
    }

    const zeroPriceItem = apiItems.find((it: any) => it.price <= 99)
    if (zeroPriceItem) {
      return NextResponse.json({ error: "Item com preço inválido após ajustes" }, { status: 400 })
    }

    const payload: Record<string, any> = {
      handle,
      redirect_url: redirect,
      webhook_url: `${origin}/api/infinitepay/webhook`,
      order_nsu: orderNsu,
      items: apiItems,
    }
    if (customer) {
      const clean: Record<string, string> = {}
      if (customer.name) clean.name = customer.name
      if (customer.email) clean.email = customer.email
      if (customer.phone_number) clean.phone_number = customer.phone_number
      if (Object.keys(clean).length > 0) payload.customer = clean
    }
    if (address) payload.address = address
    if (cardType && payload.customer) {
      payload.customer.card_type = cardType
    }

    console.log("[InfinitePay/links] payload items:", apiItems.length, "shipping:", hasShipping, "discount:", hasDiscount)

    const res = await fetch(`${INFINITEPAY_API_BASE}${INFINITEPAY_CHECKOUT_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    console.log("[InfinitePay/links] response status:", res.status)

    if (!res.ok) throw new Error(data?.message || data?.error || "Erro ao criar link de pagamento")

    let checkoutUrl = data.url

    const urlObj = new URL(checkoutUrl)
    if (customer) {
      if (customer.name) urlObj.searchParams.set("name", customer.name)
      if (customer.email) urlObj.searchParams.set("email", customer.email)
      if (customer.phone_number) urlObj.searchParams.set("phone", customer.phone_number)
    }
    if (address) {
      if (address.cep) urlObj.searchParams.set("cep", address.cep)
      if (address.number) urlObj.searchParams.set("number", address.number)
      if (address.complement) urlObj.searchParams.set("complement", address.complement)
    }
    if (cardType) urlObj.searchParams.set("card_type", cardType)
    checkoutUrl = urlObj.toString()

    return NextResponse.json({ url: checkoutUrl, slug: data.slug || null })
  } catch (err: any) {
    console.error("[InfinitePay/links]", err)
    const msg = err?.message || "Erro interno ao criar checkout"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
