"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { X, MessageCircle, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ChatWindow } from "./chat-window"
import { ProductInquiryCard } from "./product-inquiry-card"
import { useAuth } from "@/lib/contexts/auth-context"
import { useSupportChat, INQUIRY_TTL_MS } from "@/lib/contexts/chat-context"
import { listChats, subscribeChats, getOrCreateChatForClient, deleteChat, sendMessage } from "@/lib/services/chat"
import type { Chat } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface ChatFloatButtonProps {
  className?: string
}

export function ChatFloatButton({ className }: ChatFloatButtonProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [selectedChatData, setSelectedChatData] = useState<Chat | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const { user } = useAuth()
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [showDeleteChatDialog, setShowDeleteChatDialog] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const { pendingInquiry, clearPendingInquiry } = useSupportChat()
  const handledInquiryId = useRef<string | null>(null)
  
  // Carregar chats para administradores (hook sempre chamado na mesma ordem)
  useEffect(() => {
    if (!user || user.role !== "admin") return
    
    const unsubscribe = subscribeChats((chats) => {
      setChats(chats)
      const hasUnread = chats.some(chat => chat.unreadByAdmin > 0)
      setHasNewMessages(hasUnread)
    })
    
    listChats().then(chats => {
      setChats(chats)
      const hasUnread = chats.some(chat => chat.unreadByAdmin > 0)
      setHasNewMessages(hasUnread)
    })
    
    return unsubscribe
  }, [user])

  // Abre o chat com o produto quando o cliente pede consulta de disponibilidade
  useEffect(() => {
    if (!pendingInquiry) {
      handledInquiryId.current = null
      return
    }
    if (!user) return

    if (Date.now() - pendingInquiry.at > INQUIRY_TTL_MS) {
      clearPendingInquiry()
      return
    }

    if (handledInquiryId.current === pendingInquiry.product.id) return
    handledInquiryId.current = pendingInquiry.product.id

    const { product } = pendingInquiry
    setIsOpen(true)

    ;(async () => {
      try {
        const chat = await getOrCreateChatForClient({
          clientId: user.id,
          clientName: user.name,
          clientEmail: user.email,
          clientAvatar: user.avatar,
        })
        setSelectedChat(chat.id)
        const productUrl = `${window.location.origin}/produto/${product.id}`
        await sendMessage({
          chatId: chat.id,
          senderId: user.id,
          senderName: user.name,
          senderRole: "client",
          type: "text",
          text: `Olá! Gostaria de saber sobre a disponibilidade do produto "${product.name}".\n${productUrl}`,
        })
      } catch (error) {
        console.error("Erro ao abrir chat com produto:", error)
        toast.error("Não foi possível iniciar o chat. Tente novamente.")
      }
    })()
  }, [pendingInquiry, user, clearPendingInquiry])

  // Limpa a consulta pendente ao fechar o painel de chat
  useEffect(() => {
    if (!isOpen) clearPendingInquiry()
  }, [isOpen, clearPendingInquiry])

  const activeInquiry =
    pendingInquiry && Date.now() - pendingInquiry.at <= INQUIRY_TTL_MS ? pendingInquiry.product : null

  // Early return DEPOIS de todos os hooks
  const hideButton = pathname === '/admin/chat'
  if (hideButton || !user) return null

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      if (selectedChat === chatId) {
        setSelectedChat(null)
        setSelectedChatData(null)
      }
      const updatedChats = chats.filter(chat => chat.id !== chatId)
      setChats(updatedChats)
      const hasUnread = updatedChats.some(chat => chat.unreadByAdmin > 0)
      setHasNewMessages(hasUnread)
    } catch (error) {
      console.error("Erro ao deletar chat:", error)
    }
  }

  return (
    <>
      {/* Botão flutuante com indicador de novas mensagens */}
      <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className={cn(
            "relative rounded-full shadow-xl hover:shadow-2xl transition-all duration-500",
            "bg-gradient-to-br from-gold to-gold/80 text-black border-2 border-gold/30",
            "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 hover:scale-105 active:scale-95",
            "group",
            className
          )}
          aria-label={isOpen ? "Fechar suporte" : "Abrir suporte"}
        >
          {hasNewMessages && (
            <div className="absolute inset-0 rounded-full bg-gold animate-ping opacity-30" />
          )}
          <div className="relative z-10">
            {isOpen ? (
              <X className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
            ) : (
              <MessageCircle className="h-6 w-6 transition-transform duration-300" />
            )}
          </div>
          {hasNewMessages && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-bounce z-20" />
          )}
        </Button>
      </div>

      {/* Painel de chat — mobile: fullscreen; >=sm: card flutuante */}
      <div
        className={cn(
          "fixed z-40 bg-background transition-all duration-500 ease-out",
          "left-0 right-0 bottom-0 top-0 sm:inset-auto sm:top-auto sm:left-auto",
          "sm:bottom-20 sm:right-2 sm:w-96 sm:h-[80vh] sm:max-h-[600px]",
          "sm:rounded-2xl sm:border sm:border-gold/20 sm:shadow-2xl",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Cabeçalho com fundo mais elegante */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-gold/10 to-transparent">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse flex-shrink-0" />
            <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
              {user.role === "admin" ? "Conversas" : "Suporte Tsara"}
            </h3>
            {hasNewMessages && user.role === "admin" && (
              <Badge variant="secondary" className="text-xs bg-gold/20 text-gold shrink-0">
                {chats.reduce((total, chat) => total + (chat.unreadByAdmin || 0), 0)} novas
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            aria-label="Fechar"
            className="h-10 w-10 shrink-0 hover:bg-gold/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Conteúdo — flex-1 p/ preencher tudo no mobile fullscreen */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {activeInquiry && (
            <div className="p-3 pb-1 shrink-0">
              <ProductInquiryCard product={activeInquiry} />
            </div>
          )}
          {user.role === "admin" ? (
            <AdminChatList 
              chats={chats} 
              onSelectChat={(chatId, chatData) => {
                setSelectedChat(chatId)
                setSelectedChatData(chatData)
              }}
              onDeleteChat={(chatId) => {
                setChatToDelete(chatId)
                setShowDeleteChatDialog(true)
              }}
            />
          ) : (
            <ClientChatList 
              user={user}
              onSelectChat={(chatId) => {
                setSelectedChat(chatId)
              }}
            />
          )}
        </div>

      </div>

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

      {/* Window de chat se selecionado — fullscreen em qualquer tela */}
      {selectedChat && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <header className="flex items-center gap-2 p-2 sm:p-3 border-b bg-gradient-to-r from-gold/5 to-transparent flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedChat(null)}
              aria-label="Voltar"
              className="h-10 w-10 shrink-0 hover:bg-gold/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-sm sm:text-base truncate">
              {user.role === "admin" ? (selectedChatData?.clientName || "Cliente") : "Suporte Tsara"}
            </span>
          </header>
          <div className="flex-1 min-h-0">
            <ChatWindow
              chatId={selectedChat}
              role={user.role === "admin" ? "admin" : "client"}
              senderId={user.id}
              senderName={user.name}
              peerName={user.role === "admin" ? (selectedChatData?.clientName || "Cliente") : "Suporte Tsara"}
              peerAvatar={user.role === "admin" ? selectedChatData?.clientAvatar : undefined}
              peerSubtitle={user.role === "admin" ? selectedChatData?.clientEmail : "Equipe de atendimento"}
              emptyState={
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Selecione uma conversa para começar</p>
                  </div>
                </div>
              }
              inquiryProduct={activeInquiry}
              hideHeader
            />
          </div>
        </div>
      )}
    </>
  )
}

// Lista de chats para administradores com melhor organização
function AdminChatList({ 
  chats, 
  onSelectChat,
  onDeleteChat
}: { 
  chats: Chat[], 
  onSelectChat: (chatId: string, chatData: Chat) => void,
  onDeleteChat: (chatId: string) => void
}) {
  const sortedChats = chats.sort((a, b) => {
    // Ordena por mensagens não lidas primeiro
    if (a.unreadByAdmin > 0 && b.unreadByAdmin === 0) return -1
    if (a.unreadByAdmin === 0 && b.unreadByAdmin > 0) return 1
    
    // Depois por data da última mensagem
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return bTime - aTime
  })

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma conversa ainda</p>
          </div>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {sortedChats.map((chat, index) => (
            <div key={chat.id} className={cn(
              "animate-fade-in",
              "transition-all duration-300",
              index === 0 && "border-gold/20"
            )}>
              <ChatItem
                key={chat.id}
                chat={chat}
                onClick={() => onSelectChat(chat.id, chat)}
                onDeleteChat={onDeleteChat}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Lista de chat para clientes com design mais amigável
function ClientChatList({ 
  user, 
  onSelectChat 
}: { 
  user: any,
  onSelectChat: (chatId: string) => void 
}) {
  // Para clientes, precisamos criar um chat ou obter o existente
  const handleStartChat = async () => {
    try {
      const chat = await getOrCreateChatForClient({
        clientId: user.id,
        clientName: user.name,
        clientEmail: user.email,
        clientAvatar: user.avatar
      })
      onSelectChat(chat.id)
    } catch (error) {
      console.error("Erro ao iniciar chat:", error)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        {/* Ícone grande e amigável */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
          <MessageCircle className="h-10 w-10 text-gold" />
        </div>
        
        <h4 className="font-semibold text-lg mb-2 text-foreground">Precisa de ajuda?</h4>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          Nossa equipe está pronta para ajudar você com qualquer dúvida sobre produtos, consultas ou serviços.
        </p>
        
        <Button 
          onClick={handleStartChat}
          className="w-full bg-gradient-to-r from-gold to-gold/90 hover:from-gold hover:to-gold text-black font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          size="lg"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Iniciar Conversa
        </Button>
        
        {/* Informações adicionais */}
        <div className="mt-6 space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Atendimento em tempo real
          </p>
          <p>Resposta rápida e personalizada</p>
        </div>
      </div>
    </div>
  )
}

// Item de chat individual com melhor visual
function ChatItem({ chat, onClick, onDeleteChat }: { chat: Chat, onClick: () => void, onDeleteChat?: (chatId: string) => void }) {
  const unreadCount = chat.unreadByAdmin || 0
  const lastMessage = chat.lastMessage || "Nenhuma mensagem"
  const lastMessageTime = chat.lastMessageAt 
    ? chat.lastMessageAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : ""
  const hasUnread = unreadCount > 0

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300",
        "hover:bg-gold/10 hover:border-gold/20",
        "border border-transparent hover:border-gold/20",
        hasUnread && "bg-gold/5 border-gold/20"
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 ring-2 ring-background">
          <AvatarImage src={chat.clientAvatar} alt={chat.clientName} />
          <AvatarFallback className="bg-gold/20 text-gold font-semibold">
            {chat.clientName?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Indicador online para clientes recentes */}
        {hasUnread && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium text-sm truncate">{chat.clientName}</p>
          {hasUnread && (
            <Badge variant="secondary" className="text-xs bg-red-500 text-white border-0">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-sm truncate transition-colors",
            hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {lastMessage}
          </p>
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
            {lastMessageTime}
          </span>
        </div>
      </div>
      
      {/* Botão de ações */}
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onDeleteChat?.(chat.id)
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
  )
}