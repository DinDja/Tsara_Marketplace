"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Clock, Calendar as CalendarIcon, User, Phone,
  Mail, MessageSquare, CheckCircle2, Star, Loader2, Tag,
} from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ptBR } from "date-fns/locale"
import { TIME_SLOTS } from "@/lib/constants"
import { getOccupiedSlots, createAppointment, getConsultationTypes, getCouponByCode } from "@/lib/services"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/lib/contexts/auth-context"
import { toast } from "sonner"
import type { TimeSlot } from "@/lib/types"
import type { ConsultationType } from "@/lib/services/consultations"
import type { Coupon } from "@/lib/types"

export default function AgendamentoPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    getConsultationTypes().then((data) => { setConsultationTypes(data); setLoadingTypes(false) })
  }, [])

  // Auto-fill user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
      }))
      if (!formData.phone) {
        getDoc(doc(db, "users", user.id)).then((snap) => {
          if (snap.exists() && snap.data().phone) {
            setFormData((prev) => ({ ...prev, phone: snap.data().phone }))
          }
        })
      }
    }
  }, [user])

  useEffect(() => {
    if (!selectedDate) { setOccupiedSlots([]); return }
    const dateKey = selectedDate.toISOString().split("T")[0]
    setLoadingSlots(true)
    getOccupiedSlots(dateKey).then((slots) => { setOccupiedSlots(slots); setLoadingSlots(false) })
  }, [selectedDate])

  const price = selectedType?.price ?? 0
  const discount = appliedCoupon ? price * (appliedCoupon.discount / 100) : 0
  const finalPrice = price - discount

  const isToday = useCallback((date: Date) => {
    const t = new Date(); t.setHours(0, 0, 0, 0)
    const d = new Date(date); d.setHours(0, 0, 0, 0)
    return t.getTime() === d.getTime()
  }, [])

  const timeSlots = useMemo((): TimeSlot[] => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    return TIME_SLOTS.map((time) => {
      const [h, m] = time.split(":").map(Number)
      const past = selectedDate && isToday(selectedDate) && (h < currentHour || (h === currentHour && m <= currentMin))
      return { time, available: !occupiedSlots.includes(time) && !past }
    })
  }, [occupiedSlots, selectedDate, isToday])

  const availableSlots = timeSlots.filter((slot) => slot.available)
  const occupiedCount = timeSlots.length - availableSlots.length

  const isWeekend = (date: Date) => date.getDay() === 0
  const isPastDate = (date: Date) => { const t = new Date(); t.setHours(0, 0, 0, 0); return date < t }

  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Digite um código"); return }
    setCouponLoading(true)
    try {
      const coupon = await getCouponByCode(couponCode)
      if (!coupon) { toast.error("Cupom inválido"); return }
      if (!coupon.active) { toast.error("Cupom inativo"); return }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) { toast.error("Cupom expirado"); return }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) { toast.error("Cupom esgotado"); return }
      if (coupon.minPurchase && price < coupon.minPurchase) { toast.error(`Valor mínimo: R$ ${coupon.minPurchase.toFixed(2).replace(".", ",")}`); return }
      setAppliedCoupon(coupon)
      toast.success(`Cupom aplicado! ${coupon.discount}% de desconto`)
    } catch { toast.error("Erro ao validar cupom") }
    finally { setCouponLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !selectedDate || !selectedTime) return
    setSubmitting(true)
    try {
      const payload: Record<string, any> = {
        clientId: user?.id,
        client: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: selectedType.id,
        typeName: selectedType.name,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        status: "pending",
        price: finalPrice,
        coupon: appliedCoupon?.code,
        message: formData.message || undefined,
      }
      Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })
      await createAppointment(payload as any)
      setStep(4)
      toast.success("Agendamento confirmado!", {
        description: `Sua consulta de ${selectedType.name} foi agendada com sucesso.`,
      })
    } catch (err: any) {
      const code = err?.code || ""
      if (code.includes("permission-denied")) {
        toast.error("As regras do Firestore precisam ser atualizadas. Peça ao admin para fazer deploy.")
      } else {
        toast.error(`Erro ao agendar (${code || "desconhecido"}). Tente novamente.`)
      }
    } finally { setSubmitting(false) }
  }

  const canProceedToStep2 = selectedType !== null
  const canProceedToStep3 = selectedDate !== undefined && selectedTime !== null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /><span className="font-sans text-sm">Voltar</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <MoonIcon className="w-6 h-6 text-primary" /><span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-sans font-medium transition-all", step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={cn("w-16 lg:w-24 h-1 mx-2 rounded-full transition-all", step > s ? "bg-primary" : "bg-secondary")} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Escolha sua Consulta</h1>
                <p className="text-muted-foreground font-sans">Selecione o tipo de consulta que deseja agendar</p>
              </div>
              {loadingTypes ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
              ) : (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
                    {consultationTypes.map((type) => (
                      <motion.button key={type.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedType(type)}
                        className={cn("relative p-6 rounded-xl border text-left transition-all cursor-pointer", selectedType?.id === type.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/50")}
                      >
                        {type.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-sans font-medium rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" /> Mais popular
                          </div>
                        )}
                        <div className="text-4xl mb-4">{type.icon}</div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{type.name}</h3>
                        <p className="text-sm font-sans text-muted-foreground mb-4">{type.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-sans text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {type.duration}</span>
                          <span className="text-lg font-bold text-primary">R$ {type.price.toFixed(2).replace(".", ",")}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={() => setStep(2)} disabled={!canProceedToStep2}
                      className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium">Continuar</Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Escolha Data e Horário</h1>
                <p className="text-muted-foreground font-sans">{selectedType?.name} — {selectedType?.duration}</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Selecione a data</h2>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => { setSelectedDate(date); setSelectedTime(null) }}
                    locale={ptBR}
                    disabled={(date) => isWeekend(date) || isPastDate(date)}
                    weekStartsOn={1}
                  />
                  <div className="mt-4 flex items-center gap-4 text-xs font-sans text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--rdp-accent-color, oklch(0.75 0.12 45))" }} />
                      <span>Selecionado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      <span>Disponível</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                      <span>Indisponível</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Horários disponíveis</h2>
                  </div>
                  {!selectedDate ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground font-sans">Selecione uma data para ver os horários</div>
                  ) : loadingSlots ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm font-sans text-muted-foreground">Carregando horários...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-sans text-muted-foreground mb-4">
                        {availableSlots.length} horários livres{occupiedCount > 0 && ` · ${occupiedCount} ocupados`}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => (
                          <button key={slot.time} onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={cn("py-3 px-3 rounded-lg font-sans text-sm font-medium transition-all cursor-pointer",
                              !slot.available ? "bg-secondary/20 text-muted-foreground/40 line-through cursor-not-allowed" :
                              selectedTime === slot.time ? "bg-gold text-background font-bold shadow-lg shadow-gold/20" :
                              "bg-secondary/50 text-foreground hover:bg-secondary"
                            )}
                          >{slot.time}</button>
                        ))}
                      </div>
                      {availableSlots.length === 0 && (
                        <p className="text-center text-muted-foreground font-sans mt-8">
                          Nenhum horário disponível nesta data.<br />Por favor, selecione outra data.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="mt-8 flex justify-center gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-8 font-sans">Voltar</Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedToStep3}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium">Continuar</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Seus Dados</h1>
                <p className="text-muted-foreground font-sans">Confirme suas informações para finalizar o agendamento</p>
              </div>

              <div className="max-w-xl mx-auto">
                {/* Coupon */}
                <div className="bg-card border border-border rounded-xl p-6 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground text-sm">Cupom de desconto</span>
                  </div>
                  <div className="flex gap-3">
                    <Input placeholder="Digite seu cupom" value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="font-sans bg-input/50 uppercase" disabled={!!appliedCoupon} />
                    <Button onClick={applyCoupon} variant="outline" disabled={!!appliedCoupon || couponLoading} className="shrink-0">
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : appliedCoupon ? "Aplicado" : "Aplicar"}
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-sans text-green-500">
                        Cupom {appliedCoupon.code} — {appliedCoupon.discount}% de desconto
                      </p>
                      <button onClick={() => { setAppliedCoupon(null); setCouponCode("") }}
                        className="text-xs font-sans text-muted-foreground hover:text-red-500 cursor-pointer">Remover</button>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-card border border-border rounded-xl p-6 mb-4">
                  <h3 className="font-semibold text-foreground mb-4">Resumo do Agendamento</h3>
                  <div className="space-y-3 font-sans text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Consulta:</span>
                      <span className="text-foreground font-medium">{selectedType?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="text-foreground font-medium">
                        {selectedDate?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horário:</span>
                      <span className="text-foreground font-medium">{selectedTime}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="text-primary font-bold text-lg">
                        {appliedCoupon ? (
                          <span className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">R$ {price.toFixed(2).replace(".", ",")}</span>
                            R$ {finalPrice.toFixed(2).replace(".", ",")}
                          </span>
                        ) : (
                          `R$ ${price.toFixed(2).replace(".", ",")}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-sans">Nome completo</Label>
                    <div className="relative">
                      <Input id="name" type="text" required placeholder="Seu nome" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10 h-12 bg-input/50 font-sans" />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-sans">E-mail</Label>
                      <div className="relative">
                        <Input id="email" type="email" required placeholder="seu@email.com" value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 h-12 bg-input/50 font-sans" />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-sans">WhatsApp</Label>
                      <div className="relative">
                        <Input id="phone" type="tel" required placeholder="(00) 00000-0000" value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10 h-12 bg-input/50 font-sans" />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-sans">Mensagem (opcional)</Label>
                    <div className="relative">
                      <Textarea id="message" placeholder="Conte um pouco sobre o que gostaria de abordar na consulta..."
                        value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="pl-10 pt-3 min-h-24 bg-input/50 font-sans resize-none" />
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="h-12 px-8 font-sans">Voltar</Button>
                    <Button type="submit" disabled={submitting}
                      className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium gap-2">
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitting ? "Agendando..." : `Confirmar${discount > 0 ? ` — R$ ${finalPrice.toFixed(2).replace(".", ",")}` : ""}`}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
              className="text-center py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </motion.div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Agendamento Confirmado!</h1>
              <p className="text-muted-foreground font-sans max-w-md mx-auto mb-8">
                Enviamos um e-mail com todos os detalhes da sua consulta para{" "}
                <span className="text-foreground">{formData.email}</span>
              </p>
              <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-auto mb-8">
                <div className="space-y-3 font-sans text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consulta:</span>
                    <span className="text-foreground font-medium">{selectedType?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="text-foreground font-medium">
                      {selectedDate?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="text-foreground font-medium">{selectedTime}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor pago:</span>
                      <span className="text-green-500 font-bold">R$ {finalPrice.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button asChild className="h-12 px-8 bg-primary hover:bg-primary/90">
                <Link href="/">Voltar para o Início</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
