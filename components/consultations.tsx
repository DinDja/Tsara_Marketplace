"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Clock, Video, Phone, MapPin, Check, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoonIcon } from "@/components/moon-icon"
import { Card } from "@/components/ui/card"
import { getConsultationTypes } from "@/lib/services"
import { formatPrice } from "@/lib/utils"
import type { ConsultationType } from "@/lib/services/consultations"

const modalities = [
  { icon: Video, label: "Online", description: "Via Google Meet ou Zoom" },
  { icon: Phone, label: "Telefone", description: "Ligação de voz" },
  { icon: MapPin, label: "Presencial", description: "São Paulo - SP" },
]

export function Consultations() {
  const [types, setTypes] = useState<ConsultationType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConsultationTypes().then((data) => { setTypes(data); setLoading(false) })
  }, [])

  return (
    <section id="consultas" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-[0.3em] uppercase text-gold font-sans">
            Consultas Personalizadas
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
            Descubra Seu <span className="italic text-gold">Caminho</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground font-sans leading-relaxed">
            Sessões individuais guiadas por anos de estudo e prática nos oráculos. 
            Cada consulta é única e adaptada às suas necessidades.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mb-16"
        >
          {modalities.map((mod, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-secondary/30 border border-border/50"
            >
              <mod.icon className="w-5 h-5 text-gold" />
              <div className="text-left">
                <span className="block text-sm font-sans text-foreground">{mod.label}</span>
                <span className="text-xs text-muted-foreground font-sans">{mod.description}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {types.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`relative ${consultation.popular ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {consultation.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-4 py-1 bg-gold text-background text-xs tracking-wider font-sans rounded-full">
                      <MoonIcon className="w-3 h-3" />
                      Mais Escolhida
                    </span>
                  </div>
                )}
                
                <Card className={`h-full flex flex-col bg-card/50 border-border/50 overflow-hidden transition-all duration-500 hover:border-gold/30 ${
                  consultation.popular ? "border-gold/50 shadow-lg shadow-gold/10" : ""
                }`}>
                  <div className="relative h-48 overflow-hidden">
                    {consultation.image ? (
                      <Image src={consultation.image} alt={consultation.name} fill className="object-cover transition-transform duration-500 hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-secondary/50 flex items-center justify-center text-6xl">{consultation.icon}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    {!consultation.image && (
                      <div className="absolute bottom-4 left-4 text-4xl text-gold">{consultation.icon}</div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-light text-foreground mb-3">
                    {consultation.name}
                  </h3>
                  <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-6">
                    {consultation.description}
                  </p>

                  <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border/50">
                    <Clock className="w-4 h-4 text-gold" />
                    <span className="text-sm font-sans text-muted-foreground">
                      {consultation.duration}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {consultation.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-sans text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl text-gold font-sans">
                        R$ {formatPrice(consultation.price)}
                      </span>
                      {consultation.originalPrice ? (
                        <span className="text-sm text-muted-foreground line-through font-sans">
                          R$ {formatPrice(consultation.originalPrice)}
                        </span>
                      ) : null}
                    </div>
                    <Button
                      className={`w-full font-sans tracking-wider group ${
                        consultation.popular
                          ? "bg-gold text-background hover:bg-gold/90"
                          : "bg-secondary text-foreground hover:bg-gold hover:text-background"
                      }`}
                    >
                      Agendar Agora
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground font-sans">
            Primeira vez? <span className="text-gold cursor-pointer hover:underline">Ganhe 15% de desconto</span> na sua primeira consulta.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
