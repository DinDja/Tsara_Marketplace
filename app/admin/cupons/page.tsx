"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus, Tag, Percent, Trash2, Copy, Calendar, DollarSign,
  CheckCircle2, XCircle, Search,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SkeletonTable } from "@/components/ui/data-skeleton"
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/services"
import { toast } from "sonner"
import type { Coupon } from "@/lib/types"

const emptyForm = {
  code: "", discount: 10, minPurchase: 0, maxUses: 0,
  usedCount: 0, expiresAt: undefined as Date | undefined, active: true,
}

export default function AdminCupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await getCoupons()
    setCoupons(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => { setForm(emptyForm); setEditing(null) }

  const openEdit = (c: Coupon) => {
    setEditing(c)
    setForm({
      code: c.code, discount: c.discount, minPurchase: c.minPurchase ?? 0,
      maxUses: c.maxUses ?? 0, usedCount: c.usedCount, expiresAt: c.expiresAt, active: c.active,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.code.trim() || form.discount <= 0) { toast.error("Código e desconto são obrigatórios"); return }
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        Object.entries({ ...form, minPurchase: form.minPurchase > 0 ? form.minPurchase : undefined, maxUses: form.maxUses > 0 ? form.maxUses : undefined })
          .filter(([, v]) => v !== undefined)
      ) as any
      if (editing) {
        await updateCoupon(editing.id, payload)
        toast.success("Cupom atualizado!")
      } else {
        await createCoupon(payload)
        toast.success("Cupom criado!")
      }
      setOpen(false); resetForm(); load()
    } catch (e) { toast.error("Erro ao salvar: " + (e instanceof Error ? e.message : "desconhecido")) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, code: string) => {
    try { await deleteCoupon(id); toast.success(`Cupom ${code} excluído`); load() }
    catch { toast.error("Erro ao excluir") }
  }

  const copyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); toast.success("Código copiado!") }
    catch { toast.error("Erro ao copiar") }
  }

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))

  const statusBadge = (c: Coupon) => {
    if (!c.active) return <Badge variant="outline" className="bg-secondary text-muted-foreground border-border text-xs font-sans">Inativo</Badge>
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs font-sans">Expirado</Badge>
    if (c.maxUses && c.usedCount >= c.maxUses) return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs font-sans">Esgotado</Badge>
    return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs font-sans">Ativo</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cupons de Desconto</h1>
          <p className="text-sm font-sans text-muted-foreground">Gerencie códigos promocionais</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 font-sans gap-2"><Plus className="w-4 h-4" /> Novo Cupom</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Cupom</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-sans">Código do cupom</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: TSARA10" className="font-sans bg-input/50 uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-sans">Desconto (%)</Label>
                  <Input type="number" value={form.discount || ""} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                    className="font-sans bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Valor mínimo (R$)</Label>
                  <Input type="number" value={form.minPurchase || ""} onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                    className="font-sans bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Usos máximos</Label>
                  <Input type="number" value={form.maxUses || ""} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                    className="font-sans bg-input/50" placeholder="0 = ilimitado" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Data de expiração</Label>
                  <Input type="date" value={form.expiresAt ? form.expiresAt.toISOString().split("T")[0] : ""}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value + "T23:59:59") : undefined })}
                    className="font-sans bg-input/50" />
                </div>
              </div>
              {editing && (
                <div className="space-y-2">
                  <Label className="font-sans">Usado {editing.usedCount}x{editing.maxUses ? ` / ${editing.maxUses}` : ""}</Label>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label className="font-sans">Ativo</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 font-sans">
                {saving ? "Salvando..." : editing ? "Atualizar" : "Criar"} Cupom
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por código..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 font-sans bg-input/50" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {loading ? (<div className="p-6"><SkeletonTable rows={5} cols={6} /></div>) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Código</th>
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Desconto</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Usos</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Valor mín.</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Expira</th>
                      <th className="text-center py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((coupon) => (
                      <tr key={coupon.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary" />
                            <span className="text-sm font-mono font-bold text-foreground">{coupon.code}</span>
                            <button onClick={() => copyCode(coupon.code)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans font-medium text-foreground flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5 text-green-500" /> {coupon.discount}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-sans text-foreground">{coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-sans text-muted-foreground">
                            {coupon.minPurchase ? `R$ ${coupon.minPurchase.toFixed(2).replace(".", ",")}` : "—"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-sans text-muted-foreground flex items-center justify-end gap-1">
                            <Calendar className="w-3 h-3" />
                            {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("pt-BR") : "—"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">{statusBadge(coupon)}</td>
                        <td className="py-4 px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm"><span className="sr-only">Ações</span><span className="block w-1 h-1 rounded-full bg-muted-foreground" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(coupon)}><Tag className="w-4 h-4" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer text-red-500" onClick={() => handleDelete(coupon.id, coupon.code)}>
                                <Trash2 className="w-4 h-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
