"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Tag,
  User,
} from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  BookingConfirmation,
  BookingSummary,
  DatePickerSection,
  EmptyScheduleState,
  SchedulingStepLayout,
  SchedulingTypeCard,
  TimeSlotSelector,
} from "@/components/scheduling"
import { TIME_SLOTS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { createAppointment, getConsultationTypes, getCouponByCode, getOccupiedSlots } from "@/lib/services"
import { useAuth } from "@/lib/contexts/auth-context"
import { toast } from "sonner"
import type { Coupon, TimeSlot } from "@/lib/types"
import type { ConsultationType } from "@/lib/services/consultations"

const steps = [
  { id: 1, label: "Tipo" },
  { id: 2, label: "Data" },
  { id: 3, label: "Horario" },
  { id: 4, label: "Dados" },
  { id: 5, label: "Revisao" },
  { id: 6, label: "Sucesso" },
]

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isPastDate(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return target < today
}

function isToday(date: Date) {
  const today = new Date()
  return toDateKey(today) === toDateKey(date)
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string) {
  return phone.replace(/\D/g, "").length >= 10
}

function AgendamentoContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const preselectedTypeId = searchParams.get("type")

  const [step, setStep] = useState(1)
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [typesError, setTypesError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    getConsultationTypes()
      .then((data) => {
        if (!mounted) return
        setConsultationTypes(data)
        const preselected = data.find((type) => type.id === preselectedTypeId)
        if (preselected) {
          setSelectedType(preselected)
          setStep(2)
        }
      })
      .catch(() => {
        if (mounted) setTypesError("Nao foi possivel carregar os tipos de consulta.")
      })
      .finally(() => {
        if (mounted) setLoadingTypes(false)
      })
    return () => { mounted = false }
  }, [preselectedTypeId])

  useEffect(() => {
    if (!user) return

    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name,
      email: prev.email || user.email,
    }))

    getDoc(doc(db, "users", user.id)).then((snap) => {
      const phone = snap.exists() ? snap.data().phone : ""
      if (phone) setFormData((prev) => ({ ...prev, phone: prev.phone || phone }))
    })
  }, [user])

  useEffect(() => {
    if (!selectedDate) {
      setOccupiedSlots([])
      setSlotError(null)
      return
    }

    let mounted = true
    setLoadingSlots(true)
    setSlotError(null)
    getOccupiedSlots(toDateKey(selectedDate))
      .then((slots) => {
        if (mounted) setOccupiedSlots(slots)
      })
      .catch(() => {
        if (mounted) setSlotError("Nao foi possivel carregar a disponibilidade.")
      })
      .finally(() => {
        if (mounted) setLoadingSlots(false)
      })
    return () => { mounted = false }
  }, [selectedDate])

  const price = selectedType?.price ?? 0
  const discount = appliedCoupon ? price * (appliedCoupon.discount / 100) : 0
  const finalPrice = Math.max(0, price - discount)

  const timeSlots = useMemo((): TimeSlot[] => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()

    return TIME_SLOTS.map((time) => {
      const [hour, minute] = time.split(":").map(Number)
      const past = selectedDate && isToday(selectedDate) && (hour < currentHour || (hour === currentHour && minute <= currentMin))
      return {
        time,
        available: Boolean(selectedDate) && !occupiedSlots.includes(time) && !past,
      }
    })
  }, [occupiedSlots, selectedDate])

  const canContinue = {
    1: !!selectedType,
    2: !!selectedDate,
    3: !!selectedTime,
    4: formData.name.trim().length >= 2 && isValidEmail(formData.email) && isValidPhone(formData.phone),
    5: !!selectedType && !!selectedDate && !!selectedTime && !submitting,
  }

  const selectedDateLabel = selectedDate?.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Digite um codigo de cupom.")
      return
    }
    setCouponLoading(true)
    try {
      const coupon = await getCouponByCode(couponCode)
      if (!coupon) {
        toast.error("Cupom nao encontrado.")
        return
      }
      if (!coupon.active) {
        toast.error("Este cupom esta inativo.")
        return
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        toast.error("Este cupom expirou.")
        return
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        toast.error("Este cupom ja atingiu o limite de uso.")
        return
      }
      if (coupon.minPurchase && price < coupon.minPurchase) {
        toast.error(`Valor minimo para este cupom: R$ ${coupon.minPurchase.toFixed(2).replace(".", ",")}`)
        return
      }
      setAppliedCoupon(coupon)
      toast.success(`Cupom aplicado: ${coupon.discount}% de desconto.`)
    } catch {
      toast.error("Nao foi possivel validar o cupom agora.")
    } finally {
      setCouponLoading(false)
    }
  }

  const continueFromStep = (targetStep: number) => {
    if (targetStep === 2 && !canContinue[1]) {
      toast.error("Escolha um tipo de consulta para continuar.")
      return
    }
    if (targetStep === 3 && !canContinue[2]) {
      toast.error("Escolha uma data para continuar.")
      return
    }
    if (targetStep === 4 && !canContinue[3]) {
      toast.error("Escolha um horario livre para continuar.")
      return
    }
    if (targetStep === 5 && !canContinue[4]) {
      toast.error("Confira nome, email e WhatsApp antes de continuar.")
      return
    }
    setStep(targetStep)
  }

  const handleSubmit = async () => {
    if (!selectedType || !selectedDate || !selectedTime) {
      toast.error("Revise tipo, data e horario antes de confirmar.")
      return
    }
    if (!canContinue[4]) {
      toast.error("Preencha seus dados corretamente.")
      setStep(4)
      return
    }

    setSubmitting(true)
    try {
      const payload: Record<string, any> = {
        clientId: user?.id,
        client: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        type: selectedType.id,
        typeName: selectedType.name,
        date: toDateKey(selectedDate),
        time: selectedTime,
        status: "pending",
        price: finalPrice,
        coupon: appliedCoupon?.code,
        message: formData.message.trim() || undefined,
      }

      Object.keys(payload).forEach((key) => { if (payload[key] === undefined) delete payload[key] })
      await createAppointment(payload as any)
      setStep(6)
      toast.success("Solicitacao de agendamento enviada.")
    } catch (err: any) {
      const message = String(err?.message || "")
      if (message.includes("slot-unavailable")) {
        toast.error("Esse horario acabou de ser reservado. Escolha outro horario.")
        if (selectedDate) {
          const slots = await getOccupiedSlots(toDateKey(selectedDate))
          setOccupiedSlots(slots)
        }
        setSelectedTime(null)
        setStep(3)
      } else if (err?.code?.includes("permission-denied")) {
        toast.error("Nao foi possivel gravar o agendamento por permissao do Firestore.")
      } else {
        toast.error("Nao foi possivel confirmar agora. Tente novamente em instantes.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const summary = (
    <BookingSummary
      type={selectedType}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      price={price}
      discount={discount}
      finalPrice={finalPrice}
      coupon={appliedCoupon}
      message={formData.message}
    />
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/consultas" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-sans">Consultas</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <MoonIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step-type" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <SchedulingStepLayout
                steps={steps}
                currentStep={step}
                title="Escolha sua consulta"
                description="Selecione o atendimento que melhor combina com o momento que voce quer investigar."
                footer={
                  <Button onClick={() => continueFromStep(2)} disabled={!canContinue[1]} className="h-11 px-8 font-sans">
                    Continuar
                  </Button>
                }
              >
                {typesError ? (
                  <EmptyScheduleState title="Nao foi possivel carregar" description={typesError} />
                ) : loadingTypes ? (
                  <div className="flex min-h-80 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : consultationTypes.length === 0 ? (
                  <EmptyScheduleState
                    title="Nenhum tipo de consulta disponivel"
                    description="Assim que novos atendimentos forem cadastrados, eles aparecerao aqui."
                  />
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {consultationTypes.map((type) => (
                      <SchedulingTypeCard
                        key={type.id}
                        type={type}
                        selected={selectedType?.id === type.id}
                        onSelect={() => {
                          setSelectedType(type)
                          setAppliedCoupon(null)
                          setCouponCode("")
                        }}
                        actionLabel="Escolher consulta"
                      />
                    ))}
                  </div>
                )}
              </SchedulingStepLayout>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-date" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <SchedulingStepLayout
                steps={steps}
                currentStep={step}
                title="Escolha a data"
                description={selectedType ? `${selectedType.name} - ${selectedType.duration}` : "Escolha quando voce quer ser atendido."}
                aside={summary}
                footer={
                  <>
                    <Button variant="outline" onClick={() => setStep(1)} className="h-11 px-8 font-sans">Voltar</Button>
                    <Button onClick={() => continueFromStep(3)} disabled={!canContinue[2]} className="h-11 px-8 font-sans">Continuar</Button>
                  </>
                }
              >
                <DatePickerSection
                  selectedDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setSelectedTime(null)
                  }}
                  disabled={(date) => date.getDay() === 0 || isPastDate(date)}
                />
              </SchedulingStepLayout>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step-time" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <SchedulingStepLayout
                steps={steps}
                currentStep={step}
                title="Escolha o horario"
                description={selectedDateLabel ? `Disponibilidade para ${selectedDateLabel}.` : "Selecione uma data para consultar horarios."}
                aside={summary}
                footer={
                  <>
                    <Button variant="outline" onClick={() => setStep(2)} className="h-11 px-8 font-sans">Voltar</Button>
                    <Button onClick={() => continueFromStep(4)} disabled={!canContinue[3]} className="h-11 px-8 font-sans">Continuar</Button>
                  </>
                }
              >
                {slotError ? (
                  <EmptyScheduleState title="Agenda indisponivel" description={slotError} />
                ) : (
                  <TimeSlotSelector
                    slots={timeSlots}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    loading={loadingSlots}
                    onSelect={setSelectedTime}
                  />
                )}
              </SchedulingStepLayout>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step-data" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <SchedulingStepLayout
                steps={steps}
                currentStep={step}
                title="Confirme seus dados"
                description="Usaremos essas informacoes para confirmar a consulta e enviar o link ou orientacoes de atendimento."
                aside={summary}
                footer={
                  <>
                    <Button variant="outline" onClick={() => setStep(3)} className="h-11 px-8 font-sans">Voltar</Button>
                    <Button onClick={() => continueFromStep(5)} disabled={!canContinue[4]} className="h-11 px-8 font-sans">Revisar</Button>
                  </>
                }
              >
                <LiquidGlassCard className="mx-auto max-w-2xl p-5 py-5 lg:p-6 lg:py-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="name" className="font-sans">Nome completo</Label>
                      <div className="relative">
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                          className="h-12 bg-input/50 pl-10 font-sans"
                          placeholder="Seu nome"
                        />
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-sans">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                          className={cn("h-12 bg-input/50 pl-10 font-sans", formData.email && !isValidEmail(formData.email) && "border-red-500/50")}
                          placeholder="seu@email.com"
                        />
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-sans">WhatsApp</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                          className={cn("h-12 bg-input/50 pl-10 font-sans", formData.phone && !isValidPhone(formData.phone) && "border-red-500/50")}
                          placeholder="(00) 00000-0000"
                        />
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="message" className="font-sans">Mensagem opcional</Label>
                      <div className="relative">
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                          className="min-h-28 resize-none bg-input/50 pl-10 pt-3 font-sans"
                          placeholder="Conte brevemente o que voce gostaria de abordar."
                        />
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              </SchedulingStepLayout>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step-review" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <SchedulingStepLayout
                steps={steps}
                currentStep={step}
                title="Revise e confirme"
                description="Confira os detalhes. Se algo estiver errado, volte para ajustar antes de enviar."
                aside={summary}
                footer={
                  <>
                    <Button variant="outline" onClick={() => setStep(4)} className="h-11 px-8 font-sans">Voltar</Button>
                    <Button onClick={handleSubmit} disabled={!canContinue[5]} className="h-11 px-8 gap-2 font-sans">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {submitting ? "Enviando..." : "Confirmar agendamento"}
                    </Button>
                  </>
                }
              >
                <div className="mx-auto grid max-w-3xl gap-4">
                  <LiquidGlassCard className="p-5 py-5">
                    <h2 className="text-base font-semibold text-foreground">Dados de contato</h2>
                    <div className="mt-4 grid gap-3 text-sm font-sans sm:grid-cols-3">
                      <div>
                        <span className="text-muted-foreground">Nome</span>
                        <p className="font-medium text-foreground">{formData.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email</span>
                        <p className="truncate font-medium text-foreground">{formData.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">WhatsApp</span>
                        <p className="font-medium text-foreground">{formData.phone}</p>
                      </div>
                    </div>
                  </LiquidGlassCard>

                  <LiquidGlassCard className="p-5 py-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <h2 className="text-base font-semibold text-foreground">Cupom de desconto</h2>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        placeholder="Digite seu cupom"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                        className="bg-input/50 uppercase font-sans"
                      />
                      <Button variant="outline" onClick={applyCoupon} disabled={couponLoading || !!appliedCoupon} className="gap-2 font-sans">
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {appliedCoupon ? "Aplicado" : "Aplicar"}
                      </Button>
                    </div>
                    {appliedCoupon ? (
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-500 font-sans">
                        <span>{appliedCoupon.code} aplicado</span>
                        <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode("") }} className="hover:underline">
                          Remover
                        </button>
                      </div>
                    ) : null}
                  </LiquidGlassCard>
                </div>
              </SchedulingStepLayout>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step-success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <SchedulingStepLayout steps={steps} currentStep={step} title="" description="">
                <BookingConfirmation
                  type={selectedType}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  email={formData.email}
                  finalPrice={finalPrice}
                />
              </SchedulingStepLayout>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function AgendamentoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AgendamentoContent />
    </Suspense>
  )
}
