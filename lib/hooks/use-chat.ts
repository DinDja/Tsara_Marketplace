"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  subscribeMessages,
  subscribeChat,
  sendMessage as sendMessageSvc,
  markChatAsRead,
  type SendMessageInput,
} from "@/lib/services/chat"
import type { Chat, ChatMessage } from "@/lib/types"

interface UseChatOptions {
  chatId: string | null
  /** Papel do usuário atual neste chat */
  role: "admin" | "client"
}

interface UseChatResult {
  chat: Chat | null
  messages: ChatMessage[]
  loading: boolean
  sending: boolean
  send: (input: Omit<SendMessageInput, "chatId" | "senderRole">) => Promise<void>
}

/**
 * Hook que gerencia um chat em tempo real: mensagens, status do chat e envio.
 */
export function useChat({ chatId, role }: UseChatOptions): UseChatResult {
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const lastMessageIds = useRef<Set<string>>(new Set())

  // Inscreve no chat e nas mensagens em tempo real
  useEffect(() => {
    if (!chatId) {
      setChat(null)
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    lastMessageIds.current = new Set()

    const unsubChat = subscribeChat(chatId, (c) => {
      setChat(c)
    })

    const unsubMsgs = subscribeMessages(chatId, (msgs) => {
      // Detecta novas mensagens recebidas (não enviadas por mim) para marcar como lidas
      const newIncoming = msgs.filter(
        (m) => !lastMessageIds.current.has(m.id) && m.senderRole !== role
      )
      setMessages(msgs)
      msgs.forEach((m) => lastMessageIds.current.add(m.id))

      if (newIncoming.length > 0) {
        markChatAsRead(chatId, role).catch(() => {})
      }
      setLoading(false)
    })

    return () => {
      unsubChat()
      unsubMsgs()
    }
  }, [chatId, role])

  const send = useCallback(
    async (input: Omit<SendMessageInput, "chatId" | "senderRole">) => {
      if (!chatId) return
      setSending(true)
      try {
        await sendMessageSvc({ ...input, chatId, senderRole: role })
      } finally {
        setSending(false)
      }
    },
    [chatId, role]
  )

  return { chat, messages, loading, sending, send }
}
