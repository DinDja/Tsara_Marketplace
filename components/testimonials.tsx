"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Card } from "@/components/ui/card"

const testimonials = [
  {
    id: 1,
    name: "Mariana S.",
    role: "Designer",
    content: "A consulta de Tarot com a Tsara foi transformadora. Ela me ajudou a enxergar padrões que eu não conseguia ver sozinha. Recomendo demais!",
    rating: 5,
    image: null,
  },
  {
    id: 2,
    name: "Carlos R.",
    role: "Empresário",
    content: "Comprei a Ametista e o Baralho Cigano. A qualidade dos produtos é impecável e a energia que transmitem é incrível. Já sou cliente fiel.",
    rating: 5,
    image: null,
  },
  {
    id: 3,
    name: "Juliana M.",
    role: "Terapeuta",
    content: "O Baralho Cigano trouxe clareza para decisões importantes na minha vida. A forma como ela conduz a sessão é acolhedora e profissional.",
    rating: 5,
    image: null,
  },
  {
    id: 4,
    name: "Fernando L.",
    role: "Músico",
    content: "Estava passando por um momento difícil e a sessão completa me deu direção e esperança. Os insights foram certeiros. Gratidão eterna.",
    rating: 5,
    image: null,
  },
  {
    id: 5,
    name: "Amanda C.",
    role: "Advogada",
    content: "Os cristais que comprei são lindos e de altíssima qualidade. O atendimento é atencioso e o envio foi super rápido. Nota 10!",
    rating: 5,
    image: null,
  },
  {
    id: 6,
    name: "Roberto P.",
    role: "Professor",
    content: "Já fiz três consultas e cada uma trouxe revelações importantes. A Tsara tem um dom especial para interpretar os oráculos.",
    rating: 5,
    image: null,
  },
]

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-mystic/5 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-[0.3em] uppercase text-gold font-sans">
            Depoimentos
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
            O que Dizem <span className="italic text-gold">Nossos Clientes</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground font-sans leading-relaxed">
            Histórias de transformação e conexão espiritual compartilhadas 
            por quem já viveu a experiência Tsara.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/30 border-border/30 p-6 hover:border-gold/20 transition-all duration-500 group">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-gold/30 mb-4" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground/90 font-sans leading-relaxed mb-6 group-hover:text-foreground transition-colors">
                  {`"${testimonial.content}"`}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/30">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-gold font-sans font-medium">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-sans text-foreground">
                      {testimonial.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "2.500+", label: "Consultas Realizadas" },
            { value: "98%", label: "Satisfação" },
            { value: "4.9", label: "Avaliação Média" },
            { value: "8+", label: "Anos de Experiência" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <span className="block text-3xl md:text-4xl text-gold font-light">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground font-sans mt-2 block">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
