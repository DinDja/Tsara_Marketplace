"use client"

import { motion } from "framer-motion"
import { Video, Phone, MapPin, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SchedulingTypeCard } from "@/components/scheduling"
import { useConsultationTypesLimited } from "@/lib/hooks"

const modalities = [
  { icon: Video, label: "Online", description: "Via Google Meet ou Zoom" },
  { icon: Phone, label: "Telefone", description: "Ligação de voz" },
  { icon: MapPin, label: "Presencial", description: "São Paulo - SP" },
]

export function Consultations() {
  const { data: types, loading } = useConsultationTypesLimited(3)

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

        {/* <motion.div
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
        </motion.div> */}

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
                className="h-full"
              >
                <SchedulingTypeCard
                  type={consultation}
                  actionHref={`/agendamento?type=${encodeURIComponent(consultation.id)}`}
                  actionLabel="Agendar agora"
                  nextAvailable="Ver agenda"
                />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link href="/consultas">
            <Button
              variant="outline"
              size="lg"
              className="border-gold/30 text-gold hover:bg-gold/10 tracking-wider font-sans group"
            >
              Ver Todas as Consultas
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground font-sans">
            Primeira vez? <span className="text-gold cursor-pointer hover:underline">Ganhe 15% de desconto</span> na sua primeira consulta.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
