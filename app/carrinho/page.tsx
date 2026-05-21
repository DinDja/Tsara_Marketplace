"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  Tag,
  MapPin,
  Search,
  Loader2,
  Clock,
} from "lucide-react";
import { MoonIcon } from "@/components/moon-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/contexts/cart-context";
import { lookupCep, calculateShipping } from "@/lib/services/shipping";
import { getCouponByCode } from "@/lib/services";
import { toast } from "sonner";
import type { CepResult, FreightOption } from "@/lib/services/shipping";
import type { Coupon } from "@/lib/types";

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, itemCount, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepSearched, setCepSearched] = useState(false);
  const [cepResult, setCepResult] = useState<CepResult | null>(null);
  const [freightOptions, setFreightOptions] = useState<FreightOption[]>([]);
  const [selectedFreight, setSelectedFreight] = useState<FreightOption | null>(null);

  const discount = appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0;
  const shipping = selectedFreight?.price ?? 0;
  const total = subtotal - discount + shipping;

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
    if (subtotal > 200) {
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
  };

  const handleCheckout = () => {
    toast.success("Pedido realizado com sucesso!", {
      description: "Em breve enviaremos os detalhes por e-mail.",
    });
  };

  const handleRemove = (productId: string, name: string) => {
    removeItem(productId);
    toast.success(`${name} removido do carrinho`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-sans text-sm">Continuar comprando</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <MoonIcon className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl lg:text-4xl font-bold text-foreground mb-8"
        >
          Seu Carrinho {itemCount > 0 && `(${itemCount} ${itemCount === 1 ? "item" : "itens"})`}
        </motion.h1>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary/50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Carrinho vazio
            </h2>
            <p className="text-muted-foreground font-sans mb-8">
              Descubra nossos produtos místicos e encontre o que seu espírito precisa.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/#produtos">Explorar Produtos</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl p-4 lg:p-6"
                  >
                    <div className="flex gap-4 lg:gap-6">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-4xl text-primary/30">✧</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-sans text-primary uppercase tracking-wider">
                              {item.category}
                            </span>
                            <h3 className="text-lg font-semibold text-foreground mt-1">
                              {item.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => handleRemove(item.productId, item.name)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors cursor-pointer"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-sans font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs font-sans text-muted-foreground">
                                R$ {item.price.toFixed(2).replace(".", ",")} cada
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">Cupom de desconto</span>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Digite seu cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="font-sans bg-input/50 uppercase"
                    disabled={!!appliedCoupon}
                  />
                  <Button
                    onClick={applyCoupon}
                    variant="outline"
                    disabled={!!appliedCoupon || couponLoading}
                    className="shrink-0"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : appliedCoupon ? "Aplicado" : "Aplicar"}
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="text-sm font-sans text-green-500 mt-2">
                    Cupom {appliedCoupon.code} — {appliedCoupon.discount}% de desconto
                  </p>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">Calcular Frete</span>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Digite seu CEP"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="font-sans bg-input/50 max-w-[180px]"
                    maxLength={8}
                  />
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
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedFreight?.name === option.name ? "border-primary" : "border-muted-foreground"
                          }`}>
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
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-xl p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-foreground mb-6">Resumo do Pedido</h2>
                <div className="space-y-4 font-sans">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({itemCount} itens)</span>
                    <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-500">
                      <span>Desconto ({appliedCoupon.discount}%)</span>
                      <span>-R$ {discount.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span>
                      {!cepSearched ? (
                        <span className="text-muted-foreground">—</span>
                      ) : selectedFreight?.price === 0 ? (
                        <span className="text-green-500">Grátis</span>
                      ) : selectedFreight ? (
                        `R$ ${shipping.toFixed(2).replace(".", ",")}`
                      ) : (
                        <span className="text-muted-foreground">Selecione</span>
                      )}
                    </span>
                  </div>
                  {!selectedFreight && (
                    <p className="text-xs text-muted-foreground">
                      {cepSearched ? "Selecione uma opção de frete" : "Calcule o frete informando seu CEP"}
                    </p>
                  )}
                  {subtotal > 200 && (
                    <p className="text-xs text-green-500">Frete grátis disponível para este pedido!</p>
                  )}
                  <Separator className="my-4" />
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ou 3x de R$ {(total / 3).toFixed(2).replace(".", ",")} sem juros
                  </p>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full mt-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium text-base shadow-lg shadow-primary/20"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Finalizar Compra
                </Button>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm font-sans text-muted-foreground">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Entrega em todo Brasil</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-sans text-muted-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}