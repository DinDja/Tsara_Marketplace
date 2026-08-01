"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, GraduationCap, Loader2, Lock, Video, FileText, PlayCircle, Lightbulb, Star, Clock } from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { EmptyScheduleState } from "@/components/scheduling"
import { useActiveCourses, usePaidProductIds } from "@/lib/hooks"
import { courseHasNewLessons } from "@/lib/services/courses"
import { formatPrice } from "@/lib/utils"

export default function CursosPage() {
  const { data: courses, loading } = useActiveCourses()
  const { productIds, loading: accessLoading, isAuthenticated } = usePaidProductIds()
  const error = !loading && courses.length === 0 ? "Nao foi possivel carregar os cursos." : null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-sans">Voltar</span>
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
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <span className="text-sm uppercase tracking-[0.3em] text-gold font-sans">
                Cursos
              </span>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-foreground md:text-5xl">
                Aprenda no seu ritmo, onde estiver
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground font-sans">
                Cursos em video e PDF para aprofundar seu conhecimento. Ao adquirir, todo o conteudo fica disponivel aqui na plataforma.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
<div className="mb-4 flex items-center gap-2">
                 <Lightbulb className="h-5 w-5 text-primary" />
                 <h2 className="font-semibold text-foreground">Como funciona</h2>
               </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Escolha o curso</p>
                    <p className="text-xs leading-relaxed text-muted-foreground font-sans">Navegue pelos cursos disponiveis e conheça o conteudo de cada um.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Assista direto aqui</p>
                    <p className="text-xs leading-relaxed text-muted-foreground font-sans">Videos e PDFs abrem na propria plataforma, sem sair do site.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {loading || accessLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <EmptyScheduleState title="Cursos indisponiveis" description={error} />
        ) : courses.length === 0 ? (
          <EmptyScheduleState
            title="Nenhum curso disponivel"
            description="Quando novos cursos forem publicados, eles aparecerao nesta pagina."
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {courses.map((course, index) => {
              const owned = !course.productId || productIds.has(course.productId)
              const videos = course.lessons.filter((l) => l.type === "video").length
              const pdfs = course.lessons.filter((l) => l.type === "pdf").length
              const hasNew = courseHasNewLessons(course)
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link
                    href={`/cursos/${course.id}`}
                    className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="relative h-44 overflow-hidden bg-secondary/30">
                      {course.image ? (
                        <img src={course.image} alt={course.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
                        </div>
                      )}
                      {!owned && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/90 border border-border">
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            </span>
                            <span className="text-xs font-sans font-medium text-muted-foreground">
                              {isAuthenticated ? "Curso pago" : "Entre para comprar"}
                            </span>
                          </div>
                        </div>
                      )}
                      <span className="absolute left-3 top-3 flex items-center gap-2">
                        {course.featured && (
                          <span className="flex items-center gap-1 rounded-md bg-gold/90 backdrop-blur px-2 py-1 text-xs font-sans font-medium text-background">
                            <Star className="w-3 h-3 fill-background" /> Destaque
                          </span>
                        )}
                        {hasNew && (
                          <span className="rounded-md bg-green-500 px-2 py-1 text-xs font-sans font-bold text-white uppercase tracking-wide">
                            Novas aulas!
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">{course.name}</h2>
                      <p className="mt-1 line-clamp-2 text-sm font-sans leading-relaxed text-muted-foreground">{course.description}</p>
                      <div className="mt-4 flex items-center gap-3 text-xs font-sans text-muted-foreground">
                        {videos > 0 && (
                          <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {videos} {videos === 1 ? "video" : "videos"}</span>
                        )}
                        {pdfs > 0 && (
                          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {pdfs} {pdfs === 1 ? "PDF" : "PDFs"}</span>
                        )}
                        <span className="ml-auto flex items-center gap-1 font-medium text-primary">
                          {owned ? "Acessar" : "Ver curso"} <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        {course.price > 0 ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-foreground">R$ {formatPrice(course.price)}</span>
                            {course.originalPrice && (
                              <span className="text-xs font-sans text-muted-foreground line-through">R$ {formatPrice(course.originalPrice)}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">Grátis</span>
                        )}
                        <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" /> {course.lessons.length} {course.lessons.length === 1 ? "aula" : "aulas"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </main>
    </div>
  )
}
