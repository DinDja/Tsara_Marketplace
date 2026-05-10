"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Calendar as CalendarIcon,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

interface ConsultationType {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  icon: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const consultationTypes: ConsultationType[] = [
  {
    id: "tarot",
    name: "Consulta de Tarot",
    duration: "45 min",
    price: 150,
    description: "Leitura profunda com o Tarot de Marselha",
    icon: "🃏",
  },
  {
    id: "cigano",
    name: "Baralho Cigano",
    duration: "30 min",
    price: 120,
    description: "Orientações com a sabedoria cigana",
    icon: "🔮",
  },
  {
    id: "completa",
    name: "Sessão Completa",
    duration: "90 min",
    price: 280,
    description: "Tarot + Baralho Cigano + Orientação espiritual",
    icon: "✨",
  },
];

// Simulated occupied time slots (in a real app, this would come from a database)
const occupiedSlots: Record<string, string[]> = {
  "2026-05-11": ["09:00", "10:00", "14:00"],
  "2026-05-12": ["11:00", "15:00", "16:00"],
  "2026-05-13": ["09:00", "10:00", "11:00", "14:00", "15:00"],
  "2026-05-14": ["10:00", "14:00"],
  "2026-05-15": ["09:00", "11:00", "16:00", "17:00"],
  "2026-05-18": ["10:00", "11:00", "14:00", "15:00"],
  "2026-05-19": ["09:00", "14:00", "16:00"],
  "2026-05-20": ["10:00", "11:00", "15:00"],
};

const allTimeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function AgendamentoPage() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const timeSlots = useMemo((): TimeSlot[] => {
    if (!selectedDate) return [];
    const dateKey = formatDateKey(selectedDate);
    const occupied = occupiedSlots[dateKey] || [];
    return allTimeSlots.map((time) => ({
      time,
      available: !occupied.includes(time),
    }));
  }, [selectedDate]);

  const availableSlots = timeSlots.filter((slot) => slot.available);
  const occupiedCount = timeSlots.length - availableSlots.length;

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0; // Sunday is closed
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4); // Success step
  };

  const canProceedToStep2 = selectedType !== null;
  const canProceedToStep3 = selectedDate !== undefined && selectedTime !== null;

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
              <span className="font-sans text-sm">Voltar</span>
            </Link>

            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>

            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-sans font-medium transition-all",
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "w-16 lg:w-24 h-1 mx-2 rounded-full transition-all",
                    step > s ? "bg-primary" : "bg-secondary"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Consultation Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Escolha sua Consulta
                </h1>
                <p className="text-muted-foreground font-sans">
                  Selecione o tipo de consulta que deseja agendar
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
                {consultationTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "relative p-6 rounded-xl border text-left transition-all",
                      selectedType?.id === type.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    {type.id === "completa" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-sans font-medium rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Mais popular
                      </div>
                    )}
                    <div className="text-4xl mb-4">{type.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {type.name}
                    </h3>
                    <p className="text-sm font-sans text-muted-foreground mb-4">
                      {type.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-sans text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {type.duration}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        R$ {type.price}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date and Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Escolha Data e Horário
                </h1>
                <p className="text-muted-foreground font-sans">
                  {selectedType?.name} - {selectedType?.duration}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">
                      Selecione a data
                    </h2>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    locale={ptBR}
                    disabled={(date) => isWeekend(date) || isPastDate(date)}
                    className="rounded-lg"
                    modifiers={{
                      hasSlots: (date) => {
                        const key = formatDateKey(date);
                        return key in occupiedSlots;
                      },
                    }}
                    modifiersClassNames={{
                      hasSlots: "border-2 border-primary/30",
                    }}
                  />
                  <div className="mt-4 flex items-center gap-4 text-xs font-sans text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span>Selecionado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-primary/30" />
                      <span>Com horários</span>
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">
                      Horários disponíveis
                    </h2>
                  </div>

                  {!selectedDate ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground font-sans">
                      Selecione uma data para ver os horários
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-sans text-muted-foreground mb-4">
                        {availableSlots.length} horários livres
                        {occupiedCount > 0 && ` · ${occupiedCount} ocupados`}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={cn(
                              "py-3 px-4 rounded-lg font-sans text-sm font-medium transition-all",
                              !slot.available
                                ? "bg-secondary/30 text-muted-foreground line-through cursor-not-allowed"
                                : selectedTime === slot.time
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-secondary hover:bg-secondary/80 text-foreground"
                            )}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>

                      {availableSlots.length === 0 && (
                        <p className="text-center text-muted-foreground font-sans mt-8">
                          Nenhum horário disponível nesta data.
                          <br />
                          Por favor, selecione outra data.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-12 px-8 font-sans"
                >
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedToStep3}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Personal Information */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Seus Dados
                </h1>
                <p className="text-muted-foreground font-sans">
                  Preencha suas informações para confirmar o agendamento
                </p>
              </div>

              <div className="max-w-xl mx-auto">
                {/* Summary Card */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Resumo do Agendamento
                  </h3>
                  <div className="space-y-3 font-sans text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Consulta:</span>
                      <span className="text-foreground font-medium">
                        {selectedType?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="text-foreground font-medium">
                        {selectedDate?.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horário:</span>
                      <span className="text-foreground font-medium">
                        {selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="text-primary font-bold text-lg">
                        R$ {selectedType?.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-sans">
                      Nome completo
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        required
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="pl-10 h-12 bg-input/50 font-sans"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-sans">
                        E-mail
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="pl-10 h-12 bg-input/50 font-sans"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-sans">
                        WhatsApp
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          required
                          placeholder="(00) 00000-0000"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="pl-10 h-12 bg-input/50 font-sans"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-sans">
                      Mensagem (opcional)
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="message"
                        placeholder="Conte um pouco sobre o que gostaria de abordar na consulta..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="pl-10 pt-3 min-h-24 bg-input/50 font-sans resize-none"
                      />
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="h-12 px-8 font-sans"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium"
                    >
                      Confirmar Agendamento
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </motion.div>

              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Agendamento Confirmado!
              </h1>
              <p className="text-muted-foreground font-sans max-w-md mx-auto mb-8">
                Enviamos um e-mail com todos os detalhes da sua consulta para{" "}
                <span className="text-foreground">{formData.email}</span>
              </p>

              <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-auto mb-8">
                <div className="space-y-3 font-sans text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consulta:</span>
                    <span className="text-foreground font-medium">
                      {selectedType?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="text-foreground font-medium">
                      {selectedDate?.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="text-foreground font-medium">
                      {selectedTime}
                    </span>
                  </div>
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
  );
}
