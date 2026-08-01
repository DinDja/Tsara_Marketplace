"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
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

function StepTypeCard({
  consultationTypes,
  selectedType,
  loadingTypes,
  typesError,
  onSelect,
}: {
  consultationTypes: ConsultationType[]
  selectedType: ConsultationType | null
  loadingTypes: boolean
  typesError: string | null
  onSelect: (type: ConsultationType) => void
}) {
  if (typesError) {
    return <EmptyScheduleState title="Nao foi possivel carregar" description={typesError} />
  }
  if (loadingTypes) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (consultationTypes.length === 0) {
    return (
      <EmptyScheduleState
        title="Nenhum tipo de consulta disponivel"
        description="Assim que novos atendimentos forem cadastrados, eles aparecerao aqui."
      />
    )
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {consultationTypes.map((type) => (
        <SchedulingTypeCard
          key={type.id}
          type={type}
          selected={selectedType?.id === type.id}
          onSelect={() => onSelect(type)}
          actionLabel="Escolher consulta"
        />
      ))}
    </div>
  )
}

function StepDateCard({
  selectedDate,
  typeLabel,
  onSelect,
  onBack,
  onContinue,
  canContinue,
  summary,
}: {
  selectedDate: Date | undefined
  typeLabel: string
  onSelect: (date?: Date) => void
  onBack: () => void
  onContinue: () => void
  canContinue: boolean
  summary: ReactNode
}) {
  return (
    <SchedulingStepLayout
      steps={steps}
      currentStep={2}
      title="Escolha a data"
      description={typeLabel}
      aside={summary}
      footer={
        <>
          <Button variant="outline" onClick={onBack} className="h-11 px-8 font-sans">Voltar</Button>
          <Button onClick={onContinue} disabled={!canContinue} className="h-11 px-8 font-sans">Continuar</Button>
        </>
      }
    >
      <DatePickerSection
        selectedDate={selectedDate}
        onSelect={onSelect}
        disabled={(date) => date.getDay() === 0 || isPastDate(date)}
      />
    </SchedulingStepLayout>
  )
}

function StepDataField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
  className,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon: ReactNode
  error?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="font-sans">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn("h-12 bg-input/50 pl-10 font-sans", error && "border-red-500/50")}
          placeholder={placeholder}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      </div>
    </div>
  )
}

function StepDataCard({
  formData,
  setFormData,
  summary,
  onBack,
  onContinue,
  canContinue,
}: {
  formData: { name: string; email: string; phone: string; message: string }
  setFormData: (updater: (prev: { name: string; email: string; phone: string; message: string }) => { name: string; email: string; phone: string; message: string }) => void
  summary: ReactNode
  onBack: () => void
  onContinue: () => void
  canContinue: boolean
}) {
  return (
    <SchedulingStepLayout
      steps={steps}
      currentStep={4}
      title="Confirme seus dados"
      description="Usaremos essas informacoes para confirmar a consulta e enviar o link ou orientacoes de atendimento."
      aside={summary}
      footer={
        <>
          <Button variant="outline" onClick={onBack} className="h-11 px-8 font-sans">Voltar</Button>
          <Button onClick={onContinue} disabled={!canContinue} className="h-11 px-8 font-sans">Revisar</Button>
        </>
      }
    >
      <LiquidGlassCard className="mx-auto max-w-2xl p-5 py-5 lg:p-6 lg:py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <StepDataField
            id="name"
            label="Nome completo"
            value={formData.name}
            onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
            placeholder="Seu nome"
            icon={<User className="h-4 w-4" />}
            className="space-y-2 sm:col-span-2"
          />
          <StepDataField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
            placeholder="seu@email.com"
            icon={<Mail className="h-4 w-4" />}
            error={!!formData.email && !isValidEmail(formData.email)}
            className="space-y-2"
          />
          <StepDataField
            id="phone"
            label="WhatsApp"
            value={formData.phone}
            onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
            placeholder="(00) 00000-0000"
            icon={<Phone className="h-4 w-4" />}
            error={!!formData.phone && !isValidPhone(formData.phone)}
            className="space-y-2"
          />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="message" className="font-sans">Mensagem opcional</Label>
            <div className="relative">
              <Textarea
                id="message"
                value={formData.message}
                onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                className="min-h-28 resize-none bg-input/50 pl-10 pt-3 font-sans"
                placeholder="Conte brevemente o que voce gostaria de abordar."
              />
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </SchedulingStepLayout>
  )
}

function StepTimeCard({
  summary,
  selectedDateLabel,
  slotError,
  timeSlots,
  selectedDate,
  selectedTime,
  loadingSlots,
  onSelect,
  onBack,
  onContinue,
  canContinue,
}: {
  summary: ReactNode
  selectedDateLabel: string | undefined
  slotError: string | null
  timeSlots: TimeSlot[]
  selectedDate: Date | undefined
  selectedTime: string | null
  loadingSlots: boolean
  onSelect: (time: string) => void
  onBack: () => void
  onContinue: () => void
  canContinue: boolean
}) {
  return (
    <SchedulingStepLayout
      steps={steps}
      currentStep={3}
      title="Escolha o horario"
      description={selectedDateLabel ? `Disponibilidade para ${selectedDateLabel}.` : "Selecione uma data para consultar horarios."}
      aside={summary}
      footer={
        <>
          <Button variant="outline" onClick={onBack} className="h-11 px-8 font-sans">Voltar</Button>
          <Button onClick={onContinue} disabled={!canContinue} className="h-11 px-8 font-sans">Continuar</Button>
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
          onSelect={onSelect}
        />
      )}
    </SchedulingStepLayout>
  )
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
              >
                <StepTypeCard
                  consultationTypes={consultationTypes}
                  selectedType={selectedType}
                  loadingTypes={loadingTypes}
                  typesError={typesError}
                  onSelect={(type) => {
                    setSelectedType(type)
                    setAppliedCoupon(null)
                    setCouponCode("")
                    setStep(2)
                  }}
                />
              </SchedulingStepLayout>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-date" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <StepDateCard
                selectedDate={selectedDate}
                typeLabel={selectedType ? `${selectedType.name} - ${selectedType.duration}` : "Escolha quando voce quer ser atendido."}
                onSelect={(date) => {
                  setSelectedDate(date)
                  setSelectedTime(null)
                }}
                onBack={() => setStep(1)}
                onContinue={() => continueFromStep(3)}
                canContinue={canContinue[2]}
                summary={summary}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step-time" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <StepTimeCard
                summary={summary}
                selectedDateLabel={selectedDateLabel}
                slotError={slotError}
                timeSlots={timeSlots}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                loadingSlots={loadingSlots}
                onSelect={setSelectedTime}
                onBack={() => setStep(2)}
                onContinue={() => continueFromStep(4)}
                canContinue={canContinue[3]}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step-data" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <StepDataCard
                formData={formData}
                setFormData={setFormData}
                summary={summary}
                onBack={() => setStep(3)}
                onContinue={() => continueFromStep(5)}
                canContinue={canContinue[4]}
              />
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
