"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingBag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
    >
      <path d="M22.1602 13.9363C20.6605 14.5378 18.795 14.7112 17.212 14.3871C15.629 14.0629 14.1761 13.281 13.0336 12.1384C11.891 10.9959 11.1091 9.54296 10.7849 7.95999C10.4608 6.37703 10.6086 4.73371 11.21 3.234C11.2456 3.10265 11.2448 2.96409 11.2076 2.83317C11.1705 2.70225 11.0984 2.5839 10.9992 2.4908C10.8999 2.39771 10.7772 2.33337 10.6442 2.30469C10.5111 2.27601 10.3728 2.28407 10.244 2.328C6.073 3.428 3 7.23 3 11.75C3 17.135 7.365 21.5 12.75 21.5C14.8434 21.488 16.8769 20.8004 18.5479 19.5395C20.2189 18.2785 21.4381 16.5117 22.024 14.502L22.1602 13.9363Z" fill="currentColor" />
      <path opacity="0.6" d="M18 6C18.5523 6 19 5.55228 19 5C19 4.44772 18.5523 4 18 4C17.4477 4 17 4.44772 17 5C17 5.55228 17.4477 6 18 6Z" fill="currentColor" />
      <path opacity="0.4" d="M20 8.5C20.2761 8.5 20.5 8.27614 20.5 8C20.5 7.72386 20.2761 7.5 20 7.5C19.7239 7.5 19.5 7.72386 19.5 8C19.5 8.27614 19.7239 8.5 20 8.5Z" fill="currentColor" />
      <path opacity="0.5" d="M15 3.5C15.2761 3.5 15.5 3.27614 15.5 3C15.5 2.72386 15.2761 2.5 15 2.5C14.7239 2.5 14.5 2.72386 14.5 3C14.5 3.27614 14.7239 3.5 15 3.5Z" fill="currentColor" />
    </svg>
  )
}

const navLinks = [
  { href: "#produtos", label: "Produtos" },
  { href: "#consultas", label: "Consultas" },
  { href: "#sobre", label: "Sobre" },
  { href: "#depoimentos", label: "Depoimentos" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-b border-border/50" />

      <nav className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <MoonIcon className="w-9 h-9 text-gold transition-transform group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-gold/20 blur-xl animate-pulse-glow" />
            </div>
            <span className="text-2xl md:text-3xl font-light tracking-[0.2em] text-foreground">
              TSARA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-gold transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-foreground hover:text-gold hover:bg-gold/10 font-sans text-sm"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/carrinho">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-gold hover:bg-gold/10"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="sr-only">Carrinho</span>
              </Button>
            </Link>
            <Link href="/agendamento">
              <Button
                className="bg-gold text-background hover:bg-gold/90 tracking-wider font-sans text-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-6 space-y-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-2 text-lg tracking-[0.1em] text-muted-foreground hover:text-gold transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 space-y-3"
                >
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-gold/10 hover:border-gold/50"
                    >
                      Entrar
                    </Button>
                  </Link>
                  <div className="flex gap-3">
                    <Link href="/carrinho" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-gold/50 text-gold hover:bg-gold/10"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Carrinho
                      </Button>
                    </Link>
                    <Link href="/agendamento" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button
                        className="w-full bg-gold text-background hover:bg-gold/90"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
