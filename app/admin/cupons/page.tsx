"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Plus, Tag, Percent, Trash2, Copy, Calendar, DollarSign,
  Search, ChevronLeft, ChevronRight, X, Package, ShoppingBag,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SkeletonTable } from "@/components/ui/data-skeleton"
import { createCoupon, updateCoupon, deleteCoupon, getProductById } from "@/lib/services"
import { useCouponsPaginated, useConsultationTypes, useProducts } from "@/lib/hooks"
import { formatCouponDiscount, describeCouponConditions } from "@/lib/coupons"
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { toast } from "sonner"
import type { Coupon, CouponDiscountType, CouponScope, ProductCategory } from "@/lib/types"

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.filter((c) => c.id !== "all")

type ProductMini = { id: string; name: string }

interface CouponForm {
  code: string
  discount: number
  discountType: CouponDiscountType
  minPurchase: number
  maxUses: number
  usedCount: number
  expiresAt: Date | undefined
  active: boolean
  scope: CouponScope
  productIds: string[]
  categories: ProductCategory[]
  consultationTypeIds: string[]
  selectedProducts: ProductMini[]
}

const emptyForm: CouponForm = {
  code: "", discount: 10, discountType: "percentage",
  minPurchase: 0, maxUses: 0, usedCount: 0,
  expiresAt: undefined, active: true, scope: "all",
  productIds: [], categories: [], consultationTypeIds: [],
  selectedProducts: [],
}

export default function AdminCupons() {
  const { data: coupons, loading, total, page, hasMore, goToPage, refetch } = useCouponsPaginated(20)
  const { data: consultationTypes } = useConsultationTypes()
  const { data: allProducts } = useProducts()
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState<CouponForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [productSearch, setProductSearch] = useState("")

  const resetForm = () => { setForm(emptyForm); setEditing(null); setProductSearch("") }

  const openEdit = async (c: Coupon) => {
    setEditing(c)
    let selectedProducts: ProductMini[] = []
    if (c.productIds?.length) {
      selectedProducts = await Promise.all(
        c.productIds.map(async (pid) => {
          const p = await getProductById(pid)
          return { id: pid, name: p?.name ?? pid }
        })
      )
    }
    setForm({
      code: c.code,
      discount: c.discount,
      discountType: c.discountType ?? "percentage",
      minPurchase: c.minPurchase ?? 0,
      maxUses: c.maxUses ?? 0,
      usedCount: c.usedCount,
      expiresAt: c.expiresAt,
      active: c.active,
      scope: c.scope ?? "all",
      productIds: c.productIds ?? [],
      categories: (c.categories ?? []) as ProductCategory[],
      consultationTypeIds: c.consultationTypeIds ?? [],
      selectedProducts,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.code.trim() || form.discount <= 0) { toast.error("Código e desconto são obrigatórios"); return }
    setSaving(true)
    try {
      const raw: Record<string, any> = {
        code: form.code.trim().toUpperCase(),
        discount: form.discount,
        discountType: form.discountType,
        scope: form.scope,
        minPurchase: form.minPurchase > 0 ? form.minPurchase : undefined,
        maxUses: form.maxUses > 0 ? form.maxUses : undefined,
        expiresAt: form.expiresAt ?? undefined,
        active: form.active,
        productIds: form.scope !== "appointments" && form.productIds.length > 0 ? form.productIds : undefined,
        categories: form.scope !== "appointments" && form.categories.length > 0 ? form.categories : undefined,
        consultationTypeIds: form.scope !== "products" && form.consultationTypeIds.length > 0 ? form.consultationTypeIds : undefined,
      }
      const payload = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v !== undefined)
      )
      if (editing) {
        await updateCoupon(editing.id, payload)
        toast.success("Cupom atualizado!")
      } else {
        await createCoupon(payload as any)
        toast.success("Cupom criado!")
      }
      setOpen(false); resetForm(); refetch()
    } catch (e) { toast.error("Erro ao salvar: " + (e instanceof Error ? e.message : "desconhecido")) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, code: string) => {
    try { await deleteCoupon(id); toast.success(`Cupom ${code} excluído`); refetch() }
    catch { toast.error("Erro ao excluir") }
  }

  const copyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); toast.success("Código copiado!") }
    catch { toast.error("Erro ao copiar") }
  }

  const toggleCategory = (catId: string) => {
    setForm((prev) => {
      const cats = prev.categories.includes(catId as ProductCategory)
        ? prev.categories.filter((c) => c !== catId)
        : [...prev.categories, catId as ProductCategory]
      return { ...prev, categories: cats }
    })
  }

  const toggleConsultationType = (ctId: string) => {
    setForm((prev) => {
      const ids = prev.consultationTypeIds.includes(ctId)
        ? prev.consultationTypeIds.filter((id) => id !== ctId)
        : [...prev.consultationTypeIds, ctId]
      return { ...prev, consultationTypeIds: ids }
    })
  }

  const addProduct = (p: ProductMini) => {
    if (form.productIds.includes(p.id)) return
    setForm((prev) => ({
      ...prev,
      productIds: [...prev.productIds, p.id],
      selectedProducts: [...prev.selectedProducts, p],
    }))
    setProductSearch("")
  }

  const removeProduct = (pid: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.filter((id) => id !== pid),
      selectedProducts: prev.selectedProducts.filter((p) => p.id !== pid),
    }))
  }

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))

  const filteredProducts = useMemo(() => {
    if (!allProducts) return []
    const q = productSearch.toLowerCase()
    const selected = new Set(form.productIds)
    return allProducts
      .filter((p) => p.name.toLowerCase().includes(q) && !selected.has(p.id))
      .slice(0, 20)
      .map((p) => ({ id: p.id, name: p.name }))
  }, [allProducts, productSearch, form.productIds])

  const consultationTypeNames = useMemo(() => {
    if (!consultationTypes) return undefined
    return new Map(consultationTypes.map((ct) => [ct.id, ct.name]))
  }, [consultationTypes])

  const showProductFilters = form.scope === "all" || form.scope === "products"
  const showConsultFilters = form.scope === "all" || form.scope === "appointments"

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
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Cupom</DialogTitle></DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="font-sans">Código do cupom</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: TSARA10" className="font-sans bg-input/50 uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-sans">Tipo de desconto</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={form.discountType === "percentage" ? "default" : "outline"}
                      size="sm" className="font-sans gap-1 flex-1"
                      onClick={() => setForm({ ...form, discountType: "percentage" })}>
                      <Percent className="w-3.5 h-3.5" /> %
                    </Button>
                    <Button type="button" variant={form.discountType === "fixed" ? "default" : "outline"}
                      size="sm" className="font-sans gap-1 flex-1"
                      onClick={() => setForm({ ...form, discountType: "fixed" })}>
                      <DollarSign className="w-3.5 h-3.5" /> R$
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">{form.discountType === "fixed" ? "Valor do desconto (R$)" : "Desconto (%)"}</Label>
                  <Input type="number" value={form.discount || ""} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                    className="font-sans bg-input/50" min={0} step={form.discountType === "fixed" ? 0.5 : 1} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-sans">Escopo de uso</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={form.scope === "all" ? "default" : "outline"}
                    size="sm" className="font-sans flex-1" onClick={() => setForm({ ...form, scope: "all" })}>Todos</Button>
                  <Button type="button" variant={form.scope === "products" ? "default" : "outline"}
                    size="sm" className="font-sans gap-1 flex-1" onClick={() => setForm({ ...form, scope: "products" })}>
                    <ShoppingBag className="w-3.5 h-3.5" /> Loja
                  </Button>
                  <Button type="button" variant={form.scope === "appointments" ? "default" : "outline"}
                    size="sm" className="font-sans gap-1 flex-1" onClick={() => setForm({ ...form, scope: "appointments" })}>
                    Consultas
                  </Button>
                </div>
              </div>

              {showProductFilters && (
                <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-3">
                  <Label className="font-sans flex items-center gap-2 text-muted-foreground">
                    <Package className="w-4 h-4" /> Condições — Loja
                  </Label>
                  <div className="space-y-2">
                    <Label className="font-sans text-xs text-muted-foreground">Categorias</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-sans transition-colors cursor-pointer
                            ${form.categories.includes(cat.id as ProductCategory)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/50"}`}>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-sans text-xs text-muted-foreground">Produtos específicos</Label>
                    {form.selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {form.selectedProducts.map((p) => (
                          <Badge key={p.id} variant="outline" className="gap-1 pr-1 font-sans">
                            {p.name}
                            <button type="button" onClick={() => removeProduct(p.id)}
                              className="ml-0.5 rounded-full hover:bg-muted p-0.5 cursor-pointer">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Buscar produto para adicionar..." className="pl-8 font-sans bg-input/50 text-sm" />
                    </div>
                    {productSearch && filteredProducts.length > 0 && (
                      <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-background">
                        {filteredProducts.map((p) => (
                          <button key={p.id} type="button" onClick={() => addProduct(p)}
                            className="w-full text-left px-3 py-2 text-sm font-sans hover:bg-secondary transition-colors cursor-pointer">
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showConsultFilters && (
                <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-3">
                  <Label className="font-sans text-muted-foreground">Condições — Consultas</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {consultationTypes?.map((ct) => (
                      <button key={ct.id} type="button" onClick={() => toggleConsultationType(ct.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-sans transition-colors cursor-pointer
                          ${form.consultationTypeIds.includes(ct.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50"}`}>
                        {ct.icon} {ct.name}
                      </button>
                    ))}
                    {(!consultationTypes || consultationTypes.length === 0) && (
                      <p className="text-xs text-muted-foreground font-sans">Nenhum tipo de consulta cadastrado</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-sans">Valor mínimo (R$)</Label>
                  <Input type="number" value={form.minPurchase || ""} onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                    className="font-sans bg-input/50" min={0} />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Usos máximos</Label>
                  <Input type="number" value={form.maxUses || ""} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                    className="font-sans bg-input/50" placeholder="0 = ilimitado" min={0} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="font-sans">Data de expiração</Label>
                  <Input type="date" value={form.expiresAt ? form.expiresAt.toISOString().split("T")[0] : ""}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value + "T23:59:59") : undefined })}
                    className="font-sans bg-input/50" />
                </div>
              </div>
              {editing && (
                <div className="space-y-2">
                  <Label className="font-sans text-muted-foreground">Usado {editing.usedCount}x{editing.maxUses ? ` / ${editing.maxUses}` : ""}</Label>
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
            {loading ? (<div className="p-6"><SkeletonTable rows={5} cols={7} /></div>) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Código</th>
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Desconto</th>
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Condições</th>
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
                          {coupon.discountType === "fixed"
                            ? <><DollarSign className="w-3.5 h-3.5 text-green-500" /> R$ {coupon.discount.toFixed(2).replace(".", ",")}</>
                            : <><Percent className="w-3.5 h-3.5 text-green-500" /> {coupon.discount}%</>
                          }
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {(() => {
                          const desc = describeCouponConditions(coupon, consultationTypeNames)
                          return desc ? (
                            <span className="text-xs font-sans text-muted-foreground">{desc}</span>
                          ) : (
                            <span className="text-xs font-sans text-muted-foreground">—</span>
                          )
                        })()}
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

    {totalPages > 1 && (
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-sans text-muted-foreground">
          Pagina {page} de {totalPages} ({total} cupons)
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => goToPage(page - 1)} className="gap-1 font-sans">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={!hasMore || loading} onClick={() => goToPage(page + 1)} className="gap-1 font-sans">
            Proximo <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )}
    </div>
  )
}
