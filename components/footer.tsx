"use client"

import Link from "next/link"
import { Sparkles, Instagram, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const footerLinks = {
  loja: [
    { label: "Cristais", href: "#" },
    { label: "Velas", href: "#" },
    { label: "Incensos", href: "#" },
    { label: "Oráculos", href: "#" },
  ],
  consultas: [
    { label: "Tarot", href: "#" },
    { label: "Baralho Cigano", href: "#" },
    { label: "Sessão Completa", href: "#" },
    { label: "Agendar", href: "#" },
  ],
  suporte: [
    { label: "FAQ", href: "#" },
    { label: "Contato", href: "#" },
    { label: "Política de Privacidade", href: "#" },
    { label: "Termos de Uso", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-border/30">
      {/* Newsletter Section */}
      <div className="bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-light text-foreground">
                Receba <span className="italic text-gold">Mensagens</span> Especiais
              </h3>
              <p className="mt-2 text-muted-foreground font-sans">
                Novidades, promoções exclusivas e insights espirituais semanais.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="px-5 py-3 bg-background border border-border rounded-lg text-foreground font-sans placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 w-full sm:w-72"
              />
              <Button className="bg-gold text-background hover:bg-gold/90 font-sans tracking-wider whitespace-nowrap">
                Inscrever-se
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-gold transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gold/20 blur-xl animate-pulse-glow" />
              </div>
              <span className="text-2xl font-light tracking-[0.2em] text-foreground">
                TSARA
              </span>
            </Link>
            <p className="mt-6 text-muted-foreground font-sans leading-relaxed max-w-sm">
              Sabedoria ancestral para iluminar sua jornada. Consultas de Tarot, 
              Baralho Cigano e artigos esotéricos selecionados com amor.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-gold/20 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-gold/20 hover:text-gold transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-gold/20 hover:text-gold transition-colors"
                aria-label="E-mail"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-foreground mb-6">
              Loja
            </h4>
            <ul className="space-y-3">
              {footerLinks.loja.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-muted-foreground font-sans hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-foreground mb-6">
              Consultas
            </h4>
            <ul className="space-y-3">
              {footerLinks.consultas.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-muted-foreground font-sans hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-foreground mb-6">
              Suporte
            </h4>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-muted-foreground font-sans hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-sans">
            © 2024 Tsara. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground font-sans">
            Feito com <span className="text-gold">✦</span> para iluminar caminhos
          </p>
        </div>
      </div>
    </footer>
  )
}
