"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/contexts/auth-context"
import { getOrCreateChatForClient } from "@/lib/services/chat"
import { ChatWindow } from "@/components/chat-window"
import { toast } from "sonner"

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [chatId, setChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login?redirect=/chat")
      return
    }
    let active = true
    ;(async () => {
      try {
        const chat = await getOrCreateChatForClient({
          clientId: user.id,
          clientName: user.name,
          clientEmail: user.email,
          clientAvatar: user.avatar,
        })
        if (active) setChatId(chat.id)
      } catch (e) {
        toast.error("Não foi possível abrir o chat")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background">
      {/* Cabeçalho fixo estilo WhatsApp */}
      <header className="flex items-center gap-3 px-3 sm:px-4 h-14 sm:h-16 bg-gold text-black shadow-md flex-shrink-0">
        <Button variant="ghost" size="icon" asChild className="hover:bg-black/15 text-black">
          <Link href="/conta" aria-label="Voltar"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="relative">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-black/10">
            <AvatarFallback className="bg-black/15 text-black font-semibold">
              TS
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base leading-tight truncate">Atendimento TSARA</p>
          <p className="text-xs text-black/70 truncate">online</p>
        </div>
      </header>

      {/* Área de conversa ocupa todo o espaço restante */}
      <div className="flex-1 min-h-0 w-full max-w-3xl mx-auto bg-background">
        <ChatWindow
          chatId={chatId}
          role="client"
          senderId={user.id}
          senderName={user.name}
          peerName="Atendimento TSARA"
          peerAvatar={undefined}
          peerSubtitle="online"
          emptyState="Iniciando conversa..."
          hideHeader
        />
      </div>
    </div>
  )
}
