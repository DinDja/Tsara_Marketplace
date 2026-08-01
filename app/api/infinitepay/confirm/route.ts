import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase/admin"
import { INFINITEPAY_API_BASE, INFINITEPAY_PAYMENT_CHECK_PATH, getHandle } from "@/lib/infinitePay/config"

const PAID_STATUSES = ["processing", "shipped", "delivered"]
const DIGITAL_CATEGORY = "Cursos"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderNsu, transactionNsu, slug, captureMethod } = body

    if (!orderNsu || !transactionNsu || !slug) {
      return NextResponse.json({ error: "orderNsu, transactionNsu e slug são obrigatórios" }, { status: 400 })
    }

    // 1. Verifica o pagamento diretamente com a InfinitePay
    const handle = getHandle()
    const res = await fetch(`${INFINITEPAY_API_BASE}${INFINITEPAY_PAYMENT_CHECK_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, order_nsu: orderNsu, transaction_nsu: transactionNsu, slug }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || data?.error || "Erro ao verificar pagamento")

    if (!data.paid) {
      return NextResponse.json({ paid: false, error: "Pagamento não aprovado" })
    }

    // 2. Só o servidor grava status pago
    const db = getAdminDb()
    const orderRef = db.collection("orders").doc(orderNsu)
    const orderSnap = await orderRef.get()
    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }
    const order = orderSnap.data()!

    // Idempotência: se já foi confirmado antes, retorna sucesso sem reprocessar.
    // Garante que estoque/vendas não sejam debitados duas vezes (ex: callback reenviado).
    if (PAID_STATUSES.includes(order.status)) {
      return NextResponse.json({
        paid: true,
        orderId: orderNsu,
        paidAmount: order.paidAmount ?? data.paid_amount,
        alreadyConfirmed: true,
      })
    }
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Pedido não está em estado confirmável" }, { status: 409 })
    }

    // 3. Recalcula o total esperado a partir dos preços reais no Firestore
    //    e valida cada item do pedido contra o produto atual no banco.
    type ItemCheck = { productId: string; quantity: number; price: number; category: string; stockManaged?: boolean }
    const itemChecks: ItemCheck[] = []
    let subtotal = 0

    for (const item of order.items ?? []) {
      const quantity = Number(item.quantity ?? 1)
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ error: "Quantidade inválida no pedido" }, { status: 409 })
      }
      const pSnap = await db.collection("products").doc(item.productId).get()
      if (!pSnap.exists) {
        return NextResponse.json({ error: "Produto não encontrado no pedido" }, { status: 409 })
      }
      const p = pSnap.data()!
      if (p.status !== "active" || p.price <= 0) {
        return NextResponse.json({ error: "Produto indisponível para compra" }, { status: 409 })
      }
      subtotal += (p.price ?? 0) * quantity
      itemChecks.push({
        productId: item.productId,
        quantity,
        price: p.price ?? 0,
        category: p.category,
        stockManaged: p.stockManaged,
      })
    }

    let discount = 0
    if (order.coupon) {
      const cSnap = await db.collection("coupons").where("code", "==", order.coupon.toUpperCase()).get()
      const coupon = cSnap.docs[0]?.data()
      const expiresAt = coupon?.expiresAt?.toMillis?.()
        ?? (coupon?.expiresAt ? Date.parse(String(coupon.expiresAt)) : null)
      const invalid =
        !coupon
        || coupon.active === false
        || (expiresAt != null && expiresAt < Date.now())
        || (coupon.maxUses != null && (coupon.usedCount ?? 0) >= coupon.maxUses)
        || (coupon.minPurchase != null && subtotal < coupon.minPurchase)
      if (invalid) {
        return NextResponse.json({ error: "Cupom inválido no pedido" }, { status: 409 })
      }
      discount = subtotal * (coupon.discount ?? 0) / 100
    }

    const expectedTotalCents = Math.round((subtotal - discount) * 100)
    const paidAmountCents = data.paid_amount ?? 0

    if (paidAmountCents < expectedTotalCents) {
      return NextResponse.json(
        { error: "Valor pago não confere com o pedido", paidAmount: paidAmountCents, expected: expectedTotalCents },
        { status: 409 }
      )
    }

    // 4. Define o status final: pedidos 100% digitais (cursos) ficam "delivered"
    //    para liberar o acesso imediato; demais passam por "processing".
    const allDigital = itemChecks.length > 0 && itemChecks.every((i) => i.category === DIGITAL_CATEGORY)
    const newStatus = allDigital ? "delivered" : "processing"

    // 5. Transação atômica: atualiza o pedido e cada produto (sold/stock).
    //    Protege contra race condition de callbacks concorrentes.
    await db.runTransaction(async (tx) => {
      const freshSnap = await tx.get(orderRef)
      const fresh = freshSnap.data()
      if (fresh && PAID_STATUSES.includes(fresh.status)) {
        return
      }

      tx.update(orderRef, {
        status: newStatus,
        transactionNsu,
        captureMethod: captureMethod ?? null,
        paidAmount: paidAmountCents,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })

      for (const item of itemChecks) {
        const pRef = db.collection("products").doc(item.productId)
        const pSnap = await tx.get(pRef)
        if (!pSnap.exists) continue
        const p = pSnap.data()!
        const sold = (p.sold ?? 0) + item.quantity
        const stock = p.stockManaged === false
          ? (p.stock ?? 0)
          : Math.max(0, (p.stock ?? 0) - item.quantity)
        tx.update(pRef, { sold, stock, updatedAt: new Date() })
      }
    })

    return NextResponse.json({
      paid: true,
      orderId: orderNsu,
      paidAmount: paidAmountCents,
      status: newStatus,
      digital: allDigital,
    })
  } catch (err: any) {
    const msg = err?.message || "Erro interno ao confirmar pagamento"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
