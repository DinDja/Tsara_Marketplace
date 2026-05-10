"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingBag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M21.752 15.002A9.718 9.718 0 0112.478 22c-5.385 0-9.75-4.365-9.75-9.75 0-4.52 3.073-8.322 7.244-9.422a.75.75 0 01.966.906 8.25 8.25 0 0010.728 10.728.75.75 0 01.906.966c-.07.233-.15.463-.24.69-.08.203-.16.403-.25.6l-.33-.016z" 
        fill="currentColor"
      />
      <circle cx="18" cy="5" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="8" r="0.5" fill="currentColor" opacity="0.4" />
      <circle cx="15" cy="3" r="0.5" fill="currentColor" opacity="0.5" />
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
