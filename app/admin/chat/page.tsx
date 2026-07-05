"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Search, Loader2, ArrowLeft, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/contexts/auth-context"
import { subscribeChats, deleteChat, deleteMessage } from "@/lib/services/chat"
import { ChatWindow } from "@/components/chat-window"
import type { Chat } from "@/lib/types"

function timeAgo(date?: Date): string {
  if (!date) return ""
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "agora"
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export default function AdminChatPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [showDeleteChatDialog, setShowDeleteChatDialog] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeChats((list) => {
      setChats(list)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      if (selectedId === chatId) {
        setSelectedId(null)
      }
    } catch (error) {
      console.error("Erro ao deletar chat:", error)
    }
  }

  const handleDeleteMessage = async (chatId: string, messageId: string) => {
    try {
      await deleteMessage(chatId, messageId)
      // A interface será atualizada automaticamente pelo hook do chat
    } catch (error) {
      console.error("Erro ao deletar mensagem:", error)
    }
  }

  const filtered = chats.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.clientName?.toLowerCase().includes(q) ||
      c.clientEmail?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    )
  })

  const selected = chats.find((c) => c.id === selectedId) ?? null

  {/* Dialog de confirmação para excluir chat */}
  <Dialog open={showDeleteChatDialog} onOpenChange={setShowDeleteChatDialog}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Excluir conversa</DialogTitle>
        <DialogDescription>
          Esta ação não pode ser desfeita. A conversa e todas as mensagens serão permanentemente excluídas.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowDeleteChatDialog(false)}>
          Cancelar
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => {
            if (chatToDelete) {
              handleDeleteChat(chatToDelete)
              setShowDeleteChatDialog(false)
              setChatToDelete(null)
            }
          }}
        >
          Excluir conversa
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Mensagens
        </h1>
        <p className="text-sm text-muted-foreground">Conversas com clientes em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[72vh] min-h-[480px]">
        {/* Lista de conversas */}
        <div className={cn("border rounded-lg flex flex-col", selectedId ? "hidden md:flex" : "flex")}>
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar conversa..."
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma conversa ainda.
              </div>
            ) : (
              filtered.map((c) => (
                <div key={c.id} className={cn(
                  "w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-b",
                  selectedId === c.id && "bg-muted"
                )}>
                  <button
                    onClick={() => setSelectedId(c.id)}
                    className="flex-1 flex items-center gap-3 text-left w-full"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      {c.clientAvatar ? <AvatarImage src={c.clientAvatar} alt={c.clientName} /> : null}
                      <AvatarFallback>{c.clientName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate text-sm">{c.clientName}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {c.lastMessage ?? "Sem mensagens"}
                      </p>
                      {c.unreadByAdmin > 0 && (
                        <Badge className="shrink-0 h-5 min-w-5 flex items-center justify-center px-1.5 text-[10px]">
                          {c.unreadByAdmin}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
                <div className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setChatToDelete(c.id)
                          setShowDeleteChatDialog(true)
                        }}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir conversa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Janela de conversa */}
        <div className={cn("md:col-span-2 border rounded-lg overflow-hidden flex flex-col", selectedId ? "flex" : "hidden md:flex")}>
          {selectedId && selected ? (
            <div className="flex flex-col h-full">
              <div className="md:hidden p-2 border-b">
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>
              </div>
              <ChatWindow
                chatId={selectedId}
                role="admin"
                senderId={user?.id ?? "admin"}
                senderName={user?.name ?? "Admin"}
                peerName={selected.clientName}
                peerAvatar={selected.clientAvatar}
                peerSubtitle={selected.clientEmail}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
              Selecione uma conversa à esquerda para visualizar as mensagens.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
