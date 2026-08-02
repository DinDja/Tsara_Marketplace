"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Send, Image as ImageIcon, Mic, X, Play, Pause, Loader2, Check, CheckCheck, MessageCircle, MoreVertical, Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChat } from "@/lib/hooks/use-chat"
import { compressImage, fileToBase64, deleteMessage } from "@/lib/services/chat"
import { ProductInquiryCard } from "@/components/product-inquiry-card"
import type { ChatMessage, Product } from "@/lib/types"
import { toast } from "sonner"

interface ChatWindowProps {
  chatId: string | null
  role: "admin" | "client"
  senderId: string
  senderName: string
  /** Cabeçalho customizado (avatar+nome do outro lado) */
  peerName: string
  peerAvatar?: string
  peerSubtitle?: string
  /** Produto sendo consultado — exibido como card acima das mensagens */
  inquiryProduct?: Product | null
  /** Callback quando não há chat ainda */
  emptyState?: React.ReactNode
  /** Oculta o cabeçalho interno (útil quando a página fornece seu próprio header) */
  hideHeader?: boolean
}

const MAX_AUDIO_MS = 60_000

export function ChatWindow({
  chatId, role, senderId, senderName, peerName, peerAvatar, peerSubtitle, inquiryProduct, emptyState, hideHeader,
}: ChatWindowProps) {
  const { messages, loading, sending, send } = useChat({ chatId, role })
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [imageMime, setImageMime] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [audioData, setAudioData] = useState<string | null>(null)
  const [audioMime, setAudioMime] = useState<string | null>(null)
  const [recordSeconds, setRecordSeconds] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recordStartRef = useRef<number>(0)

  // Auto-scroll para o fim
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Limpa mídia ao trocar de chat
  useEffect(() => {
    setText("")
    setImageData(null)
    setImagePreview(null)
    setImageMime(null)
    setAudioData(null)
    setAudioMime(null)
    setRecording(false)
  }, [chatId])

  const handleSend = useCallback(async () => {
    if (!chatId) return
    const hasText = text.trim().length > 0
    const hasImage = !!imageData
    const hasAudio = !!audioData
    if (!hasText && !hasImage && !hasAudio) return

    try {
      if (hasImage) {
        await send({
          senderId, senderName, type: "image",
          image: imageData!, imageMime: imageMime ?? "image/jpeg",
        })
        setImageData(null); setImagePreview(null); setImageMime(null)
      } else if (hasAudio) {
        await send({
          senderId, senderName, type: "audio",
          audio: audioData!, audioMime: audioMime ?? "audio/webm",
        })
        setAudioData(null); setAudioMime(null)
      } else {
        await send({ senderId, senderName, type: "text", text: text.trim() })
        setText("")
      }
    } catch (e) {
      toast.error("Falha ao enviar mensagem")
    }
  }, [chatId, text, imageData, audioData, imageMime, audioMime, senderId, senderName, send])

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido")
      return
    }
    try {
      const compressed = await compressImage(file)
      setImageData(compressed)
      setImagePreview(compressed)
      setImageMime(file.type)
    } catch {
      toast.error("Erro ao processar imagem")
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      audioChunksRef.current = []
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data)
      }
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || "audio/webm" })
        if (blob.size > 1024 * 1024) {
          toast.error("Áudio muito longo. Grave no máximo 60s.")
        } else {
          const base64 = await blobToBase64(blob)
          setAudioData(base64)
          setAudioMime(mr.mimeType || "audio/webm")
        }
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mediaRecorderRef.current = mr
      recordStartRef.current = Date.now()
      setRecordSeconds(0)
      setRecording(true)
      recordTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordStartRef.current) / 1000)
        setRecordSeconds(elapsed)
        if (Date.now() - recordStartRef.current >= MAX_AUDIO_MS) {
          stopRecording()
        }
      }, 250)
    } catch {
      toast.error("Não foi possível acessar o microfone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    }
  }, [])

  if (!chatId) {
    return <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">{emptyState ?? "Selecione uma conversa"}</div>
  }

  // Layout flex puro: ocupa toda a altura do container pai (fullscreen ou não).
  // O pai é responsável por definir a altura; aqui só garantimos flex-1/min-h-0.
  return (
    <div className="flex flex-col h-full w-full min-h-0">
      {/* Cabeçalho (quando não ocultado pela página) */}
      {!hideHeader && (
        <div className="flex items-center gap-3 p-2 sm:p-4 border-b bg-gradient-to-r from-gold/5 to-transparent flex-shrink-0">
          <div className="relative">
            <Avatar className="h-9 w-9 sm:h-12 sm:w-12 ring-2 ring-background">
              {peerAvatar ? <AvatarImage src={peerAvatar} alt={peerName} /> : null}
              <AvatarFallback className="bg-gold/20 text-gold font-semibold">
                {peerName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm sm:text-base">{peerName}</p>
            {peerSubtitle ? (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0"></span>
                {peerSubtitle}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Mensagens - flex-1 preenche tudo que sobra do pai */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 py-2 sm:py-3 space-y-1.5 wa-chat-bg"
      >
        {inquiryProduct && (
          <div className="pt-1 pb-2">
            <ProductInquiryCard product={inquiryProduct} />
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-2" />
              <p className="text-muted-foreground">Carregando mensagens...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground px-6">
            <div>
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="mb-1 font-medium">Nenhuma mensagem ainda</p>
              <p className="text-xs">Envie a primeira mensagem para iniciar a conversa.</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, index) => {
              const prev = messages[index - 1]
              const isFirst = !prev || prev.senderRole !== m.senderRole
              return (
                <div
                  key={m.id}
                  className={cn(
                    "animate-fade-in",
                    isFirst ? "mt-3" : "mt-0.5"
                  )}
                >
                  <MessageBubble message={m} mine={m.senderRole === role} isFirst={isFirst} />
                </div>
              )
            })}
            <div className="h-2" />
          </>
        )}
      </div>

      {/* Preview de imagem (inline, acima do composer) */}
      {imagePreview && (
        <div className="p-2 border-t bg-background relative flex-shrink-0">
          <div className="relative inline-block">
            <img src={imagePreview} alt="preview" className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg" />
            <button
              onClick={() => { setImageData(null); setImagePreview(null); setImageMime(null) }}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
              aria-label="Remover imagem"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Composer - mobile first: altura confortável p/ toque */}
      <div className="p-2 sm:p-3 border-t bg-background/95 backdrop-blur border-gold/20 flex-shrink-0">

        {/* Preview de áudio */}
        {audioData && !recording && (
          <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gold/5 rounded-lg border border-gold/20">
            <div className="flex items-center gap-2">
              <AudioMessage url={audioData} />
              <Button size="sm" variant="ghost" onClick={() => { setAudioData(null); setAudioMime(null) }} className="text-destructive hover:text-destructive h-6 sm:h-auto">
                <X className="h-4 w-4" /> Remover
              </Button>
            </div>
          </div>
        )}

        {/* Indicador de gravação */}
        {recording && (
          <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Gravando... {Math.floor(recordSeconds / 60)}:{String(recordSeconds % 60).padStart(2, "0")}
            </span>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={stopRecording} 
              className="ml-auto h-6 sm:h-auto"
            >
              <X className="h-4 w-4 mr-1" /> Parar
            </Button>
          </div>
        )}

        {/* Input de mensagem - mobile first: alvo de toque grande (44px+) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={recording || sending}
            title="Enviar imagem"
            aria-label="Enviar imagem"
            className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 hover:bg-gold/20 transition-colors"
          >
            <ImageIcon className="h-5 w-5 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={recording ? stopRecording : startRecording}
            disabled={sending || !!imageData}
            title={recording ? "Parar gravação" : "Gravar áudio"}
            aria-label={recording ? "Parar gravação" : "Gravar áudio"}
            className={cn(
              "h-10 w-10 sm:h-11 sm:w-11 shrink-0 transition-colors",
              recording ? "text-red-500 bg-red-50 hover:bg-red-100" : "hover:bg-gold/20"
            )}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0 relative">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === "Enter" && !e.shiftKey) { 
                  e.preventDefault(); 
                  handleSend() 
                }
              }}
              placeholder="Digite sua mensagem..."
              disabled={recording || sending || !!imageData || !!audioData}
              className="h-11 sm:h-11 pr-14 sm:pr-16 text-base sm:text-sm"
              maxLength={500}
            />
            {text.length > 0 && (
              <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground tabular-nums pointer-events-none">
                {text.length}/500
              </span>
            )}
          </div>
          <Button 
            onClick={handleSend} 
            disabled={sending || recording || (!text.trim() && !imageData && !audioData)}
            size="icon"
            aria-label="Enviar mensagem"
            className="h-11 w-11 shrink-0 bg-gradient-to-r from-gold to-gold/90 hover:from-gold hover:to-gold text-black shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

const WAVEFORM_BARS = 28

function AudioMessage({ url, mine }: { url: string; mine?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onMeta = () => setDuration(el.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTime = () => setCurrentTime(el.currentTime)
    const onEnd = () => { setIsPlaying(false); setCurrentTime(0) }
    const onWaiting = () => setIsLoading(true)
    const onPlaying = () => setIsLoading(false)
    const onCanPlay = () => setIsLoading(false)
    el.addEventListener("loadedmetadata", onMeta)
    el.addEventListener("durationchange", onMeta)
    el.addEventListener("play", onPlay)
    el.addEventListener("pause", onPause)
    el.addEventListener("timeupdate", onTime)
    el.addEventListener("ended", onEnd)
    el.addEventListener("waiting", onWaiting)
    el.addEventListener("playing", onPlaying)
    el.addEventListener("canplay", onCanPlay)
    return () => {
      el.removeEventListener("loadedmetadata", onMeta)
      el.removeEventListener("durationchange", onMeta)
      el.removeEventListener("play", onPlay)
      el.removeEventListener("pause", onPause)
      el.removeEventListener("timeupdate", onTime)
      el.removeEventListener("ended", onEnd)
      el.removeEventListener("waiting", onWaiting)
      el.removeEventListener("playing", onPlaying)
      el.removeEventListener("canplay", onCanPlay)
    }
  }, [])

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }

  const progress = duration ? currentTime / duration : 0
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
  const remaining = duration ? Math.max(0, duration - currentTime) : 0

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current
    if (!el || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    el.currentTime = ratio * duration
    setCurrentTime(el.currentTime)
  }

  return (
    <div className="flex items-center gap-3 min-w-[220px] max-w-[300px] py-1">
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        className={cn(
          "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95",
          mine
            ? "bg-black/15 text-black hover:bg-black/25"
            : "bg-gold text-black hover:bg-gold/90 shadow-md hover:shadow-md hover:shadow-gold/30"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" />
        )}
      </button>
      <audio ref={audioRef} src={url} preload="metadata" className="hidden" />
      <div className="flex-1 min-w-0">
        <div
          onClick={seek}
          className="flex items-end gap-[3px] h-9 cursor-pointer select-none group/wave"
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={duration ?? 0}
          aria-valuenow={currentTime}
        >
          {Array.from({ length: WAVEFORM_BARS }).map((_, i) => {
            const ratio = i / (WAVEFORM_BARS - 1)
            const active = ratio <= progress
            // pseudo-random heights from sine wave
            const h = 40 + Math.round(Math.sin(i * 1.3) * 25 + Math.cos(i * 0.7) * 18)
            return (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-colors duration-200",
                  isPlaying && active && "animate-pulse",
                  mine
                    ? active ? "bg-black/80" : "bg-black/25"
                    : active ? "bg-gold" : "bg-gold/30 group-hover/wave:bg-gold/45"
                )}
                style={{
                  height: `${Math.max(18, Math.min(100, h))}%`,
                  animationDelay: `${i * 30}ms`,
                  animationDuration: "0.9s",
                }}
              />
            )
          })}
        </div>
        <div className={cn(
          "flex items-center justify-between mt-1.5 text-[11px] font-medium tabular-nums",
          mine ? "text-black/70" : "text-muted-foreground"
        )}>
          <span>{isPlaying ? fmt(currentTime) : "0:00"}</span>
          <span>{duration ? fmt(remaining) : "0:00"}</span>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  mine,
  isFirst = true,
}: {
  message: ChatMessage
  mine: boolean
  isFirst?: boolean
}) {
  const time = message.createdAt instanceof Date
    ? message.createdAt
    : new Date(message.createdAt as any)
  const timeStr = time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  const handleDeleteMessage = async () => {
    try {
      await deleteMessage(message.chatId, message.id)
      toast.success("Mensagem excluída")
    } catch (error) {
      toast.error("Erro ao excluir mensagem")
    }
  }

  const isMedia = message.type === "image" || message.type === "audio"

  // Cantos estilo WhatsApp: "rabicho" kurvo na bolha do lado certo
  const cornerClasses = mine
    ? isFirst
      ? "rounded-2xl rounded-tr-md"
      : "rounded-2xl rounded-tr-md"
    : isFirst
      ? "rounded-2xl rounded-tl-md"
      : "rounded-2xl rounded-tl-md"

  return (
    <div className={cn("flex group relative", mine ? "justify-end pr-1" : "justify-start pl-1")}>
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[75%] px-2.5 py-2 shadow-sm",
          cornerClasses,
          mine
            ? "bg-[#d9fdd3] text-foreground"
            : "bg-background border border-border shadow-sm"
        )}
      >
        {/* Remetente (apenas para mensagens recebidas) */}
        {!mine && message.senderName && (
          <p className="text-xs font-semibold text-gold mb-1 px-1">{message.senderName}</p>
        )}

        {/* Conteúdo da mensagem */}
        {message.type === "text" && (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed px-1">
            {message.text}
          </p>
        )}

        {message.type === "image" && message.image && (
          <div className="group/img relative">
            <img
              src={message.image}
              alt="imagem"
              className="rounded-lg max-w-full max-h-72 object-cover cursor-pointer transition-transform hover:scale-[1.02]"
            />
          </div>
        )}

        {message.type === "audio" && message.audio && (
          <AudioMessage url={message.audio} mine={mine} />
        )}

        {/* Footer com timestamp e status - WhatsApp style, dentro da bolha */}
        <div
          className={cn(
            "flex items-center gap-1 mt-0.5 select-none",
            isMedia ? "justify-end pr-1 -mb-1" : "justify-end pr-1",
            mine ? "text-muted-foreground" : "text-muted-foreground"
          )}
          style={{ fontSize: "11px", float: "right", marginLeft: "auto", opacity: 0.85 }}
        >
          <span className="tabular-nums">{timeStr}</span>
          {mine && (
            <>
              {message.status === "read" && (
                <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
              )}
              {message.status === "delivered" && (
                <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {message.status === "sent" && (
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {message.status === "sending" && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
            </>
          )}
        </div>
        <div className="clear-both" />

        {/* Botão de exclusão (mensagens próprias) */}
        {mine && (
          <div className="absolute -top-1 right-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-destructive/15 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleDeleteMessage}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Excluir mensagem
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
