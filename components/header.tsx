"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingBag, Calendar, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useCart } from "@/lib/contexts/cart-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { NAV_LINKS } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { MoonIcon } from "@/components/moon-icon"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const { itemCount } = useCart()
  const { user, logout } = useAuth()

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = originalOverflow }
  }, [isOpen])

  const handleLogout = async () => {
    await logout()
    toast.success("Você saiu da sua conta.")
  }

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-b border-border/50" />

      <nav className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="relative z-50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <MoonIcon className="w-9 h-9 text-gold transition-transform group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-gold/20 blur-xl animate-pulse-glow" />
            </div>
            <span className="text-2xl md:text-3xl font-light tracking-[0.2em] text-foreground">TSARA</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-gold transition-colors duration-300">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border hover:border-gold/30 transition-colors">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-[10px] font-bold text-gold bg-gold/20">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-sans text-foreground max-w-24 truncate">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/conta" className="gap-2 cursor-pointer"><User className="w-4 h-4" /> Minha Conta</Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="gap-2 cursor-pointer"><Settings className="w-4 h-4" /> Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-500 cursor-pointer">
                    <LogOut className="w-4 h-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="text-foreground hover:text-gold hover:bg-gold/10 font-sans text-sm">Entrar</Button>
              </Link>
            )}
            <Link href="/carrinho" className="relative">
              <Button variant="ghost" size="icon" className="text-foreground hover:text-gold hover:bg-gold/10 relative">
                <ShoppingBag className="w-5 h-5" />
                {hydrated && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold text-background text-[10px] font-bold font-sans w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
                <span className="sr-only">Carrinho</span>
              </Button>
            </Link>
            <Link href="/agendamento">
              <Button className="bg-gold text-background hover:bg-gold/90 tracking-wider font-sans text-sm">
                <Calendar className="w-4 h-4 mr-2" /> Agendar
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden bg-background/95 backdrop-blur-lg">
              <div className="h-full overflow-y-auto px-6 pt-28 pb-8">
                <div className="mx-auto flex min-h-full max-w-sm flex-col justify-between">
                  <div className="space-y-6">
                    {NAV_LINKS.map((link, index) => (
                      <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}>
                        <Link href={link.href} className="block py-2 text-2xl tracking-[0.1em] text-muted-foreground hover:text-gold transition-colors" onClick={() => setIsOpen(false)}>
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-10 space-y-3">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 px-2 mb-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-sm font-bold text-gold bg-gold/20">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs font-sans text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Link href="/conta" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full border-border text-foreground hover:bg-gold/10 justify-start gap-2">
                            <User className="w-4 h-4" /> Minha Conta
                          </Button>
                        </Link>
                        {user.role === "admin" && (
                          <Link href="/admin" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" className="w-full border-border text-foreground hover:bg-gold/10 justify-start gap-2">
                              <Settings className="w-4 h-4" /> Admin
                            </Button>
                          </Link>
                        )}
                        <Button variant="outline" onClick={() => { handleLogout(); setIsOpen(false); }}
                          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 justify-start gap-2">
                          <LogOut className="w-4 h-4" /> Sair
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full border-border text-foreground hover:bg-gold/10 hover:border-gold/50">Entrar</Button>
                      </Link>
                    )}
                    <div className="flex gap-3">
                      <Link href="/carrinho" className="flex-1" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full border-gold/50 text-gold hover:bg-gold/10">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Carrinho{hydrated && itemCount > 0 && ` (${itemCount})`}
                        </Button>
                      </Link>
                      <Link href="/agendamento" className="flex-1" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gold text-background hover:bg-gold/90">
                          <Calendar className="w-4 h-4 mr-2" /> Agendar
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
