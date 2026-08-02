"use client"

import { useEffect, useState, type ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  ShoppingCart,
  Calendar,
  User,
  LogOut,
  Settings,
  ChevronRight,
  Home,
  Store,
  Sparkles,
  GraduationCap,
  Heart,
  type LucideProps,
} from "lucide-react"
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

const MOBILE_NAV = [
  { href: "/", label: "Início", icon: Home },
  { href: "/produtos", label: "Loja", icon: Store },
  { href: "/consultas", label: "Consultas", icon: Sparkles },
  { href: "/cursos", label: "Cursos", icon: GraduationCap },
  { href: "#depoimentos", label: "Depoimentos", icon: Heart },
] as const

type IconType = ComponentType<LucideProps>

function MobileMenuLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
  className,
}: {
  href: string
  label: string
  icon: IconType
  active?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors duration-200 ${
        active
          ? "border-gold/30 bg-gold/10 text-gold"
          : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-secondary/60 hover:text-foreground"
      } ${className ?? ""}`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 transition-colors ${active ? "text-gold" : "text-muted-foreground group-hover:text-gold"}`}
      />
      <span className={`font-sans text-base ${active ? "font-medium text-gold" : ""}`}>{label}</span>
      {active ? (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
      ) : (
        <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-muted" />
      )}
    </Link>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 px-1 font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-gold-muted">
      {children}
    </p>
  )
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    toast.success("Você saiu da sua conta.")
  }

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : href.startsWith("#") ? false : pathname.startsWith(href)

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

          <div className="hidden md:flex items-center gap-8">
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
                <DropdownMenuContent align="end" className="w-48 mb-4">
                  <DropdownMenuItem asChild>
                    <Link href="/conta" className="gap-2 cursor-pointer"><User className="w-4 h-4" /> Minha Conta</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/minhas-consultas" className="gap-2 cursor-pointer"><Calendar className="w-4 h-4" /> Minhas Consultas</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/meus-pedidos" className="gap-2 cursor-pointer"><ShoppingCart className="w-4 h-4" /> Meus Pedidos</Link>
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
                <ShoppingCart className="w-5 h-5" />
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

          <div className="flex md:hidden items-center gap-1">
            <Link href="/carrinho" className="relative p-2 text-foreground hover:text-gold transition-colors" aria-label="Carrinho">
              <ShoppingCart className="w-5 h-5" />
              {hydrated && itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-gold text-background text-[10px] font-bold font-sans w-4.5 h-4.5 min-w-[18px] rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
            <button
              className="p-2 text-foreground hover:text-gold transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed inset-0 z-40 md:hidden bg-background/95 backdrop-blur-xl stars-pattern"
            >
              <div className="h-dvh overflow-y-auto overscroll-contain px-6 pt-28 pb-10">
                <div className="mx-auto max-w-md">
                  {user && (
                    <Link
                      href="/conta"
                      onClick={() => setIsOpen(false)}
                      className="mb-8 flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-gold/30"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-sm font-bold text-gold bg-gold/20">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="truncate font-sans text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  )}

                  <div className="mb-8">
                    <SectionLabel>Navegação</SectionLabel>
                    <div className="flex flex-col gap-1.5">
                      {MOBILE_NAV.map((link, index) => (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + index * 0.05 }}
                        >
                          <MobileMenuLink
                            href={link.href}
                            label={link.label}
                            icon={link.icon}
                            active={isActive(link.href)}
                            onClick={() => setIsOpen(false)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <SectionLabel>{user ? "Conta" : "Acesso"}</SectionLabel>
                    <div className="flex flex-col gap-1.5">
                      {user ? (
                        <>
                          <MobileMenuLink href="/conta" label="Minha Conta" icon={User} active={isActive("/conta")} onClick={() => setIsOpen(false)} />
                          <MobileMenuLink href="/minhas-consultas" label="Minhas Consultas" icon={Calendar} active={isActive("/minhas-consultas")} onClick={() => setIsOpen(false)} />
                          <MobileMenuLink href="/meus-pedidos" label="Meus Pedidos" icon={ShoppingCart} active={isActive("/meus-pedidos")} onClick={() => setIsOpen(false)} />
                          {user.role === "admin" && (
                            <MobileMenuLink href="/admin" label="Admin" icon={Settings} active={isActive("/admin")} onClick={() => setIsOpen(false)} />
                          )}
                          <button
                            onClick={() => {
                              setIsOpen(false)
                              handleLogout()
                            }}
                            className="group flex items-center gap-4 rounded-xl border border-transparent px-4 py-3.5 font-sans text-base text-red-400 transition-colors duration-200 hover:border-red-500/30 hover:bg-red-500/10"
                          >
                            <LogOut className="h-5 w-5 shrink-0 transition-colors group-hover:text-red-400" />
                            Sair
                          </button>
                        </>
                      ) : (
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full h-12 border-border text-foreground hover:bg-gold/10 hover:border-gold/50 font-sans">
                            <User className="w-4 h-4" /> Entrar / Criar conta
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3 pt-2"
                  >
                    <Link href="/carrinho" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="relative w-full h-12 border-gold/50 text-gold hover:bg-gold/10 font-sans">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Carrinho
                        {hydrated && itemCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-gold text-background text-[10px] font-bold font-sans w-5 h-5 rounded-full flex items-center justify-center">
                            {itemCount > 9 ? "9+" : itemCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                    <Link href="/agendamento" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button className="w-full h-12 bg-gold text-background hover:bg-gold/90 font-sans">
                        <Calendar className="w-4 h-4 mr-2" /> Agendar
                      </Button>
                    </Link>
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
