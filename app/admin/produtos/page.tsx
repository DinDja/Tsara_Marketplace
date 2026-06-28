"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, MoreVertical, Edit, Trash2, Eye, Package,
  TrendingUp, AlertTriangle, Image as ImageIcon,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkeletonTable, SkeletonStatsGrid } from "@/components/ui/data-skeleton";
import { useProductsPaginated } from "@/lib/hooks";
import { useAsyncMutation } from "@/lib/hooks/useAsync";
import { createProduct, updateProduct, deleteProduct, getProductsPaginated } from "@/lib/services";
import { fileToBase64 } from "@/lib/image";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { Product, ProductCategory } from "@/lib/types";

const categories = ["Todos", "Cristais", "Velas", "Oráculos", "Incensos", "Acessórios", "Rituais"];

const emptyForm = {
  name: "", category: "Cristais" as ProductCategory, price: 0, originalPrice: 0,
  stock: 0, description: "", featured: false, badge: "", image: "", status: "active" as Product["status"],
  freeShipping: false,
};

export default function AdminProdutos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { data: products, loading, total, page, goToPage, refetch } = useProductsPaginated(
    selectedCategory !== "Todos" ? { category: selectedCategory } : undefined
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const pageSize = selectedCategory !== "Todos" ? 30 : 12
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => { goToPage(1) }, [selectedCategory])
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [priceStr, setPriceStr] = useState("");
  const [origPriceStr, setOrigPriceStr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => { setForm(emptyForm); setPriceStr(""); setOrigPriceStr(""); setEditing(null) };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, price: p.price,
      originalPrice: p.originalPrice ?? 0, stock: p.stock,
      description: p.description ?? "", featured: p.featured,
      badge: p.badge ?? "", image: p.image ?? "", status: p.status,
      freeShipping: p.freeShipping ?? false,
    });
    setPriceStr(p.price.toFixed(2).replace(".", ","));
    setOrigPriceStr(p.originalPrice ? p.originalPrice.toFixed(2).replace(".", ",") : "");
    setOpen(true);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const b64 = await fileToBase64(file);
    setForm((f) => ({ ...f, image: b64 }));
  };

  const handleSave = async () => {
    if (!form.name || form.price <= 0) { toast.error("Preencha nome e preço"); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        rating: editing?.rating ?? 5, reviews: editing?.reviews ?? 0, sold: editing?.sold ?? 0,
      };
      if (form.originalPrice > 0) payload.originalPrice = form.originalPrice;
      const clean = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined)) as any;
      if (editing) {
        await updateProduct(editing.id, clean);
        toast.success("Produto atualizado!");
      } else {
        await createProduct(clean);
        toast.success("Produto criado!");
      }
      setOpen(false); resetForm(); refetch();
    } catch (e) { toast.error("Erro ao salvar: " + (e instanceof Error ? e.message : "desconhecido")); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    try { await deleteProduct(id); toast.success(`${name} excluído`); refetch(); }
    catch { toast.error("Erro ao excluir"); }
  };

  let displayProducts = products || [];
  if (searchQuery) {
    displayProducts = displayProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const totalProducts = total;
  const activeProducts = displayProducts.filter((p) => p.status === "active").length;
  const lowStockProducts = displayProducts.filter((p) => p.status === "low_stock").length;
  const outOfStock = displayProducts.filter((p) => p.stock === 0).length;

  const getStatusBadge = (product: Product) => {
    if (product.status === "inactive") {
      return <Badge variant="outline" className="bg-secondary text-muted-foreground text-xs font-sans">Inativo</Badge>;
    }
    if (product.priceOnRequest || product.stockManaged === false || product.price <= 0) {
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-sans">Sob consulta</Badge>;
    }
    if (product.stock === 0) return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs font-sans">Sem estoque</Badge>;
    const { status } = product;
    switch (status) {
      case "active": return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs font-sans">Ativo</Badge>;
      case "low_stock": return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs font-sans">Estoque baixo</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm font-sans text-muted-foreground">Gerencie o catálogo de produtos</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 font-sans gap-2"><Plus className="w-4 h-4" /> Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Produto</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-sans">Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="font-sans bg-input/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-sans">Categoria</Label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                    className="flex h-12 w-full rounded-lg border border-input bg-input/50 px-3 py-2 text-sm font-sans text-foreground">
                    {categories.filter((c) => c !== "Todos").map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Badge (opcional)</Label>
                  <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Ex: Mais Vendido" className="font-sans bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Preço (R$)</Label>
                  <Input type="text" inputMode="decimal"
                    value={priceStr}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9,.]/g, "")
                      const parts = raw.split(/[,.]/)
                      const clean = parts[0] + (parts.length > 1 ? "," + parts.slice(1).join("") : "")
                      setPriceStr(clean); setForm({ ...form, price: parseFloat(clean.replace(",", ".")) || 0 })
                    }}
                    placeholder="0,00" className="font-sans bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Preço original (R$)</Label>
                  <Input type="text" inputMode="decimal"
                    value={origPriceStr}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9,.]/g, "")
                      const parts = raw.split(/[,.]/)
                      const clean = parts[0] + (parts.length > 1 ? "," + parts.slice(1).join("") : "")
                      setOrigPriceStr(clean); setForm({ ...form, originalPrice: parseFloat(clean.replace(",", ".")) || 0 })
                    }}
                    placeholder="0,00" className="font-sans bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Estoque</Label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="font-sans bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Status</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })}
                    className="flex h-12 w-full rounded-lg border border-input bg-input/50 px-3 py-2 text-sm font-sans text-foreground">
                    <option value="active">Ativo</option>
                    <option value="low_stock">Estoque baixo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label className="font-sans">Produto em destaque</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.freeShipping} onCheckedChange={(v) => setForm({ ...form, freeShipping: v })} />
                <Label className="font-sans">Frete grátis</Label>
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="font-sans bg-input/50 min-h-20" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Imagem</Label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <div className="flex gap-3 items-center">
                  <Button variant="outline" type="button" onClick={() => fileRef.current?.click()} className="font-sans gap-2">
                    <ImageIcon className="w-4 h-4" /> {form.image ? "Trocar imagem" : "Selecionar imagem"}
                  </Button>
                  {form.image && (
                    <button type="button" onClick={() => setForm({ ...form, image: "" })} className="text-xs text-red-400 font-sans hover:underline cursor-pointer">Remover</button>
                  )}
                </div>
                {form.image && (
                  <img src={form.image} alt="preview" className="w-32 h-20 object-cover rounded-lg border border-border mt-2" />
                )}
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 font-sans">
                {saving ? "Salvando..." : editing ? "Atualizar" : "Criar"} Produto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (<SkeletonStatsGrid />) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total de Produtos", value: totalProducts, icon: Package, color: "text-primary" },
            { label: "Produtos Ativos", value: activeProducts, icon: TrendingUp, color: "text-green-500" },
            { label: "Estoque Baixo", value: lowStockProducts, icon: AlertTriangle, color: "text-yellow-500" },
            { label: "Sem Estoque", value: outOfStock, icon: AlertTriangle, color: "text-red-500" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-lg bg-secondary flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs font-sans text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar produtos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 font-sans bg-input/50" />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={cn("font-sans text-xs", selectedCategory === category && "bg-primary hover:bg-primary/90")}>{category}</Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {loading ? (<div className="p-6"><SkeletonTable rows={6} cols={7} /></div>) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Produto</th>
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Categoria</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Preço</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Estoque</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Vendidos</th>
                      <th className="text-center py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg overflow-hidden">
                              {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : (
                                product.category === "Cristais" ? "💎" : product.category === "Velas" ? "🕯️" : product.category === "Oráculos" ? "🃏" : product.category === "Incensos" ? "🌿" : "✨"
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{product.name}</p>
                              {product.featured && <span className="text-xs font-sans text-primary">Destaque</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6"><span className="text-sm font-sans text-muted-foreground">{product.category}</span></td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-sans font-medium text-foreground">
                            {product.priceOnRequest || product.price <= 0 ? "Sob consulta" : `R$ ${formatPrice(product.price)}`}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={cn("text-sm font-sans font-medium", product.stockManaged === false ? "text-primary" : product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-yellow-500" : "text-foreground")}>
                            {product.stockManaged === false ? "Sob consulta" : `${product.stock} un.`}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right"><span className="text-sm font-sans text-muted-foreground">{product.sold} un.</span></td>
                        <td className="py-4 px-6 text-center">{getStatusBadge(product)}</td>
                        <td className="py-4 px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => openEdit(product)}><Edit className="w-4 h-4" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-red-500" onClick={() => handleDelete(product.id, product.name)}>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center justify-between px-2">
            <p className="text-sm font-sans text-muted-foreground">
              Página {page} de {totalPages} ({total} produtos)
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground px-1">...</span>}
                    <Button
                      variant={p === page ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => goToPage(p)}
                      className="w-8 h-8 text-xs"
                    >
                      {p}
                    </Button>
                  </span>
                ))}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)} className="gap-1">
                Próximo <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
