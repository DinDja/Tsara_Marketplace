import { NextRequest, NextResponse } from "next/server"
import { INFINITEPAY_API_BASE, INFINITEPAY_PAYMENT_CHECK_PATH, getHandle } from "@/lib/infinitePay/config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderNsu, transactionNsu, slug } = body

    if (!orderNsu || !transactionNsu || !slug) {
      return NextResponse.json(
        { error: "orderNsu, transactionNsu e slug são obrigatórios" },
        { status: 400 }
      )
    }

    const handle = getHandle()
    const res = await fetch(`${INFINITEPAY_API_BASE}${INFINITEPAY_PAYMENT_CHECK_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, order_nsu: orderNsu, transaction_nsu: transactionNsu, slug }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || data?.error || "Erro ao verificar pagamento")

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro interno ao verificar pagamento" }, { status: 500 })
  }
}
