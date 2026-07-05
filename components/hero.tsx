"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import Lottie from "lottie-react"
import moonAnimation from "@/public/Moon.json"
import moonShootingStarAnimation from "@/public/Moon Shooting Star Background _ Designed and animate by Mohit Saini.json"
import zodiacAnimation from "@/public/Zodiac sign.json"
import swipeGestureAnimation from "@/public/Swipe Gesture Up.json"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="pt-[70px] relative min-h-screen flex items-center justify-center overflow-hidden stars-pattern pb-20">
      {/* Ambient Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mystic/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden mix-blend-screen opacity-75">
        <Lottie
          animationData={moonShootingStarAnimation}
          loop
          autoplay
          rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
          className="h-full w-full object-cover [filter:brightness(1.35)_contrast(1.05)_saturate(0.6)]"
        />
      </div>

      {/* Decorative Elements */}
      {/* <div className="mt-5 absolute top-16 left-6 md:left-16 opacity-80">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border border-gold/30 bg-gold/5 p-2"
        >
          <Lottie
            animationData={zodiacAnimation}
            loop
            autoplay
            className="w-full h-full object-contain opacity-90 [filter:sepia(0.85)_hue-rotate(330deg)_saturate(1.1)_brightness(1.35)]"
          />
        </motion.div>
      </div> */}
      <div className="absolute bottom-1 right-8 md:right-20 w-[200px] h-[200px] md:w-[300px] md:h-[300px] opacity-80">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative "
        >
          {/* <Lottie
            animationData={moonAnimation}
            loop
            autoplay
            className="w-full h-full object-contain opacity-80 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          /> */}
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
          <span className="text-sm tracking-[0.2em] uppercase text-gold-muted font-sans">
            Seja bem-vindo ao TSARA
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
          Descubra artigos esotéricos selecionados para iluminar sua jornada espiritual.
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-10 flex justify-center pointer-events-none"
        >
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden md:flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-xs tracking-[0.3em] uppercase font-sans">Descubra</span>
              <div className="w-px h-8 bg-gradient-to-b from-gold/50 to-transparent" />
              <div className="flex flex-col items-center">
                <div className="relative h-12 w-7 rounded-full border-2 border-gold/70">
                  <motion.div
                    className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold"
                    animate={{ y: [0, 16, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
            <div className="md:hidden w-[200px] h-[200px] opacity-80">
              <Lottie
                animationData={swipeGestureAnimation}
                loop
                autoplay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
      </div>
    </section>
  )
}
