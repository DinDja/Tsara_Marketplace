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
  Sparkles,
  CreditCard,
  Truck,
  Shield,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Cristal Ametista Bruta",
    category: "Cristais",
    price: 89.9,
    quantity: 1,
    image: "/placeholder-crystal.jpg",
  },
  {
    id: 2,
    name: "Kit 7 Velas Energizadas",
    category: "Velas",
    price: 54.9,
    quantity: 2,
    image: "/placeholder-candles.jpg",
  },
  {
    id: 3,
    name: "Baralho Cigano Tradicional",
    category: "Oráculos",
    price: 129.9,
    quantity: 1,
    image: "/placeholder-cards.jpg",
  },
];

export default function CarrinhoPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal > 200 ? 0 : 19.9;
  const total = subtotal - discount + shipping;

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "tsara10") {
      setCouponApplied(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <Sparkles className="w-6 h-6 text-primary" />
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
          Seu Carrinho
        </motion.h1>

        {cartItems.length === 0 ? (
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
              Descubra nossos produtos místicos e encontre o que seu espírito
              precisa.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/#produtos">Explorar Produtos</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl p-4 lg:p-6"
                  >
                    <div className="flex gap-4 lg:gap-6">
                      {/* Product Image */}
                      <div className="w-24 h-24 lg:w-32 lg:h-32 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        <div className="text-4xl text-primary/30">✧</div>
                      </div>

                      {/* Product Details */}
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
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-sans font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
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

              {/* Coupon Code */}
              <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    Cupom de desconto
                  </span>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Digite seu cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="font-sans bg-input/50"
                    disabled={couponApplied}
                  />
                  <Button
                    onClick={applyCoupon}
                    variant="outline"
                    disabled={couponApplied}
                    className="shrink-0"
                  >
                    {couponApplied ? "Aplicado" : "Aplicar"}
                  </Button>
                </div>
                {couponApplied && (
                  <p className="text-sm font-sans text-green-500 mt-2">
                    Cupom TSARA10 aplicado com sucesso! -10%
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-xl p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Resumo do Pedido
                </h2>

                <div className="space-y-4 font-sans">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cartItems.reduce((a, i) => a + i.quantity, 0)} itens)</span>
                    <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-green-500">
                      <span>Desconto (10%)</span>
                      <span>-R$ {discount.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-500">Grátis</span>
                      ) : (
                        `R$ ${shipping.toFixed(2).replace(".", ",")}`
                      )}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Frete grátis em compras acima de R$ 200,00
                    </p>
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

                <Button className="w-full mt-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium text-base shadow-lg shadow-primary/20">
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
