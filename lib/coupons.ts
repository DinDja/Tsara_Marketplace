import type { Coupon } from "./types"

/**
 * Motor puro de avaliação de cupons — sem dependência de Firebase.
 * Compartilhado entre o carrinho (cliente), o agendamento (cliente)
 * e a rota de confirmação de pagamento (servidor).
 */

export interface CouponItem {
  productId: string
  category: string
  price: number
  quantity: number
}

export type CouponContext =
  | { kind: "products"; items: CouponItem[] }
  | { kind: "appointment"; consultationTypeId?: string; price: number }

export interface CouponEvaluation {
  valid: boolean
  /** Mensagem de erro amigável (pt-BR) quando invalid */
  error?: string
  /** Soma dos itens sobre os quais o desconto incide */
  eligibleSubtotal: number
  /** Valor final do desconto em R$ */
  discountAmount: number
}

export function formatCouponDiscount(coupon: Pick<Coupon, "discount" | "discountType">): string {
  return coupon.discountType === "fixed"
    ? `R$ ${coupon.discount.toFixed(2).replace(".", ",")}`
    : `${coupon.discount}%`
}

/**
 * Resume as condições do cupom em texto curto (usado no admin).
 * Ex: "Loja · Cristais, Velas · 2 produtos"
 */
export function describeCouponConditions(
  coupon: Coupon,
  consultationTypeNames?: Map<string, string>
): string {
  const parts: string[] = []
  const scope = coupon.scope ?? "all"
  if (scope === "products") parts.push("Só loja")
  else if (scope === "appointments") parts.push("Só consultas")
  if (coupon.categories?.length) parts.push(`${coupon.categories.length} categoria(s)`)
  if (coupon.productIds?.length) parts.push(`${coupon.productIds.length} produto(s)`)
  if (coupon.consultationTypeIds?.length) {
    const names = coupon.consultationTypeIds
      .map((id) => consultationTypeNames?.get(id))
      .filter(Boolean)
    parts.push(names.length > 0 ? names.join(", ") : `${coupon.consultationTypeIds.length} consulta(s)`)
  }
  return parts.join(" · ")
}

/** Filtra os itens do carrinho que são elegíveis ao cupom. */
export function getEligibleItems(coupon: Coupon, items: CouponItem[]): CouponItem[] {
  const productIds = coupon.productIds ?? []
  const categories = (coupon.categories ?? []) as string[]
  if (productIds.length === 0 && categories.length === 0) return items
  return items.filter(
    (i) => productIds.includes(i.productId) || categories.includes(i.category)
  )
}

/**
 * Valida o cupom contra o contexto de uso e calcula o desconto.
 * Regras:
 * - scope "products" nunca vale em agendamento; "appointments" nunca vale na loja.
 * - Restrições de produto/categoria limitam os itens elegíveis do carrinho.
 * - Restrições de tipo de consulta limitam os agendamentos elegíveis.
 * - Cupom restrito só a produtos/categorias não vale em agendamento (e vice-versa).
 * - minPurchase é verificado sobre o subtotal elegível.
 * - Desconto fixo nunca excede o subtotal elegível.
 */
export function evaluateCoupon(
  coupon: Coupon | null | undefined,
  ctx: CouponContext,
  now: Date = new Date()
): CouponEvaluation {
  const invalid = (error: string): CouponEvaluation => ({
    valid: false, error, eligibleSubtotal: 0, discountAmount: 0,
  })

  if (!coupon) return invalid("Cupom inválido")
  if (!coupon.active) return invalid("Cupom inativo")
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return invalid("Cupom expirado")
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return invalid("Cupom esgotado")

  const scope = coupon.scope ?? "all"
  const hasProductRestrictions = (coupon.productIds?.length ?? 0) > 0 || (coupon.categories?.length ?? 0) > 0
  const hasConsultRestrictions = (coupon.consultationTypeIds?.length ?? 0) > 0

  let eligibleSubtotal: number

  if (ctx.kind === "products") {
    if (scope === "appointments") return invalid("Este cupom é válido apenas para consultas")
    if (hasConsultRestrictions && !hasProductRestrictions) {
      return invalid("Este cupom é válido apenas para consultas")
    }
    const eligibleItems = getEligibleItems(coupon, ctx.items)
    if (hasProductRestrictions && eligibleItems.length === 0) {
      return invalid(`Este cupom não se aplica aos itens do carrinho`)
    }
    eligibleSubtotal = eligibleItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  } else {
    if (scope === "products") return invalid("Este cupom é válido apenas para produtos da loja")
    if (hasProductRestrictions && !hasConsultRestrictions) {
      return invalid("Este cupom é válido apenas para produtos da loja")
    }
    if (
      hasConsultRestrictions &&
      (!ctx.consultationTypeId || !coupon.consultationTypeIds!.includes(ctx.consultationTypeId))
    ) {
      return invalid("Este cupom não se aplica a este tipo de consulta")
    }
    eligibleSubtotal = ctx.price
  }

  if (coupon.minPurchase && eligibleSubtotal < coupon.minPurchase) {
    return invalid(`Valor mínimo para este cupom: R$ ${coupon.minPurchase.toFixed(2).replace(".", ",")}`)
  }

  const discountAmount = coupon.discountType === "fixed"
    ? Math.min(coupon.discount, eligibleSubtotal)
    : eligibleSubtotal * (coupon.discount / 100)

  return { valid: true, eligibleSubtotal, discountAmount }
}
