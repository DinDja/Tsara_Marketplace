"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Clock, Video, Phone, MapPin, Check, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const consultationTypes = [
  {
    id: 1,
    title: "Tarot Terapêutico",
    description: "Uma jornada profunda pelo simbolismo do Tarot, revelando padrões, bloqueios e caminhos de cura.",
    duration: "60 min",
    price: 180.00,
    image: "/consultations/tarot.jpg",
    features: [
      "Leitura completa de 10 cartas",
      "Análise de ciclos e padrões",
      "Orientações práticas",
      "Gravação da sessão"
    ],
    popular: true,
    icon: "✦"
  },
  {
    id: 2,
    title: "Baralho Cigano",
    description: "A sabedoria ancestral cigana aplicada às suas questões amorosas, financeiras e de destino.",
    duration: "45 min",
    price: 150.00,
    image: "/consultations/cigano.jpg",
    features: [
      "Tiragem da Mesa Real",
      "Foco em questões específicas",
      "Previsões temporais",
      "Resumo por escrito"
    ],
    popular: false,
    icon: "❖"
  },
  {
    id: 3,
    title: "Sessão Completa",
    description: "Combine Tarot e Baralho Cigano para uma visão 360° da sua vida e seu caminho espiritual.",
    duration: "90 min",
    price: 280.00,
    originalPrice: 330.00,
    image: "/consultations/completa.jpg",
    features: [
      "Tarot + Baralho Cigano",
      "Análise de todas as áreas",
      "Mapa energético pessoal",
      "Acompanhamento por 7 dias"
    ],
    popular: false,
    icon: "◈"
  }
]

const modalities = [
  { icon: Video, label: "Online", description: "Via Google Meet ou Zoom" },
  { icon: Phone, label: "Telefone", description: "Ligação de voz" },
  { icon: MapPin, label: "Presencial", description: "São Paulo - SP" },
]

export function Consultations() {
  return (
    <section id="consultas" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
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

        {/* Modalities */}
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

        {/* Consultation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {consultationTypes.map((consultation, index) => (
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
                    <Sparkles className="w-3 h-3" />
                    Mais Escolhida
                  </span>
                </div>
              )}
              
              <Card className={`h-full flex flex-col bg-card/50 border-border/50 overflow-hidden transition-all duration-500 hover:border-gold/30 ${
                consultation.popular ? "border-gold/50 shadow-lg shadow-gold/10" : ""
              }`}>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={consultation.image}
                    alt={consultation.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-4xl text-gold">{consultation.icon}</div>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-grow">
                {/* Title & Description */}
                <h3 className="text-2xl font-light text-foreground mb-3">
                  {consultation.title}
                </h3>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-6">
                  {consultation.description}
                </p>

                {/* Duration */}
                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border/50">
                  <Clock className="w-4 h-4 text-gold" />
                  <span className="text-sm font-sans text-muted-foreground">
                    {consultation.duration}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {consultation.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-sans text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Price & CTA */}
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl text-gold font-sans">
                      R$ {consultation.price.toFixed(2).replace(".", ",")}
                    </span>
                    {consultation.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through font-sans">
                        R$ {consultation.originalPrice.toFixed(2).replace(".", ",")}
                      </span>
                    )}
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

        {/* Additional Info */}
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
