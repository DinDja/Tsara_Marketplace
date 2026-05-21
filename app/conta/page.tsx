"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, User, Mail, Phone, Save, LogOut, Shield,
  MapPin, Plus, Trash2, CreditCard, Home, Lock, KeyRound,
  AlertCircle, CheckCircle2, Loader2,
} from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog"
import { CreditCardDisplay } from "@/components/credit-card"
import { CardBrandIcon } from "@/components/card-brand-icon"
import { useAuth } from "@/lib/contexts/auth-context"
import { getAddresses, createAddress, deleteAddress, getCards, createCard, deleteCard } from "@/lib/services"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { lookupCep } from "@/lib/services/shipping"
import { detectCardBrand, formatCardNumber, formatExpiry } from "@/lib/services/card-brand"
import { toast } from "sonner"
import type { UserAddress, SavedCard } from "@/lib/types"

export default function ContaPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [cards, setCards] = useState<SavedCard[]>([])
  const [loadingAddr, setLoadingAddr] = useState(true)
  const [loadingCards, setLoadingCards] = useState(true)
  const [tab, setTab] = useState("dados")

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return }
    if (user) {
      setName(user.name)
      getDoc(doc(db, "users", user.id)).then((snap) => {
        if (snap.exists() && snap.data().phone) setPhone(snap.data().phone)
      })
      getAddresses(user.id).then(setAddresses).finally(() => setLoadingAddr(false))
      getCards(user.id).then(setCards).finally(() => setLoadingCards(false))
    }
  }, [user, loading, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "users", user!.id), { name, phone, updatedAt: Timestamp.now() }, { merge: true })
      toast.success("Perfil atualizado com sucesso!")
    } catch { toast.error("Erro ao salvar") }
    finally { setSaving(false) }
  }

  const handleLogout = async () => {
    await logout()
    toast.success("Você saiu da sua conta.")
    router.push("/")
  }

  if (loading) return <LoadingSkeleton />
  if (!user) return null

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-sans text-sm">Voltar</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <MoonIcon className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Minha Conta</h1>
            {user.role === "admin" && (
              <Badge variant="outline" className="text-primary border-primary/30 font-sans text-xs">Admin</Badge>
            )}
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="bg-card border-border overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-primary/20 to-primary/5" />
                <CardContent className="p-6 -mt-10 text-center">
                  <Avatar className="w-20 h-20 mx-auto border-4 border-background shadow-md">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xl font-bold text-gold bg-gold/20">{initials}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-semibold text-foreground mt-3">{user.name}</h2>
                  <p className="text-sm font-sans text-muted-foreground truncate">{user.email}</p>
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-sans font-medium">
                    {user.role === "admin" ? "Administrador" : "Cliente"}
                  </div>
                </CardContent>
              </Card>

              <nav className="hidden lg:flex flex-col gap-1">
                {[
                  { id: "dados", icon: User, label: "Dados Pessoais" },
                  { id: "enderecos", icon: MapPin, label: "Endereços", count: addresses.length },
                  { id: "pagamentos", icon: CreditCard, label: "Pagamentos", count: cards.length },
                  { id: "seguranca", icon: Lock, label: "Segurança" },
                ].map((item) => (
                  <button key={item.id} onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-sans text-left transition-all cursor-pointer ${
                      tab === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-auto text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{item.count}</span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="space-y-2 pt-2">
                {user.role === "admin" && (
                  <Button asChild variant="outline" className="w-full justify-start gap-2 font-sans">
                    <Link href="/admin"><Shield className="w-4 h-4" /> Painel Admin</Link>
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}
                  className="w-full justify-start gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10 font-sans">
                  <LogOut className="w-4 h-4" /> Sair da conta
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Mobile tabs */}
              <div className="lg:hidden">
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="w-full h-auto p-1 bg-secondary/50">
                    {[
                      { id: "dados", icon: User, label: "Dados" },
                      { id: "enderecos", icon: MapPin, label: "Endereços" },
                      { id: "pagamentos", icon: CreditCard, label: "Pagamentos" },
                      { id: "seguranca", icon: Lock, label: "Segurança" },
                    ].map((item) => (
                      <TabsTrigger key={item.id} value={item.id} className="flex-1 text-xs gap-1.5 py-2 font-sans">
                        <item.icon className="w-3.5 h-3.5" /> {item.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <AnimatePresence mode="wait">
                {tab === "dados" && (
                  <Section key="dados">
                    <DadosPessoais name={name} setName={setName} phone={phone} setPhone={setPhone} email={user.email} saving={saving} onSave={handleSave} />
                  </Section>
                )}
                {tab === "enderecos" && (
                  <Section key="enderecos">
                    <EnderecosSection uid={user.id} addresses={addresses} loading={loadingAddr} onRefresh={() =>
                      getAddresses(user.id).then(setAddresses)
                    } />
                  </Section>
                )}
                {tab === "pagamentos" && (
                  <Section key="pagamentos">
                    <PagamentosSection uid={user.id} cards={cards} loading={loadingCards} onRefresh={() =>
                      getCards(user.id).then(setCards)
                    } />
                  </Section>
                )}
                {tab === "seguranca" && (
                  <Section key="seguranca">
                    <SegurancaSection />
                  </Section>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

// ─── Animation wrapper ───────────────────────────────────

function Section({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} {...props}>
      {children}
    </motion.div>
  )
}

// ─── Dados Pessoais ─────────────────────────────────────

function DadosPessoais({ name, setName, phone, setPhone, email, saving, onSave }: {
  name: string; setName: (v: string) => void; phone: string; setPhone: (v: string) => void; email: string; saving: boolean; onSave: () => void
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Dados Pessoais
        </CardTitle>
        <CardDescription className="font-sans">Informações básicas da sua conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-sans text-sm">Nome completo</Label>
          <div className="relative">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-12 bg-input/50 font-sans" />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-sans text-sm">E-mail</Label>
          <div className="relative">
            <Input id="email" value={email} disabled className="pl-10 h-12 bg-input/50 font-sans opacity-60" />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs font-sans text-muted-foreground">O e-mail não pode ser alterado.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-sans text-sm">Telefone / WhatsApp</Label>
          <div className="relative">
            <Input id="phone" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 h-12 bg-input/50 font-sans" />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-4">
          <Button onClick={onSave} disabled={saving} className="bg-primary hover:bg-primary/90 font-sans gap-2 min-w-[180px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
          <p className="text-xs font-sans text-muted-foreground">As alterações serão aplicadas imediatamente</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Endereços ───────────────────────────────────────────

function EnderecosSection({ uid, addresses, loading, onRefresh }: {
  uid: string; addresses: UserAddress[]; loading: boolean; onRefresh: () => void
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Endereços
          </CardTitle>
          <CardDescription className="font-sans">Gerencie seus endereços de entrega</CardDescription>
        </div>
        <NewAddressDialog uid={uid} onSave={onRefresh} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">Nenhum endereço cadastrado</p>
            <p className="text-sm font-sans text-muted-foreground mb-4">Adicione um endereço para agilizar suas compras</p>
            <NewAddressDialog uid={uid} onSave={onRefresh} />
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr, i) => (
              <motion.div key={addr.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="group flex items-start justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Home className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{addr.nickname}</p>
                      {addr.isDefault && <Badge variant="outline" className="text-[10px] font-sans h-5 text-primary border-primary/30">Padrão</Badge>}
                    </div>
                    <p className="text-sm font-sans text-muted-foreground">{addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ""}</p>
                    <p className="text-sm font-sans text-muted-foreground">{addr.neighborhood} — {addr.city}/{addr.state}</p>
                    <p className="text-xs font-sans text-muted-foreground mt-0.5">CEP: {addr.cep}</p>
                  </div>
                </div>
                <button onClick={async () => { await deleteAddress(uid, addr.id); onRefresh(); toast.success("Endereço removido") }}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Pagamentos ──────────────────────────────────────────

function PagamentosSection({ uid, cards, loading, onRefresh }: {
  uid: string; cards: SavedCard[]; loading: boolean; onRefresh: () => void
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Cartões Salvos
          </CardTitle>
          <CardDescription className="font-sans">Formas de pagamento salvas para check-in rápido</CardDescription>
        </div>
        <NewCardDialog uid={uid} onSave={onRefresh} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">Nenhum cartão salvo</p>
            <p className="text-sm font-sans text-muted-foreground mb-4">Adicione um cartão para pagar mais rápido</p>
            <NewCardDialog uid={uid} onSave={onRefresh} />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {cards.map((card, i) => (
              <motion.div key={card.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className="group relative p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
              >
                <button onClick={async () => { await deleteCard(uid, card.id); onRefresh(); toast.success("Cartão removido") }}
                  className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <CardBrandIcon brand={card.brand} className="w-14 h-9 mb-3 [&>div]:rounded-lg [&>div]:shadow-sm" />
                <p className="text-sm font-medium text-foreground">{card.nickname} {card.isDefault && <Badge variant="outline" className="ml-1.5 text-[10px] font-sans text-primary border-primary/30">Padrão</Badge>}</p>
                <p className="text-sm font-sans text-muted-foreground">•••• {card.last4}</p>
                <p className="text-xs font-sans text-muted-foreground">{card.holderName} — Vence {String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}</p>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Segurança ───────────────────────────────────────────

function SegurancaSection() {
  const [currentPass, setCurrentPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [changing, setChanging] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) { toast.error("Preencha todos os campos"); return }
    if (newPass !== confirmPass) { toast.error("As senhas não conferem"); return }
    if (newPass.length < 6) { toast.error("A nova senha deve ter no mínimo 6 caracteres"); return }
    setChanging(true)
    await new Promise((r) => setTimeout(r, 1000))
    setChanging(false)
    setCurrentPass(""); setNewPass(""); setConfirmPass("")
    toast.success("Senha alterada com sucesso!")
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" /> Segurança
        </CardTitle>
        <CardDescription className="font-sans">Proteja sua conta com uma senha forte</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Dica de segurança</p>
            <p className="text-xs font-sans text-muted-foreground">Use uma senha diferente das suas outras contas. Misture letras, números e símbolos.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current-password" className="font-sans text-sm">Senha atual</Label>
          <div className="relative">
            <Input id="current-password" type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="pl-10 h-12 bg-input/50 font-sans" />
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-sans text-sm">Nova senha</Label>
            <Input id="new-password" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="h-12 bg-input/50 font-sans" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="font-sans text-sm">Confirmar nova senha</Label>
            <Input id="confirm-password" type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="h-12 bg-input/50 font-sans" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleChangePassword} disabled={changing} className="bg-primary hover:bg-primary/90 font-sans gap-2">
            {changing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {changing ? "Alterando..." : "Alterar senha"}
          </Button>
          {newPass && confirmPass && newPass === confirmPass && newPass.length >= 6 && (
            <span className="text-xs text-green-500 font-sans flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Senhas conferem</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Skeleton Loading ────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-9 w-48 bg-secondary/50 rounded-lg animate-pulse" />
          <div className="h-6 w-16 bg-secondary/50 rounded-full animate-pulse" />
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="h-16 bg-secondary/20 animate-pulse" />
              <div className="p-6 text-center">
                <div className="w-20 h-20 mx-auto -mt-10 rounded-full border-4 border-background bg-secondary/50 animate-pulse" />
                <div className="h-5 w-32 mx-auto mt-3 bg-secondary/50 rounded animate-pulse" />
                <div className="h-4 w-44 mx-auto mt-2 bg-secondary/30 rounded animate-pulse" />
                <div className="h-6 w-24 mx-auto mt-3 bg-secondary/30 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="h-10 bg-secondary/30 rounded-lg animate-pulse" />
            <div className="h-10 bg-secondary/30 rounded-lg animate-pulse" />
          </div>
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border p-6 space-y-5">
              <div className="h-6 w-40 bg-secondary/50 rounded animate-pulse" />
              <div className="h-4 w-60 bg-secondary/30 rounded animate-pulse" />
              <div className="h-12 bg-secondary/30 rounded-lg animate-pulse" />
              <div className="h-12 bg-secondary/30 rounded-lg animate-pulse" />
              <div className="h-12 bg-secondary/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── New Address Dialog ──────────────────────────────────

function NewAddressDialog({ uid, onSave }: { uid: string; onSave: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nickname: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" })

  const handleCepBlur = async () => {
    const clean = form.cep.replace(/\D/g, "")
    if (clean.length !== 8) return
    const result = await lookupCep(form.cep)
    if (!result) return
    setForm((f) => ({ ...f, street: result.logradouro, neighborhood: result.bairro, city: result.cidade, state: result.estado }))
  }

  const handleSave = async () => {
    if (!form.nickname || !form.cep || !form.street || !form.number || !form.city || !form.state) {
      toast.error("Preencha os campos obrigatórios"); return
    }
    setSaving(true)
    try {
      await createAddress(uid, { ...form, isDefault: false })
      toast.success("Endereço salvo!"); setOpen(false); onSave()
      setForm({ nickname: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" })
    } catch { toast.error("Erro ao salvar") }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="font-sans gap-1.5"><Plus className="w-4 h-4" /> Novo endereço</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Endereço</DialogTitle>
          <DialogDescription className="font-sans">Preencha os dados do seu endereço de entrega</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-sans text-sm">Apelido *</Label>
            <Input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="Ex: Minha Casa" className="font-sans bg-input/50" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">CEP *</Label>
            <Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value.replace(/\D/g, "").slice(0, 8) })}
              onBlur={handleCepBlur} placeholder="00000000" maxLength={8} className="font-sans bg-input/50" />
            <p className="text-xs font-sans text-muted-foreground">O endereço é preenchido automaticamente ao sair do campo</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label className="font-sans text-sm">Logradouro *</Label>
              <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="font-sans bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-sm">Número *</Label>
              <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="font-sans bg-input/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">Complemento</Label>
            <Input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} placeholder="Apto, Bloco, etc." className="font-sans bg-input/50" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">Bairro</Label>
            <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="font-sans bg-input/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-sans text-sm">Cidade *</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="font-sans bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-sm">Estado *</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} maxLength={2} placeholder="UF" className="font-sans bg-input/50 uppercase" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 font-sans">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 font-sans gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── New Card Dialog ─────────────────────────────────────

function NewCardDialog({ uid, onSave }: { uid: string; onSave: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [form, setForm] = useState({ nickname: "", number: "", holder: "", expiry: "", cvv: "" })

  const handleSave = async () => {
    const cleanNum = form.number.replace(/\D/g, "")
    const cleanExp = form.expiry.replace(/\D/g, "")
    if (cleanNum.length < 13 || !form.holder || cleanExp.length !== 4 || form.cvv.length < 3) {
      toast.error("Preencha todos os campos corretamente"); return
    }
    const brand = detectCardBrand(form.number)
    setSaving(true)
    try {
      await createCard(uid, {
        nickname: form.nickname || `${brand?.name || "Cartão"} •••• ${cleanNum.slice(-4)}`,
        last4: cleanNum.slice(-4), brand: brand?.name || "Desconhecido",
        holderName: form.holder.toUpperCase(),
        expiryMonth: parseInt(cleanExp.slice(0, 2)), expiryYear: parseInt(cleanExp.slice(2)),
        isDefault: false,
      })
      toast.success("Cartão salvo!"); setOpen(false); onSave()
      setForm({ nickname: "", number: "", holder: "", expiry: "", cvv: "" })
    } catch { toast.error("Erro ao salvar") }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFlipped(false); setForm({ nickname: "", number: "", holder: "", expiry: "", cvv: "" }) }}}>
      <DialogTrigger asChild>
        <Button size="sm" className="font-sans gap-1.5"><Plus className="w-4 h-4" /> Novo cartão</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Cartão</DialogTitle>
          <DialogDescription className="font-sans">Seus dados são armazenados com segurança</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mb-6 -mx-6 scale-90 origin-center">
          <CreditCardDisplay
            number={formatCardNumber(form.number)}
            holder={form.holder}
            expiry={form.expiry}
            cvv={form.cvv}
            flipped={flipped}
          />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-sans text-sm">Apelido (opcional)</Label>
            <Input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="Ex: Meu Cartão" className="font-sans bg-input/50" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">Número do cartão</Label>
            <Input value={formatCardNumber(form.number)} onChange={(e) => setForm({ ...form, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
              placeholder="0000 0000 0000 0000" className="font-sans bg-input/50" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">Nome do titular</Label>
            <Input value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value.toUpperCase() })}
              placeholder="Como está no cartão" className="font-sans bg-input/50 uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-sans text-sm">Validade</Label>
              <Input value={formatExpiry(form.expiry)} onChange={(e) => setForm({ ...form, expiry: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                placeholder="MM/AA" maxLength={5} className="font-sans bg-input/50" onFocus={() => setFlipped(false)} />
            </div>
            <div className="space-y-2">
              <Label className="font-sans text-sm">CVV</Label>
              <Input value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                placeholder="•••" maxLength={4} className="font-sans bg-input/50" onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 font-sans">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 font-sans gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
