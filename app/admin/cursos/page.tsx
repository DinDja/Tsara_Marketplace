"use client"

import { useState, useRef, useEffect } from "react"
import { motion, Reorder, useDragControls } from "framer-motion"
import {
   Plus, MoreVertical, Edit, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight,
   Video, FileText, CheckCircle2, XCircle, ExternalLink, BookOpen, MonitorPlay,
   GripVertical, ArrowUp, ArrowDown, Star, Megaphone, Scissors,
 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SkeletonTable } from "@/components/ui/data-skeleton"
import { ImageCropDialog } from "@/components/ui/image-crop-dialog"
import { useCoursesPaginated } from "@/lib/hooks"
import {
  createCourse, updateCourse, deleteCourse, isLessonNew,
} from "@/lib/services/courses"
import type { Course, CourseLesson, CourseStatus } from "@/lib/services/courses"
import { getDriveEmbedUrl, isValidDriveUrl } from "@/lib/drive"
import { fileToBase64 } from "@/lib/image"
import { toast } from "sonner"
import { cn, formatPrice } from "@/lib/utils"

interface LessonDraft {
  id: string
  title: string
  type: "video" | "pdf"
  driveUrl: string
  duration: string
  extraTitle: string
  extraUrl: string
  createdAt?: Date
}

interface CourseForm {
  name: string
  description: string
  announcement: string
  image: string
  price: number
  status: CourseStatus
  featured: boolean
  lessons: LessonDraft[]
}

const defaultForm: CourseForm = {
  name: "", description: "", announcement: "", image: "", price: 0,
  status: "published", featured: false, lessons: [],
}

function newLessonId() {
  return `l-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function parseBrl(value: string): number {
  return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0
}

function maskBrl(value: string): string {
  const digits = value.replace(/[^\d,]/g, "")
  const [int, dec] = digits.split(",")
  return dec !== undefined ? `${int.slice(0, 9)},${dec.slice(0, 2)}` : int.slice(0, 9)
}

function formatBrl(value: number): string {
  return value.toFixed(2).replace(".", ",")
}

function LessonCard({
  lesson, index, total, onChange, onRemove, onMove,
}: {
  lesson: LessonDraft
  index: number
  total: number
  onChange: (patch: Partial<LessonDraft>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const controls = useDragControls()
  const valid = isValidDriveUrl(lesson.driveUrl)
  const embed = getDriveEmbedUrl(lesson.driveUrl)
  const isNew = lesson.createdAt ? isLessonNew({ createdAt: lesson.createdAt } as CourseLesson) : false

  return (
    <Reorder.Item value={lesson} dragListener={false} dragControls={controls} className="list-none">
      <div className="rounded-lg border border-border p-3 bg-secondary/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onPointerDown={(e) => controls.start(e)}
              className="cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Arrastar aula"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <span className="text-xs font-sans text-muted-foreground font-medium">Aula {index + 1}</span>
            {isNew && (
              <span className="rounded-md bg-green-500/15 text-green-600 dark:text-green-400 px-1.5 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wide">Nova</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => onChange({ type: "video" })}
                className={cn(
                  "px-2.5 py-1 text-xs font-sans flex items-center gap-1 transition-colors",
                  lesson.type === "video" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <Video className="w-3 h-3" /> Vídeo
              </button>
              <button
                type="button"
                onClick={() => onChange({ type: "pdf" })}
                className={cn(
                  "px-2.5 py-1 text-xs font-sans flex items-center gap-1 transition-colors",
                  lesson.type === "pdf" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <FileText className="w-3 h-3" /> PDF
              </button>
            </div>
            <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Subir aula">
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Descer aula">
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <Button variant="ghost" size="icon-sm" onClick={onRemove} className="text-red-500">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-2 grid gap-2">
          <Input
            value={lesson.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Título da aula"
            className="font-sans bg-input/50"
          />
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
            <Input
              value={lesson.driveUrl}
              onChange={(e) => onChange({ driveUrl: e.target.value })}
              placeholder="https://drive.google.com/file/d/..."
              className="font-sans bg-input/50"
            />
            <Input
              value={lesson.duration}
              onChange={(e) => onChange({ duration: e.target.value })}
              placeholder="Duração (ex: 15 min)"
              className="font-sans bg-input/50"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-sans">
            {lesson.driveUrl.trim() === "" ? (
              <span className="text-muted-foreground">Cole o link de compartilhamento do arquivo no Google Drive.</span>
            ) : valid ? (
              <span className="text-green-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Link válido
              </span>
            ) : (
              <span className="text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Link inválido — use um link de arquivo do Google Drive
              </span>
            )}
            {embed && (
              <a href={embed} target="_blank" rel="noreferrer" className="ml-auto text-muted-foreground hover:text-foreground flex items-center gap-1">
                Testar <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2 pt-1 border-t border-border/60">
            <Input
              value={lesson.extraTitle}
              onChange={(e) => onChange({ extraTitle: e.target.value })}
              placeholder="Material extra (ex: Apostila PDF)"
              className="font-sans bg-input/50"
            />
            <Input
              value={lesson.extraUrl}
              onChange={(e) => onChange({ extraUrl: e.target.value })}
              placeholder="Link do material extra (Drive)"
              className="font-sans bg-input/50"
            />
          </div>
          {lesson.extraUrl.trim() !== "" && !isValidDriveUrl(lesson.extraUrl) && (
            <p className="text-xs font-sans text-red-500 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Link do material extra inválido
            </p>
          )}
        </div>
      </div>
    </Reorder.Item>
  )
}

export default function AdminCursos() {
  const { data: courses, loading, total, page, hasMore, goToPage, refetch } = useCoursesPaginated(20)
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState<CourseForm>(defaultForm)
  const [priceStr, setPriceStr] = useState("")
  const [origPriceStr, setOrigPriceStr] = useState("")
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null)
  const [cropSrc, setCropSrc] = useState("")
  const [cropOpen, setCropOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      const first = form.lessons.find((l) => l.driveUrl.trim() && isValidDriveUrl(l.driveUrl))
      const url = first ? getDriveEmbedUrl(first.driveUrl) : null
      setPreview(url ? { url, title: first!.title.trim() || "aula" } : null)
    }, 1500)
    return () => clearTimeout(t)
  }, [form.lessons])

  const resetForm = () => {
    setForm(defaultForm); setPriceStr(""); setOrigPriceStr(""); setEditing(null)
  }

  const openEdit = (c: Course) => {
    setEditing(c)
    setForm({
      name: c.name,
      description: c.description ?? "",
      announcement: c.announcement ?? "",
      image: c.image ?? "",
      price: c.price ?? 0,
      status: c.status,
      featured: c.featured,
      lessons: c.lessons.map((l) => ({
        id: l.id, title: l.title, type: l.type, driveUrl: l.driveUrl,
        duration: l.duration ?? "", extraTitle: l.extraTitle ?? "", extraUrl: l.extraUrl ?? "",
        createdAt: l.createdAt,
      })),
    })
    setPriceStr(formatBrl(c.price ?? 0))
    setOrigPriceStr(c.originalPrice ? formatBrl(c.originalPrice) : "")
    setOpen(true)
  }

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await fileToBase64(file)
    setCropSrc(b64)
    setCropOpen(true)
    e.target.value = ""
  }

  const updateLesson = (id: string, patch: Partial<LessonDraft>) => {
    setForm((f) => ({
      ...f,
      lessons: f.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }))
  }

  const addLesson = () => {
    setForm((f) => ({
      ...f,
      lessons: [...f.lessons, {
        id: newLessonId(), title: "", type: "video", driveUrl: "", duration: "", extraTitle: "", extraUrl: "",
        createdAt: new Date(),
      }],
    }))
  }

  const removeLesson = (id: string) => {
    setForm((f) => ({ ...f, lessons: f.lessons.filter((l) => l.id !== id) }))
  }

  const moveLesson = (id: string, dir: -1 | 1) => {
    setForm((f) => {
      const idx = f.lessons.findIndex((l) => l.id === id)
      const target = idx + dir
      if (idx < 0 || target < 0 || target >= f.lessons.length) return f
      const lessons = [...f.lessons]
      const [item] = lessons.splice(idx, 1)
      lessons.splice(target, 0, item)
      return { ...f, lessons }
    })
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Informe o nome do curso"); return }

    const lessons: CourseLesson[] = []
    for (const l of form.lessons) {
      const title = l.title.trim()
      const url = l.driveUrl.trim()
      if (!title && !url && !l.extraUrl.trim()) continue
      if (!title) { toast.error("Toda aula precisa de um título"); return }
      if (!isValidDriveUrl(url)) {
        toast.error(`Link do Google Drive inválido na aula "${title}"`)
        return
      }
      if (l.extraUrl.trim() && !isValidDriveUrl(l.extraUrl)) {
        toast.error(`Link do material extra inválido na aula "${title}"`)
        return
      }
      lessons.push({
        id: l.id,
        title,
        type: l.type,
        driveUrl: url,
        duration: l.duration.trim() || undefined,
        extraTitle: l.extraTitle.trim() || undefined,
        extraUrl: l.extraUrl.trim() || undefined,
        createdAt: l.createdAt ?? new Date(0),
      })
    }

    setSaving(true)
    try {
      const payload: Record<string, any> = {
        name: form.name.trim(),
        description: form.description.trim(),
        announcement: form.announcement.trim() || undefined,
        image: form.image,
        price: form.price,
        originalPrice: form.price > 0 && origPriceStr ? parseBrl(origPriceStr) : undefined,
        status: form.status,
        featured: form.featured,
        lessons,
      }
      Object.keys(payload).forEach((k) => { if (payload[k] === undefined) delete payload[k] })

      if (editing) {
        await updateCourse(editing.id, payload)
        toast.success("Curso atualizado!")
      } else {
        await createCourse(payload as any)
        toast.success("Curso criado!")
      }
      setOpen(false); resetForm(); refetch()
    } catch (err) {
      toast.error(err instanceof Error ? `Erro ao salvar: ${err.message}` : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try { await deleteCourse(id); toast.success(`${name} excluído`); refetch() }
    catch { toast.error("Erro ao excluir") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
          <p className="text-sm font-sans text-muted-foreground">Gerencie os cursos com vídeos e PDFs do Google Drive</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 font-sans gap-2">
              <Plus className="w-4 h-4" /> Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Novo"} Curso</DialogTitle>
              <DialogDescription>Configure as informações do curso e organize as aulas.</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="info">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="info" className="font-sans gap-2"><BookOpen className="w-4 h-4" /> Informações</TabsTrigger>
                <TabsTrigger value="lessons" className="font-sans gap-2"><MonitorPlay className="w-4 h-4" /> Aulas ({form.lessons.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="font-sans">Nome do curso *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Tarot para Iniciantes" className="font-sans bg-input/50" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-sans">Preço (R$) *</Label>
                    <Input type="text" inputMode="decimal"
                      value={priceStr}
                      onChange={(e) => {
                        const clean = maskBrl(e.target.value)
                        setPriceStr(clean)
                        setForm({ ...form, price: parseBrl(clean) })
                      }}
                      placeholder="0,00"
                      className="font-sans bg-input/50" />
                    <p className="text-xs font-sans text-muted-foreground">Deixe 0 para curso gratuito.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-sans">Preço original (opcional)</Label>
                    <Input type="text" inputMode="decimal"
                      value={origPriceStr}
                      onChange={(e) => setOrigPriceStr(maskBrl(e.target.value))}
                      placeholder="0,00"
                      className="font-sans bg-input/50" />
                    <p className="text-xs font-sans text-muted-foreground">Mostrado riscado, como promoção.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-sans">Descrição</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="font-sans bg-input/50 min-h-20" placeholder="O que o aluno vai aprender neste curso?" />
                </div>

                <div className="space-y-2">
                  <Label className="font-sans flex items-center gap-1.5"><Megaphone className="w-4 h-4" /> Aviso / anúncio (opcional)</Label>
                  <Textarea value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} className="font-sans bg-input/50 min-h-16" placeholder="Ex: Nova turma abrindo! Aulas novas toda semana." />
                  <p className="text-xs font-sans text-muted-foreground">Aparece em destaque no topo da página do curso.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-sans">Status</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setForm({ ...form, status: "draft" })}
                        className={cn("px-3 py-2 rounded-lg border text-sm font-sans font-medium transition-colors",
                          form.status === "draft" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground")}>
                        Rascunho
                      </button>
                      <button type="button" onClick={() => setForm({ ...form, status: "published" })}
                        className={cn("px-3 py-2 rounded-lg border text-sm font-sans font-medium transition-colors",
                          form.status === "published" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground")}>
                        Publicado
                      </button>
                    </div>
                    <p className="text-xs font-sans text-muted-foreground">Rascunho não aparece para os alunos nem gera venda.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pt-1">
                      <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                      <Label className="font-sans flex items-center gap-1.5">
                        <Star className={cn("w-4 h-4", form.featured ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                        Destacar curso
                      </Label>
                    </div>
                    <p className="text-xs font-sans text-muted-foreground">
                      {form.price > 0
                        ? "O produto será criado/atualizado automaticamente na loja com o mesmo nome e preço."
                        : "Curso gratuito: ninguém precisa pagar para acessar."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-sans">Imagem de capa</Label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePickImage} className="hidden" />
                  <div className="flex gap-3 items-center">
                    <Button variant="outline" type="button" onClick={() => fileRef.current?.click()} className="font-sans gap-2">
                      <ImageIcon className="w-4 h-4" /> {form.image ? "Trocar imagem" : "Selecionar imagem"}
                    </Button>
{form.image && (
                        <Button variant="outline" size="sm" type="button" onClick={() => { setCropSrc(form.image); setCropOpen(true) }} className="font-sans gap-1">
                          <Scissors className="w-3.5 h-3.5" /> Recortar novamente
                        </Button>
                      )}
                    {form.image && (
                      <button type="button" onClick={() => setForm({ ...form, image: "" })} className="text-xs text-red-400 font-sans hover:underline">Remover</button>
                    )}
                  </div>
                  {form.image ? (
                    <img src={form.image} alt="preview" className="w-full max-w-md h-40 object-cover rounded-lg border border-border mt-2" />
                  ) : cropSrc ? (
                    <img src={cropSrc} alt="preview" className="w-full max-w-md h-40 object-cover rounded-lg border border-border mt-2 opacity-70" />
                  ) : null}
                  <p className="text-xs font-sans text-muted-foreground">A imagem passa por um recorte antes de ser usada.</p>
                </div>
              </TabsContent>

              <TabsContent value="lessons" className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="font-sans flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4" /> Aulas
                      </Label>
                      <span className="rounded-md bg-green-500/15 text-green-600 dark:text-green-400 px-1.5 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wide">Nova</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={addLesson} className="font-sans gap-1">
                      <Plus className="w-3 h-3" /> Adicionar aula
                    </Button>
                  </div>
                  <p className="text-xs font-sans text-muted-foreground">
                    Aulas novas ganham o selo &quot;NOVA&quot; automaticamente (por 30 dias) para os alunos. Arraste as aulas para reordenar.
                  </p>

                  {form.lessons.length === 0 && (
                    <p className="text-sm font-sans text-muted-foreground py-4 text-center">
                      Nenhuma aula ainda. Adicione vídeos ou PDFs hospedados no Google Drive.
                    </p>
                  )}

                  <Reorder.Group
                    axis="y"
                    values={form.lessons}
                    onReorder={(v) => setForm((f) => ({ ...f, lessons: v }))}
                    className="space-y-3"
                  >
                    {form.lessons.map((l, i) => (
                      <LessonCard
                        key={l.id}
                        lesson={l}
                        index={i}
                        total={form.lessons.length}
                        onChange={(patch) => updateLesson(l.id, patch)}
                        onRemove={() => removeLesson(l.id)}
                        onMove={(dir) => moveLesson(l.id, dir)}
                      />
                    ))}
                  </Reorder.Group>

                  {preview && (
                    <div className="space-y-1 pt-2">
                      <p className="text-xs font-sans text-muted-foreground">
                        Pré-visualização de &quot;{preview.title}&quot;:
                      </p>
                      <iframe
                        key={preview.url}
                        src={preview.url}
                        sandbox="allow-same-origin allow-scripts allow-fullscreen"
                        className="w-full h-48 rounded-lg border border-border"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <p className="text-xs font-sans text-muted-foreground">
                    Dica: no Google Drive, o arquivo precisa estar com compartilhamento &quot;Qualquer pessoa com o link&quot; para abrir aqui no site.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
              <p className="text-xs font-sans text-muted-foreground">
                {form.price > 0
                  ? <>Venda via loja: <span className="text-foreground font-medium">R$ {formatPrice(form.price)}</span> (produto criado automaticamente)</>
                  : "Curso gratuito"}
              </p>
              <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 font-sans">
                {saving ? "Salvando..." : editing ? "Atualizar" : "Criar"} Curso
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ImageCropDialog
          open={cropOpen}
          src={cropSrc}
          onConfirm={(b64) => setForm((f) => ({ ...f, image: b64 }))}
          onClose={() => setCropOpen(false)}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6"><SkeletonTable rows={4} cols={5} /></div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-sans">
                Nenhum curso cadastrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Curso</th>
                      <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Aulas</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Preço</th>
                      <th className="text-center py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-center py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Destaque</th>
                      <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => {
                      const videos = c.lessons.filter((l) => l.type === "video").length
                      const pdfs = c.lessons.filter((l) => l.type === "pdf").length
                      const hasNew = c.lessons.some((l) => isLessonNew(l))
                      return (
                        <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-secondary/30 shrink-0 flex items-center justify-center">
                                {c.image ? (
                                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                                ) : (
                                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                  {c.name}
                                  {hasNew && (
                                    <span className="rounded-md bg-green-500/15 text-green-600 dark:text-green-400 px-1.5 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wide">Nova</span>
                                  )}
                                </p>
                                <p className="text-xs font-sans text-muted-foreground line-clamp-1">{c.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="secondary" className="font-sans">{c.lessons.length} aulas</Badge>
                              {videos > 0 && <Badge variant="outline" className="font-sans gap-1"><Video className="w-3 h-3" />{videos}</Badge>}
                              {pdfs > 0 && <Badge variant="outline" className="font-sans gap-1"><FileText className="w-3 h-3" />{pdfs}</Badge>}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {c.price > 0 ? (
                              <>
                                <span className="text-sm font-sans font-medium text-foreground">R$ {formatPrice(c.price)}</span>
                                {c.originalPrice ? (
                                  <span className="text-xs text-muted-foreground line-through ml-1">R$ {formatPrice(c.originalPrice)}</span>
                                ) : null}
                              </>
                            ) : (
                              <span className="text-sm font-sans text-muted-foreground">Grátis</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <Badge variant={c.status === "published" ? "default" : "secondary"} className="font-sans">
                              {c.status === "published" ? "Publicado" : "Rascunho"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {c.featured ? (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 inline" />
                            ) : (
                              <span className="text-muted-foreground text-xs font-sans">—</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm"><MoreVertical className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2" onClick={() => openEdit(c)}>
                                  <Edit className="w-4 h-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-red-500" onClick={() => handleDelete(c.id, c.name)}>
                                  <Trash2 className="w-4 h-4" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
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
            Pagina {page} de {totalPages} ({total} cursos)
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
