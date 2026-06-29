"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CalendarCheck, ChevronLeft, ChevronRight, Loader2, ShieldCheck, Sparkles, Video } from "lucide-react"
import { MoonIcon } from "@/components/moon-icon"
import { Button } from "@/components/ui/button"
import { EmptyScheduleState, SchedulingTypeCard } from "@/components/scheduling"
import { useConsultationTypesPaginated } from "@/lib/hooks"

const processSteps = [
  { icon: Sparkles, label: "Escolha o atendimento", text: "Compare objetivos, duracao e valor." },
  { icon: CalendarCheck, label: "Reserve um horario", text: "Veja apenas horarios realmente livres." },
  { icon: Video, label: "Receba as orientacoes", text: "Confirmacao enviada com os detalhes." },
]

export default function ConsultasPage() {
  const { data: types, loading, total, page, hasMore, goToPage } = useConsultationTypesPaginated(20)
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const error = !loading && types.length === 0 ? "Nao foi possivel carregar as consultas." : null

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
                Agenda de consultas
              </span>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-foreground md:text-5xl">
                Escolha o atendimento e reserve com clareza
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground font-sans">
                Um fluxo simples para escolher a consulta, conferir disponibilidade, informar seus dados e revisar tudo antes de enviar a solicitacao.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Como funciona</h2>
              </div>
              <div className="space-y-4">
                {processSteps.map((step) => (
                  <div key={step.label} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.label}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground font-sans">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <EmptyScheduleState title="Agenda indisponivel" description={error} />
        ) : types.length === 0 ? (
          <EmptyScheduleState
            title="Nenhum atendimento disponivel"
            description="Quando novos tipos de consulta forem cadastrados, eles aparecerao nesta pagina."
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {types.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <SchedulingTypeCard
                  type={type}
                  actionHref={`/agendamento?type=${encodeURIComponent(type.id)}`}
                  actionLabel="Ver horarios"
                  nextAvailable="Proxima data livre"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1 || loading} className="gap-1 font-sans">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <span className="px-4 text-sm font-sans text-muted-foreground">
              Pagina {page} de {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={!hasMore || loading} className="gap-1 font-sans">
              Proximo <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 font-sans">
            <Link href="/minhas-consultas">Ver minhas consultas</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
