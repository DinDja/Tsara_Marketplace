"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  Plus, MoreVertical, Edit, Trash2, Image as ImageIcon, Clock,
} from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAsyncData } from "@/lib/hooks/useAsync"
import { getConsultationTypes, createConsultationType, updateConsultationType, deleteConsultationType } from "@/lib/services/consultations"
import type { ConsultationType } from "@/lib/services/consultations"
import { fileToBase64 } from "@/lib/image"
import { SkeletonTable } from "@/components/ui/data-skeleton"
import { toast } from "sonner"

const defaultForm = {
  name: "", duration: "60 min", price: 0, originalPrice: 0,
  description: "", features: [""], popular: false, icon: "✦", image: "",
}

export default function AdminConsultas() {
  const { data: types, loading, refetch } = useAsyncData(getConsultationTypes, [])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ConsultationType | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const resetForm = () => { setForm(defaultForm); setEditing(null) }

  const openEdit = (t: ConsultationType) => {
    setEditing(t)
    setForm({
      name: t.name, duration: t.duration, price: t.price,
      originalPrice: t.originalPrice ?? 0, description: t.description,
      features: t.features.length ? t.features : [""],
      popular: t.popular, icon: t.icon, image: t.image ?? "",
    })
    setOpen(true)
  }

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await fileToBase64(file)
    setForm((f) => ({ ...f, image: b64 }))
  }

  const addFeature = () => setForm((f) => ({ ...f, features: [...f.features, ""] }))
  const updateFeature = (i: number, v: string) => {
    const features = [...form.features]; features[i] = v; setForm((f) => ({ ...f, features }))
  }
  const removeFeature = (i: number) => {
    if (form.features.length <= 1) return
    setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))
  }

  const handleSave = async () => {
    if (!form.name || form.price <= 0) { toast.error("Preencha nome e preço"); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        originalPrice: form.originalPrice > 0 ? form.originalPrice : undefined,
        features: form.features.filter(Boolean),
      }
      if (editing) {
        await updateConsultationType(editing.id, payload)
        toast.success("Tipo de consulta atualizado!")
      } else {
        await createConsultationType(payload as any)
        toast.success("Tipo de consulta criado!")
      }
      setOpen(false); resetForm(); refetch()
    } catch { toast.error("Erro ao salvar") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    try { await deleteConsultationType(id); toast.success(`${name} excluído`); refetch() }
    catch { toast.error("Erro ao excluir") }
  }

  const icons = ["✦", "🃏", "🔮", "✨", "⭐", "🌙", "☀️", "🔥", "💎", "🌸"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tipos de Consulta</h1>
          <p className="text-sm font-sans text-muted-foreground">Gerencie os tipos de agendamento disponíveis</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 font-sans gap-2">
              <Plus className="w-4 h-4" /> Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Novo"} Tipo de Consulta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-sans">Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Tarot Terapêutico" className="font-sans bg-input/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-sans">Duração</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="60 min" className="font-sans bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Preço (R$)</Label>
                  <Input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="font-sans bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Preço original (opcional)</Label>
                  <Input type="number" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} className="font-sans bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Ícone</Label>
                  <div className="flex flex-wrap gap-2">
                    {icons.map((ic) => (
                      <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-colors ${form.icon === ic ? "border-primary bg-primary/10" : "border-border bg-secondary/30"}`}
                      >{ic}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="font-sans bg-input/50 min-h-20" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Características</Label>
                {form.features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={f} onChange={(e) => updateFeature(i, e.target.value)} placeholder="Ex: Leitura completa de 10 cartas" className="font-sans bg-input/50 flex-1" />
                    <Button variant="outline" size="icon" onClick={() => removeFeature(i)} className="shrink-0">×</Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={addFeature} className="text-primary font-sans">+ Adicionar característica</Button>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.popular} onCheckedChange={(v) => setForm({ ...form, popular: v })} />
                <Label className="font-sans">Marcar como "Mais popular"</Label>
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Imagem</Label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <div className="flex gap-3 items-center">
                  <Button variant="outline" type="button" onClick={() => fileRef.current?.click()} className="font-sans gap-2">
                    <ImageIcon className="w-4 h-4" /> {form.image ? "Trocar imagem" : "Selecionar imagem"}
                  </Button>
                  {form.image && (
                    <button type="button" onClick={() => setForm({ ...form, image: "" })} className="text-xs text-red-400 font-sans hover:underline">Remover</button>
                  )}
                </div>
                {form.image && (
                  <img src={form.image} alt="preview" className="w-32 h-20 object-cover rounded-lg border border-border mt-2" />
                )}
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 font-sans">
                {saving ? "Salvando..." : editing ? "Atualizar" : "Criar"} Tipo de Consulta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6"><SkeletonTable rows={4} cols={5} /></div>
            ) : types.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-sans">
                Nenhum tipo de consulta cadastrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Duração</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Preço</th>
                      <th className="text-center py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Popular</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {types.map((t) => (
                      <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{t.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-foreground">{t.name}</p>
                              <p className="text-xs font-sans text-muted-foreground line-clamp-1">{t.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t.duration}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-sans font-medium text-foreground">R$ {t.price.toFixed(2).replace(".", ",")}</span>
                          {t.originalPrice && <span className="text-xs text-muted-foreground line-through ml-1">R$ {t.originalPrice.toFixed(2).replace(".", ",")}</span>}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {t.popular ? <MoonIcon className="w-4 h-4 text-yellow-500 inline" /> : <span className="text-muted-foreground text-xs font-sans">—</span>}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => openEdit(t)}>
                                <Edit className="w-4 h-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-red-500" onClick={() => handleDelete(t.id, t.name)}>
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
