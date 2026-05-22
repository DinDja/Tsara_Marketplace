"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { getConsultationTypes } from "@/lib/services"
import type { ConsultationType } from "@/lib/services/consultations"

export default function ConsultasPage() {
  const [types, setTypes] = useState<ConsultationType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConsultationTypes().then((data) => { setTypes(data); setLoading(false) })
  }, [])

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-gold font-sans">Consultas Personalizadas</span>
            <h1 className="mt-4 text-4xl md:text-5xl font-light text-foreground">
              Descubra Seu <span className="italic text-gold">Caminho</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground font-sans">
              Sessões individuais guiadas por anos de estudo e prática nos oráculos. Cada consulta é única e adaptada às suas necessidades.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {types.map((consultation, index) => (
                <motion.div key={consultation.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className={`relative ${consultation.popular ? "md:-mt-4 md:mb-4" : ""}`}>
                  {consultation.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1 px-4 py-1 bg-gold text-background text-xs tracking-wider font-sans rounded-full">
                        <MoonIcon className="w-3 h-3" /> Mais Escolhida
                      </span>
                    </div>
                  )}
                  <Card className={`h-full flex flex-col bg-card/50 border-border/50 overflow-hidden transition-all duration-500 hover:border-gold/30 ${consultation.popular ? "border-gold/50 shadow-lg shadow-gold/10" : ""}`}>
                    <div className="relative h-48 overflow-hidden">
                      {consultation.image ? (
                        <Image src={consultation.image} alt={consultation.name} fill className="object-cover transition-transform duration-500 hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-secondary/50 flex items-center justify-center text-6xl">{consultation.icon}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-light text-foreground mb-3">{consultation.name}</h3>
                      <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-6">{consultation.description}</p>

                      <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border/50">
                        <Clock className="w-4 h-4 text-gold" /><span className="text-sm font-sans text-muted-foreground">{consultation.duration}</span>
                      </div>

                      <ul className="space-y-3 mb-8 flex-grow">
                        {consultation.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" /><span className="text-sm font-sans text-foreground/80">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto">
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-3xl text-gold font-sans">R$ {formatPrice(consultation.price)}</span>
                          {consultation.originalPrice ? (
                            <span className="text-sm text-muted-foreground line-through font-sans">R$ {formatPrice(consultation.originalPrice)}</span>
                          ) : null}
                        </div>
                        <Link href="/agendamento">
                          <Button className={`w-full font-sans tracking-wider group ${consultation.popular ? "bg-gold text-background hover:bg-gold/90" : "bg-secondary text-foreground hover:bg-gold hover:text-background"}`}>
                            Agendar Agora<ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}