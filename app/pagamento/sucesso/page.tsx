"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Loader2, ArrowLeft, CreditCard, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"

type PaymentState = "verifying" | "success" | "error" | "not-found"

const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 2500

export default function PagamentoSucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Carregando...</h1>
        </div>
      </div>
    }>
      <PagamentoSucessoContent />
    </Suspense>
  )
}

function PagamentoSucessoContent() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<PaymentState>("verifying")
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [attempt, setAttempt] = useState(1)

  useEffect(() => {
    const orderNsu = searchParams.get("order_nsu")
    const slug = searchParams.get("slug")
    const transactionNsu = searchParams.get("transaction_nsu")
    const captureMethod = searchParams.get("capture_method")

    if (!orderNsu || !slug || !transactionNsu) {
      setState("not-found")
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const verify = async (attemptNumber: number) => {
      try {
        const res = await fetch("/api/infinitepay/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNsu, transactionNsu, slug, captureMethod }),
        })
        const result = await res.json()

        if (cancelled) return

        if (res.ok && result.paid) {
          setPaymentInfo({
            paid: true,
            paid_amount: result.paidAmount,
            captureMethod,
            orderId: result.orderId,
            digital: result.digital,
          })
          setState("success")
          return
        }

        // Falha recuperável: a InfinitePay pode ainda não ter registrado o pagamento,
        // ou houve um erro de rede transitório. Tentamos novamente antes de desistir.
        if (attemptNumber < MAX_ATTEMPTS) {
          setState("verifying")
          setAttempt(attemptNumber + 1)
          timer = setTimeout(() => verify(attemptNumber + 1), RETRY_DELAY_MS)
          return
        }

        setState("error")
        setErrorMsg(result.error || "Pagamento não foi aprovado. Entre em contato conosco.")
      } catch (err: any) {
        if (cancelled) return
        if (attemptNumber < MAX_ATTEMPTS) {
          setState("verifying")
          setAttempt(attemptNumber + 1)
          timer = setTimeout(() => verify(attemptNumber + 1), RETRY_DELAY_MS)
          return
        }
        setState("error")
        setErrorMsg(err.message || "Erro ao verificar pagamento")
      }
    }

    verify(1)

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {state === "verifying" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verificando Pagamento</h1>
            <p className="text-muted-foreground font-sans">
              Aguarde enquanto confirmamos seu pagamento{attempt > 1 ? ` (tentativa ${attempt} de ${MAX_ATTEMPTS})` : "..."}.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Pagamento Confirmado!</h1>
            <p className="text-muted-foreground font-sans mb-6">
              {paymentInfo?.digital
                ? "Seu pagamento foi confirmado e o acesso aos cursos já está liberado na sua conta."
                : "Seu pedido foi pago com sucesso e já está sendo processado."}
            </p>
            {paymentInfo && (
              <div className="bg-card border border-border rounded-xl p-4 text-left text-sm font-sans space-y-2 mb-8">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Valor pago</span>
                  <span className="text-foreground font-bold">
                    R$ {(paymentInfo.paid_amount / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                {paymentInfo.installments > 1 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Parcelas</span>
                    <span className="text-foreground">{paymentInfo.installments}x</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Forma de pagamento</span>
                  <span className="text-foreground flex items-center gap-1">
                    {paymentInfo.captureMethod === "pix" ? (
                      <><Banknote className="w-4 h-4 text-green-500" /> Pix</>
                    ) : (
                      <><CreditCard className="w-4 h-4 text-primary" /> Cartão de Crédito</>
                    )}
                  </span>
                </div>
                {paymentInfo.orderId && (
                  <div className="flex items-center justify-between text-muted-foreground pt-2 border-t border-border">
                    <span>Pedido</span>
                    <span className="text-foreground font-mono">#{paymentInfo.orderId.slice(0, 8)}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {paymentInfo?.digital && (
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/cursos">Acessar meus cursos</Link>
                </Button>
              )}
              <Button asChild variant={paymentInfo?.digital ? "outline" : "default"}
                className={paymentInfo?.digital ? undefined : "bg-primary hover:bg-primary/90"}>
                <Link href="/meus-pedidos">Acompanhar Pedido</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Continuar Comprando</Link>
              </Button>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Pagamento não confirmado</h1>
            <p className="text-muted-foreground font-sans mb-8">
              {errorMsg || "Não foi possível confirmar seu pagamento. Entre em contato conosco."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/meus-pedidos">Ver Meus Pedidos</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/">Ir para o Início</Link>
              </Button>
            </div>
          </>
        )}

        {state === "not-found" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
              <ArrowLeft className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Página não encontrada</h1>
            <p className="text-muted-foreground font-sans mb-8">
              Esta página deve ser acessada após o pagamento no InfinitePay.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/">Ir para o Início</Link>
            </Button>
          </>
        )}
      </motion.div>
    </div>
  )
}
