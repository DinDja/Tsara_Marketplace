"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Lottie from "lottie-react"
import moonAnimation from "@/public/Moon.json"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="pt-[70px] relative min-h-screen flex items-center justify-center overflow-hidden stars-pattern pb-20">
      {/* Ambient Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mystic/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 md:left-20 opacity-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border border-gold/30 rounded-full"
        />
      </div>
      <div className="absolute bottom-16 right-8 md:right-20">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 md:w-48 md:h-48"
        >
          <Lottie
            animationData={moonAnimation}
            loop
            autoplay
            className="w-full h-full object-contain opacity-80 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          />
        </motion.div>
      </div>

      <div className="mt-5 relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-8"
        >
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-sm tracking-[0.2em] uppercase text-gold-muted font-sans">
            Sabedoria Ancestral
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-6"
        >
          <span className="block text-foreground">Desvende os</span>
          <span className="block text-balance">
            <span className="text-gold">Mistérios</span>
            <span className="text-foreground"> do Seu</span>
          </span>
          <span className="block text-foreground italic">Destino</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 font-sans"
        >
          Conecte-se com a magia do Tarot e do Baralho Cigano. 
          Descubra artigos esotÃ©ricos selecionados para iluminar sua jornada espiritual.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-gold text-background hover:bg-gold/90 text-base tracking-wider px-8 py-6 font-sans group"
          >
            Agendar Consulta
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-foreground/20 text-foreground hover:bg-foreground/5 hover:border-gold/50 text-base tracking-wider px-8 py-6 font-sans"
          >
            Explorar Loja
          </Button>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs tracking-[0.3em] uppercase font-sans">Descubra</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
