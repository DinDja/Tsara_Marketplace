"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Minus, Plus, Trash2, ShoppingCart,
  CreditCard, Truck, Shield, Tag, MapPin,
  Search, Loader2, Clock, Home,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useCart } from "@/lib/contexts/cart-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { getAddresses, createAddress, createOrder, updateOrder } from "@/lib/services"
import { getProductById } from "@/lib/services/products"
import { createInfinitePayCheckout } from "@/lib/services/infinitePay"
import { lookupCep, calculateShipping } from "@/lib/services/shipping"
import { getCouponByCode } from "@/lib/services"
import { toast } from "sonner"
import type { CepResult, FreightOption } from "@/lib/services/shipping"
import type { CartItem, Coupon, Product, UserAddress } from "@/lib/types"

function isPurchasable(product: Product) {
  if (product.status === "inactive" || product.priceOnRequest) return false
  if (product.price <= 0) return false
  if (product.stockManaged === false) return true
  return product.stock > 0
}

function isDigitalItem(item: CartItem) {
  return item.category === "Cursos"
}

export default function CarrinhoPage() {
  const { user } = useAuth()
  const { items, removeItem, updateQuantity, itemCount, subtotal, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [cepSearched, setCepSearched] = useState(false)
  const [cepResult, setCepResult] = useState<CepResult | null>(null)
  const [freightOptions, setFreightOptions] = useState<FreightOption[]>([])
  const [selectedFreight, setSelectedFreight] = useState<FreightOption | null>(null)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      getAddresses(user.id).then(setAddresses)
    }
  }, [user])

  const discount = appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0
  const allDigital = items.length > 0 && items.every(isDigitalItem)
  const shipping = allDigital ? 0 : (selectedFreight?.price ?? 0)
  const total = subtotal - discount + shipping

  const handleAddressSelect = (addrId: string) => {
    const addr = addresses.find((a) => a.id === addrId)
    if (!addr) return
    setSelectedAddress(addr)
    const clean = addr.cep.replace(/\D/g, "")
    if (clean.length !== 8) return
    setCepLoading(true)
    setSelectedFreight(null)
    setFreightOptions([])
    setCepSearched(true)
    setCep(clean)
    lookupCep(clean).then((result) => {
      if (!result) { setCepLoading(false); return }
      setCepResult(result)
      const options = calculateShipping(clean, itemCount)
      const hasFreeShipping = items.some((i) => i.freeShipping)
      if (hasFreeShipping || subtotal > 200) {
        options.unshift({ name: "Frete Grátis", price: 0, days: options[0]?.days ?? 10 })
      }
      setFreightOptions(options)
      setCepLoading(false)
    })
  }

  const [cep, setCep] = useState("")
  const [cepLoading, setCepLoading] = useState(false)

  const handleLookupCep = async () => {
    const clean = cep.replace(/\D/g, "")
    if (clean.length !== 8) { toast.error("CEP inválido"); return }
    setCepLoading(true)
    setSelectedFreight(null)
    setFreightOptions([])
    setCepSearched(true)
    const result = await lookupCep(cep)
    if (!result) { toast.error("CEP não encontrado"); setCepLoading(false); return }
    setCepResult(result)
    const options = calculateShipping(cep, itemCount)
    const hasFreeShipping = items.some((i) => i.freeShipping)
    if (hasFreeShipping || subtotal > 200) {
      options.unshift({ name: "Frete Grátis", price: 0, days: options[0]?.days ?? 10 })
    }
    setFreightOptions(options)
    setCepLoading(false)
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Digite um código"); return }
    setCouponLoading(true)
    try {
      const coupon = await getCouponByCode(couponCode)
      if (!coupon) { toast.error("Cupom inválido"); setCouponLoading(false); return }
      if (!coupon.active) { toast.error("Cupom inativo"); setCouponLoading(false); return }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) { toast.error("Cupom expirado"); setCouponLoading(false); return }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) { toast.error("Cupom esgotado"); setCouponLoading(false); return }
      if (coupon.minPurchase && subtotal < coupon.minPurchase) { toast.error(`Valor mínimo: R$ ${coupon.minPurchase.toFixed(2).replace(".", ",")}`); setCouponLoading(false); return }
      setAppliedCoupon(coupon)
      toast.success(`Cupom aplicado! ${coupon.discount}% de desconto`)
    } catch { toast.error("Erro ao validar cupom") }
    finally { setCouponLoading(false) }
  }

  const buildAddressString = (addr: UserAddress) =>
    `${addr.street}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ""}, ${addr.neighborhood}, ${addr.city} - ${addr.state}, CEP ${addr.cep}`

  const handleCheckout = async () => {
    if (!user) { toast.error("Faça login para finalizar o pedido"); return }
    if (!allDigital && !selectedAddress) { toast.error("Selecione um endereço de entrega"); return }
    if (!allDigital && !selectedFreight) { toast.error("Selecione o frete"); return }

    setSubmitting(true)
    try {
      const stockChecks = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.productId)
          return { item, product }
        })
      )
      const outOfStock = stockChecks.filter(({ item, product }) =>
        !product || !isPurchasable(product)
      )
      const exceedsStock = stockChecks.filter(({ item, product }) =>
        product && item.quantity > product.stock
      )
      if (outOfStock.length > 0) {
        toast.error(`${outOfStock.map(({ item }) => item.name).join(", ")} ${outOfStock.length === 1 ? "está indisponível" : "estão indisponíveis"} para compra`)
        setSubmitting(false); return
      }
      if (exceedsStock.length > 0) {
        toast.error(`Quantidade indisponível: ${exceedsStock.map(({ item, product }) => `${item.name} (máx: ${product!.stock})`).join(", ")}`)
        setSubmitting(false); return
      }
      const payload: Record<string, any> = {
        clientId: user.id,
        client: user.name,
        items: items.map((i) => ({ ...i })),
        total,
        subtotal,
        discount,
        shipping,
        coupon: appliedCoupon?.code,
        shippingAddress: allDigital ? undefined : buildAddressString(selectedAddress!),
        paymentMethod: "InfinitePay",
        status: "pending",
      }
      Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })

      const checkoutItems = items.map((i) => ({
        description: i.name,
        quantity: i.quantity,
        price: Math.round(i.price * 100),
      }))

      const subtotalCents = Math.round(subtotal * 100)
      const shippingCents = Math.round(shipping * 100)
      const discountCents = Math.round(discount * 100)

      const order = await createOrder(payload as any)
      clearCart()

      const phoneNumber = user.phone?.replace(/\D/g, "") || ""

      const checkoutResult = await createInfinitePayCheckout({
        items: checkoutItems,
        orderNsu: order.id,
        redirectUrl: `${window.location.origin}/pagamento/sucesso`,
        subtotalCents,
        shippingCents,
        discountCents,
        cardType: "credit",
        customer: {
          name: user.name,
          email: user.email,
          ...((phoneNumber) && { phone_number: phoneNumber }),
        },
        address: allDigital
            ? { cep: "01001000", number: "0", complement: "" }
            : {
                cep: selectedAddress!.cep.replace(/\D/g, ""),
                number: selectedAddress!.number,
                complement: selectedAddress!.complement || "",
              },
      })

      await updateOrder(order.id, {
        checkoutUrl: checkoutResult.url,
        orderNsu: order.id,
      })

      window.location.href = checkoutResult.url
    } catch (err: any) {
      const code = err?.code || ""
      toast.error(`Erro ao finalizar pedido (${code || err.message || "desconhecido"})`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = (productId: string, name: string) => {
    removeItem(productId)
    toast.success(`${name} removido do carrinho`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /><span className="font-sans text-sm">Continuar comprando</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <MoonIcon className="w-6 h-6 text-primary" /><span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
          Seu Carrinho {itemCount > 0 && `(${itemCount} ${itemCount === 1 ? "item" : "itens"})`}
        </motion.h1>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary/50 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Carrinho vazio</h2>
            <p className="text-muted-foreground font-sans mb-8">Descubra nossos produtos místicos e encontre o que seu espírito precisa.</p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/#produtos">Explorar Produtos</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div key={item.productId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.1 }} className="bg-card border border-border rounded-xl p-4 lg:p-6">
                    <div className="flex gap-4 lg:gap-6">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="text-4xl text-primary/30">✧</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-sans text-primary uppercase tracking-wider">{item.category}</span>
                            <h3 className="text-lg font-semibold text-foreground mt-1">{item.name}</h3>
                            {item.status === "inactive" || (item.stock !== undefined && item.stock <= 0) ? (
                              <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-500">Esgotado</span>
                            ) : item.stock !== undefined && item.stock <= 5 ? (
                              <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500">Acabando ({item.stock} un.)</span>
                            ) : null}
                            {item.stock !== undefined && item.quantity > item.stock && (
                              <p className="text-[10px] font-sans text-red-500 mt-1">Disponível: {item.stock} un. — reduza a quantidade</p>
                            )}
                          </div>
                          <button onClick={() => handleRemove(item.productId, item.name)} className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.productId, -1)} disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center font-sans font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, 1)} disabled={item.stock !== undefined && item.quantity >= item.stock}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"><Plus className="w-4 h-4" /></button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</p>
                            {item.quantity > 1 && <p className="text-xs font-sans text-muted-foreground">R$ {item.price.toFixed(2).replace(".", ",")} cada</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" /><span className="font-semibold text-foreground">Cupom de desconto</span>
                </div>
                <div className="flex gap-3">
                  <Input placeholder="Digite seu cupom" value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="font-sans bg-input/50 uppercase" disabled={!!appliedCoupon} />
                  <Button onClick={applyCoupon} variant="outline" disabled={!!appliedCoupon || couponLoading} className="shrink-0">
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : appliedCoupon ? "Aplicado" : "Aplicar"}
                  </Button>
                </div>
                {appliedCoupon && <p className="text-sm font-sans text-green-500 mt-2">Cupom {appliedCoupon.code} — {appliedCoupon.discount}% de desconto</p>}
              </div>

              {!allDigital && (
              <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary" /><span className="font-semibold text-foreground">Calcular Frete</span>
                </div>
                <div className="flex gap-3">
                  <Input placeholder="Digite seu CEP" value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="font-sans bg-input/50 max-w-[180px]" maxLength={8} />
                  <Button onClick={handleLookupCep} disabled={cepLoading || cep.length !== 8} className="shrink-0 gap-2">
                    {cepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {cepLoading ? "Buscando..." : "Calcular"}
                  </Button>
                </div>
                {cepResult && (
                  <div className="mt-3 text-sm font-sans text-muted-foreground">
                    <p>{cepResult.logradouro}, {cepResult.bairro}</p>
                    <p>{cepResult.cidade} - {cepResult.estado}</p>
                  </div>
                )}
                {freightOptions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-sans text-muted-foreground mb-2">Opções de frete:</p>
                    {freightOptions.map((option) => (
                      <button key={option.name}
                        onClick={() => setSelectedFreight(option)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedFreight?.name === option.name
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50 bg-card"
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFreight?.name === option.name ? "border-primary" : "border-muted-foreground"}`}>
                            {selectedFreight?.name === option.name && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{option.name}</p>
                            <p className="text-xs font-sans text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {option.days} {option.days === 1 ? "dia útil" : "dias úteis"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${option.price === 0 ? "text-green-500" : "text-foreground"}`}>
                          {option.price === 0 ? "Grátis" : `R$ ${option.price.toFixed(2).replace(".", ",")}`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            </div>

            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-xl p-6 sticky top-24 space-y-6">

                {user && !allDigital && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Endereço de Entrega
                    </h3>
                    {addresses.length > 0 ? (
                      <div className="space-y-2">
                        <Select value={selectedAddress?.id ?? ""} onValueChange={handleAddressSelect}>
                          <SelectTrigger className="font-sans">
                            <SelectValue placeholder="Selecione um endereço" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((addr) => (
                              <SelectItem key={addr.id} value={addr.id}>
                                <span className="flex items-center gap-2">
                                  <Home className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{addr.nickname || `${addr.street}, ${addr.number}`}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedAddress && (
                          <p className="text-xs font-sans text-muted-foreground">
                            {selectedAddress.street}, {selectedAddress.number}
                            {selectedAddress.complement && ` - ${selectedAddress.complement}`}
                            <br />{selectedAddress.neighborhood}, {selectedAddress.city} - {selectedAddress.state}
                            <br />CEP: {selectedAddress.cep}
                          </p>
                        )}
                        <NewAddressDialog uid={user.id} onRefresh={() => getAddresses(user.id).then(setAddresses)} />
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm font-sans text-muted-foreground mb-3">Nenhum endereço cadastrado</p>
                        <NewAddressDialog uid={user.id} onRefresh={() => getAddresses(user.id).then(setAddresses)} />
                      </div>
                    )}
                  </div>
                )}

                {allDigital && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <Shield className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm font-sans text-foreground">
                      Este pedido contém apenas cursos — você receberá o acesso digital imediatamente, sem necessidade de endereço de entrega.
                    </p>
                  </div>
                )}

                <Separator />

                <h2 className="text-xl font-bold text-foreground">Resumo do Pedido</h2>
                <div className="space-y-4 font-sans">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({itemCount} itens)</span><span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-500">
                      <span>Desconto ({appliedCoupon.discount}%)</span><span>-R$ {discount.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span>{allDigital ? <span className="text-green-500">Não se aplica</span>
                      : !cepSearched ? <span className="text-muted-foreground">—</span>
                      : selectedFreight?.price === 0 ? <span className="text-green-500">Grátis</span>
                      : selectedFreight ? `R$ ${shipping.toFixed(2).replace(".", ",")}`
                      : <span className="text-muted-foreground">Selecione</span>}</span>
                  </div>
                  {!allDigital && !selectedFreight && (
                    <p className="text-xs text-muted-foreground">
                      {cepSearched ? "Selecione uma opção de frete" : "Calcule o frete informando seu CEP"}
                    </p>
                  )}
                  {!allDigital && (items.some((i) => i.freeShipping) || subtotal > 200) && <p className="text-xs text-green-500">Frete grátis disponível para este pedido!</p>}
                  <Separator className="my-4" />
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span><span className="text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">ou 3x de R$ {(total / 3).toFixed(2).replace(".", ",")} sem juros</p>
                </div>

                <Button onClick={handleCheckout} disabled={submitting}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium text-base shadow-lg shadow-primary/20">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                  {submitting ? "Processando..." : "Finalizar Compra"}
                </Button>

                <div className="space-y-3">
                  {allDigital ? (
                    <div className="flex items-center gap-3 text-sm font-sans text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary" /><span>Acesso digital imediato após o pagamento</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm font-sans text-muted-foreground">
                      <Truck className="w-4 h-4 text-primary" /><span>Entrega em todo Brasil</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm font-sans text-muted-foreground">
                    <Shield className="w-4 h-4 text-primary" /><span>Pagamento 100% seguro</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── New Address Dialog ─────────────────────────────────

function NewAddressDialog({ uid, onRefresh }: { uid: string; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nickname: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" })

  const handleCepBlur = async () => {
    const clean = form.cep.replace(/\D/g, "")
    if (clean.length !== 8) return
    const result = await lookupCep(form.cep)
    if (!result) return
    setForm((f) => ({ ...f, street: result.logradouro, neighborhood: result.bairro, city: result.cidade, state: result.estado }))
  }

  const handleSave = async () => {
    if (!form.nickname || !form.cep || !form.street || !form.number || !form.city || !form.state) {
      toast.error("Preencha os campos obrigatórios"); return
    }
    setSaving(true)
    try {
      await createAddress(uid, { ...form, isDefault: false })
      toast.success("Endereço salvo!"); setOpen(false); onRefresh()
      setForm({ nickname: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" })
    } catch { toast.error("Erro ao salvar") }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full font-sans gap-1.5"><Plus className="w-4 h-4" /> Novo endereço</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Endereço</DialogTitle>
          <DialogDescription className="font-sans">Preencha os dados do seu endereço de entrega</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-sans text-sm">Apelido *</Label>
            <Input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="Ex: Minha Casa" className="font-sans bg-input/50" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">CEP *</Label>
            <Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value.replace(/\D/g, "").slice(0, 8) })}
              onBlur={handleCepBlur} placeholder="00000000" maxLength={8} className="font-sans bg-input/50" />
            <p className="text-xs font-sans text-muted-foreground">O endereço é preenchido automaticamente ao sair do campo</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label className="font-sans text-sm">Logradouro *</Label>
              <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="font-sans bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-sm">Número *</Label>
              <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="font-sans bg-input/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">Complemento</Label>
            <Input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} placeholder="Apto, Bloco, etc." className="font-sans bg-input/50" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">Bairro</Label>
            <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="font-sans bg-input/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-sans text-sm">Cidade *</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="font-sans bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-sm">Estado *</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} maxLength={2} placeholder="UF" className="font-sans bg-input/50 uppercase" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 font-sans">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 font-sans gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
