"use client"

import { motion } from "framer-motion"
import { Heart, Eye, Moon } from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import Zodiac from "@/public/Zodiac sign.json"
import Lottie from "lottie-react"

const values = [
  {
    icon: Heart,
    title: "Acolhimento",
    description: "Cada consulta é um espaço seguro para você se expressar e buscar respostas.",
  },
  {
    icon: Eye,
    title: "Clareza",
    description: "Interpretações honestas e diretas, sem rodeios ou falsas promessas.",
  },
  {
    icon: Moon,
    title: "Sabedoria",
    description: "Anos de estudo e prática para oferecer orientações genuínas.",
  },
  {
    icon: MoonIcon,
    title: "Magia",
    description: "Produtos selecionados com cuidado e energizados com intenção.",
  },
]

export function About() {
  return (
    <section id="sobre" className="py-24 md:py-32 relative overflow-hidden">
      {/* Decorative Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image / Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-mystic/20 to-gold/10 border border-border/30 overflow-hidden relative">
              {/* Mystical Visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Outer Ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="w-64 h-64 rounded-full border border-gold/20"
                  />
                  {/* Middle Ring */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8 rounded-full border border-mystic-light/30"
                  />
                  {/* Inner Ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-16 rounded-full border border-gold/40"
                  />
                  {/* Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lottie
                      animationData={Zodiac}
                      loop
                      autoplay
                      rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
                      className="h-full w-full object-cover [filter:brightness(1.35)_contrast(1.05)_saturate(0.6)]"
                    />                  </div>
                </div>
              </div>

              {/* Stars decoration */}
              <div className="absolute inset-0 stars-pattern opacity-50" />
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -right-6 md:right-6 bg-card border border-gold/30 rounded-2xl p-6 shadow-xl"
            >
              <span className="block text-4xl text-gold font-light">8+</span>
              <span className="text-sm text-muted-foreground font-sans">
                Anos de<br />Experiência
              </span>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <span className="text-sm tracking-[0.3em] uppercase text-gold font-sans">
              Sobre a Tsara
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-light text-foreground leading-tight">
              Uma Jornada de<br />
              <span className="italic text-gold">Autoconhecimento</span>
            </h2>

            <div className="mt-8 space-y-6 text-muted-foreground font-sans leading-relaxed">
              <p>
                A Tsara nasceu do desejo de compartilhar a sabedoria ancestral dos oráculos
                de forma acessível e transformadora. Há mais de 8 anos, guio pessoas em
                suas jornadas de autoconhecimento através do Tarot e do Baralho Cigano.
              </p>
              <p>
                Nossa loja reúne artigos esotéricos cuidadosamente selecionados — cada
                cristal, vela e oráculo passa por um processo de energização antes de
                chegar até você, garantindo que sua energia esteja alinhada com seu propósito.
              </p>
            </div>

            {/* Values Grid */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <value.icon className="w-6 h-6 text-gold mb-3 transition-transform group-hover:scale-110" />
                  <h3 className="text-foreground font-medium mb-1">{value.title}</h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
