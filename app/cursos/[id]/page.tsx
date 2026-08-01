"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, ChevronRight, FileText, GraduationCap, Loader2, Lock, PlayCircle,
  ShoppingBag, Video, UserRound, Megaphone, Clock, Paperclip,
} from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyScheduleState } from "@/components/scheduling"
import { useCourse, useCourseAccess, useProduct } from "@/lib/hooks"
import { useCart } from "@/lib/contexts/cart-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { getDriveEmbedUrl } from "@/lib/drive"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { isLessonNew } from "@/lib/services/courses"
import { toast } from "sonner"

export default function CursoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { addItem } = useCart()
  const { user } = useAuth()

  const { data: course, loading } = useCourse(id)
  const { owned, isAuthenticated } = useCourseAccess(course?.productId)
  const { data: product, loading: productLoading } = useProduct(course?.productId ?? "")
  const [selected, setSelected] = useState<string | null>(null)

  const lessons = course?.lessons ?? []
  const current = lessons.find((l) => l.id === selected) ?? lessons[0] ?? null
  const embedUrl = current ? getDriveEmbedUrl(current.driveUrl) : null
  const extraEmbed = current?.extraUrl ? getDriveEmbedUrl(current.extraUrl) : null
  const [showExtra, setShowExtra] = useState(false)

  const videos = lessons.filter((l) => l.type === "video").length
  const pdfs = lessons.filter((l) => l.type === "pdf").length
  const isFree = !course?.productId

  const handleBuy = async () => {
    if (!product) return
    const ok = addItem(product)
    if (ok) {
      toast.success(`${product.name} adicionado ao carrinho!`)
      router.push("/carrinho")
    } else {
      toast.error("Produto indisponível no momento")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/cursos" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-sans">Cursos</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <MoonIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Tsara</span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !course ? (
          <EmptyScheduleState
            title="Curso nao encontrado"
            description="Este curso pode ter sido removido. Volte para a lista de cursos."
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="h-52 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/30 sm:h-44 sm:w-72">
                    {course.image ? (
                      <img src={course.image} alt={course.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <GraduationCap className="h-14 w-14 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm uppercase tracking-[0.3em] text-gold font-sans">Curso</span>
                    <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground md:text-4xl">{course.name}</h1>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground font-sans">{course.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-sans gap-1">
                        <GraduationCap className="w-3 h-3" /> {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
                      </Badge>
                      {videos > 0 && (
                        <Badge variant="outline" className="font-sans gap-1"><Video className="w-3 h-3" /> {videos} {videos === 1 ? "video" : "videos"}</Badge>
                      )}
                      {pdfs > 0 && (
                        <Badge variant="outline" className="font-sans gap-1"><FileText className="w-3 h-3" /> {pdfs} {pdfs === 1 ? "PDF" : "PDFs"}</Badge>
                      )}
                      {course.featured && (
                        <Badge className="font-sans gap-1">Destaque</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.section>

              {course.announcement && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4"
                >
                  <Megaphone className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <p className="text-sm font-sans leading-relaxed text-foreground">{course.announcement}</p>
                </motion.div>
              )}

              {owned && current && embedUrl ? (
                <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {current.type === "video" ? <PlayCircle className="inline w-5 h-5 text-primary mr-1.5 -mt-0.5" /> : <FileText className="inline w-5 h-5 text-primary mr-1.5 -mt-0.5" />}
                    {current.title}
                    {isLessonNew(current) && (
                      <span className="ml-2 rounded-md bg-green-500/15 text-green-600 dark:text-green-400 px-1.5 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wide align-middle">Nova</span>
                    )}
                  </h2>
                  <div
                    className="overflow-hidden rounded-xl border border-border bg-card relative"
                    onAuxClick={(e) => { if (e.button === 1) e.preventDefault() }}
                    onClick={(e) => { if (e.ctrlKey || e.metaKey) e.preventDefault() }}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <iframe
                      key={current.id}
                      src={embedUrl}
                      sandbox="allow-same-origin allow-scripts allow-fullscreen"
                      className="aspect-video w-full"
                      allow="autoplay; fullscreen; encrypted-media"
                      allowFullScreen
                    />
                    <span className="pointer-events-none absolute right-2 bottom-2 z-10 rounded bg-black/45 px-2 py-0.5 text-[10px] font-sans font-medium text-white/80 select-none">
                      {course.name} · {user?.name || user?.email || "aluno"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-xs font-sans text-muted-foreground">
                      {current.type === "video" ? "O player do Google Drive pode levar alguns segundos para carregar." : "Use as ferramentas do visualizador para navegar pelo PDF."}
                    </p>
                    {current.duration && (
                      <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> {current.duration}
                      </span>
                    )}
                  </div>

                  {current.extraUrl && extraEmbed && (
                    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">{current.extraTitle || "Material extra"}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowExtra(!showExtra)} className="font-sans">
                          {showExtra ? "Ocultar" : "Pré-visualizar"}
                        </Button>
                      </div>
                      <AnimatePresence initial={false}>
                        {showExtra && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <iframe
                              key={current.extraUrl}
                              src={extraEmbed}
                              sandbox="allow-same-origin allow-scripts allow-fullscreen"
                              className="aspect-video w-full rounded-lg border border-border"
                              allowFullScreen
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.section>
              ) : owned && lessons.length === 0 ? (
                <EmptyScheduleState title="Curso sem aulas" description="As aulas deste curso ainda não foram publicadas." />
              ) : null}

              <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="font-semibold text-foreground">Conteúdo do curso</h2>
                </div>
                {lessons.length === 0 ? (
                  <p className="px-5 py-8 text-sm font-sans text-muted-foreground text-center">
                    Nenhuma aula cadastrada.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {lessons.map((l, i) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => owned && setSelected(l.id)}
                          disabled={!owned}
                          className={cn(
                            "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors",
                            owned ? "hover:bg-secondary/40" : "cursor-not-allowed opacity-60",
                            owned && current?.id === l.id && "bg-primary/5"
                          )}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground text-xs font-sans font-medium">
                            {i + 1}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {l.title}
                              {isLessonNew(l) && (
                                <span className="ml-2 rounded-md bg-green-500/15 text-green-600 dark:text-green-400 px-1.5 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wide align-middle">Nova</span>
                              )}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground">
                              {l.type === "video" ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                              {l.type === "video" ? "Vídeo" : "PDF"}
                              {l.duration && (
                                <span className="flex items-center gap-0.5 ml-1"><Clock className="w-2.5 h-2.5" /> {l.duration}</span>
                              )}
                              {l.extraUrl && (
                                <span className="flex items-center gap-0.5 ml-1"><Paperclip className="w-2.5 h-2.5" /> extra</span>
                              )}
                            </span>
                          </span>
                          {owned ? (
                            <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground", owned && current?.id === l.id && "text-primary")} />
                          ) : (
                            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.section>
            </div>

            <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-24 h-fit">
              {owned ? (
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="font-sans gap-1">
                      <PlayCircle className="w-3 h-3" /> Acesso liberado
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-sans leading-relaxed text-muted-foreground">
                    Você já tem acesso a este curso. Aproveite os {lessons.length} {lessons.length === 1 ? "conteúdo disponível" : "conteúdos disponíveis"}.
                  </p>
                </div>
              ) : isFree ? (
                <div className="rounded-xl border border-border bg-card p-5">
                  <Badge variant="default" className="font-sans gap-1">
                    <PlayCircle className="w-3 h-3" /> Acesso livre
                  </Badge>
                  <p className="mt-3 text-sm font-sans leading-relaxed text-muted-foreground">
                    Este curso está disponível gratuitamente para todos.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div>
                    <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider">Adquira o curso</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-foreground">
                        {course.price > 0 ? `R$ ${formatPrice(course.price)}` : "Grátis"}
                      </span>
                      {course.price > 0 && (course.originalPrice ?? product?.originalPrice) ? (
                        <span className="text-sm font-sans text-muted-foreground line-through">
                          R$ {formatPrice(course.originalPrice ?? product?.originalPrice!)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-sans leading-relaxed text-muted-foreground">
                      {course.price > 0
                        ? `Acesso ao curso completo com ${lessons.length} ${lessons.length === 1 ? "aula" : "aulas"} após a confirmação do pagamento.`
                        : "Curso gratuito — entre na sua conta para acessar."}
                    </p>
                  </div>
                  {isAuthenticated ? (
                    course.price > 0 ? (
                      <Button onClick={handleBuy} disabled={productLoading || !product} className="w-full bg-primary hover:bg-primary/90 font-sans gap-2">
                        <ShoppingBag className="w-4 h-4" /> Comprar agora
                      </Button>
                    ) : (
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 font-sans gap-2">
                        <Link href="/cursos">Acessar curso</Link>
                      </Button>
                    )
                  ) : (
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 font-sans gap-2">
                      <Link href="/login">
                        <UserRound className="w-4 h-4" /> Entre para {course.price > 0 ? "comprar" : "acessar"}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </main>
    </div>
  )
}
