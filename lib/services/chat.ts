import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  writeBatch,
} from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { Chat, ChatMessage, ChatMessageType } from "@/lib/types"

const chatsCol = collection(db, FIRESTORE_COLLECTIONS.chats)

function messagesCol(chatId: string) {
  return collection(db, FIRESTORE_COLLECTIONS.chats, chatId, FIRESTORE_COLLECTIONS.chatMessages)
}

function mapChat(d: any): Chat {
  const data = d.data()
  return {
    id: d.id,
    clientId: data.clientId,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientAvatar: data.clientAvatar,
    adminId: data.adminId,
    adminName: data.adminName,
    appointmentId: data.appointmentId,
    appointmentType: data.appointmentType,
    appointmentDate: data.appointmentDate,
    lastMessage: data.lastMessage,
    lastMessageType: data.lastMessageType,
    lastMessageAt: data.lastMessageAt?.toDate?.() ?? new Date(),
    unreadByClient: data.unreadByClient ?? 0,
    unreadByAdmin: data.unreadByAdmin ?? 0,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  }
}

function mapMessage(d: any): ChatMessage {
  const data = d.data()
  return {
    id: d.id,
    chatId: data.chatId,
    senderId: data.senderId,
    senderName: data.senderName,
    senderRole: data.senderRole,
    type: data.type,
    text: data.text,
    image: data.image,
    imageMime: data.imageMime,
    audio: data.audio,
    audioMime: data.audioMime,
    audioDuration: data.audioDuration,
    status: data.status ?? "sent",
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  }
}

function previewFor(type: ChatMessageType, text?: string): string {
  if (type === "image") return "📷 Foto"
  if (type === "audio") return "🎤 Áudio"
  return text ?? ""
}

/**
 * Cria (ou recupera) um chat para um cliente. Cada cliente tem no máximo um chat ativo.
 */
export async function getOrCreateChatForClient(params: {
  clientId: string
  clientName: string
  clientEmail: string
  clientAvatar?: string
  appointmentId?: string
  appointmentType?: string
  appointmentDate?: string
}): Promise<Chat> {
  const q = query(chatsCol, where("clientId", "==", params.clientId), limit(1))
  const snap = await getDocs(q)

  if (!snap.empty) {
    const existing = mapChat(snap.docs[0])
    const updates: Record<string, any> = {}
    if (params.appointmentId && !existing.appointmentId) {
      updates.appointmentId = params.appointmentId
      updates.appointmentType = params.appointmentType
      updates.appointmentDate = params.appointmentDate
    }
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, FIRESTORE_COLLECTIONS.chats, existing.id), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    }
    return { ...existing, ...updates }
  }

  const now = serverTimestamp()
  const ref = await addDoc(chatsCol, {
    clientId: params.clientId,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    clientAvatar: params.clientAvatar ?? null,
    appointmentId: params.appointmentId ?? null,
    appointmentType: params.appointmentType ?? null,
    appointmentDate: params.appointmentDate ?? null,
    adminId: null,
    adminName: null,
    lastMessage: null,
    lastMessageType: null,
    lastMessageAt: null,
    unreadByClient: 0,
    unreadByAdmin: 0,
    createdAt: now,
    updatedAt: now,
  })

  return {
    id: ref.id,
    clientId: params.clientId,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    clientAvatar: params.clientAvatar,
    appointmentId: params.appointmentId,
    appointmentType: params.appointmentType,
    appointmentDate: params.appointmentDate,
    unreadByClient: 0,
    unreadByAdmin: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Lista todos os chats (para o painel admin), ordenados por última mensagem.
 */
export async function listChats(): Promise<Chat[]> {
  const snap = await getDocs(chatsCol)
  return snap.docs.map(mapChat).sort((a, b) => {
    const ta = a.lastMessageAt?.getTime() ?? a.createdAt.getTime()
    const tb = b.lastMessageAt?.getTime() ?? b.createdAt.getTime()
    return tb - ta
  })
}

/**
 * Inscreve para atualizações em tempo real da lista de chats (admin).
 */
export function subscribeChats(cb: (chats: Chat[]) => void): () => void {
  return onSnapshot(chatsCol, (snap) => {
    const chats = snap.docs.map(mapChat).sort((a, b) => {
      const ta = a.lastMessageAt?.getTime() ?? a.createdAt.getTime()
      const tb = b.lastMessageAt?.getTime() ?? b.createdAt.getTime()
      return tb - ta
    })
    cb(chats)
  })
}

/**
 * Inscreve para atualizações em tempo real de um chat específico (cliente).
 */
export function subscribeChat(chatId: string, cb: (chat: Chat | null) => void): () => void {
  return onSnapshot(doc(db, FIRESTORE_COLLECTIONS.chats, chatId), (snap) => {
    cb(snap.exists() ? mapChat(snap) : null)
  })
}

/**
 * Inscreve para mensagens em tempo real de um chat.
 */
export function subscribeMessages(chatId: string, cb: (messages: ChatMessage[]) => void): () => void {
  const q = query(messagesCol(chatId), orderBy("createdAt", "asc"))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(mapMessage))
  })
}

export interface SendMessageInput {
  chatId: string
  senderId: string
  senderName: string
  senderRole: "admin" | "client"
  type: ChatMessageType
  text?: string
  image?: string
  imageMime?: string
  audio?: string
  audioMime?: string
  audioDuration?: number
}

/**
 * Envia uma mensagem (texto, imagem base64 ou áudio base64) e atualiza o preview do chat.
 */
export async function sendMessage(input: SendMessageInput): Promise<string> {
  const now = serverTimestamp()
  const msgRef = await addDoc(messagesCol(input.chatId), {
    chatId: input.chatId,
    senderId: input.senderId,
    senderName: input.senderName,
    senderRole: input.senderRole,
    type: input.type,
    text: input.text ?? null,
    image: input.image ?? null,
    imageMime: input.imageMime ?? null,
    audio: input.audio ?? null,
    audioMime: input.audioMime ?? null,
    audioDuration: input.audioDuration ?? null,
    status: "sent",
    createdAt: now,
  })

  const preview = previewFor(input.type, input.text)
  const unreadField = input.senderRole === "admin" ? "unreadByClient" : "unreadByAdmin"

  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.chats, input.chatId), {
    lastMessage: preview,
    lastMessageType: input.type,
    lastMessageAt: now,
    updatedAt: now,
    [unreadField]: 0,
    ...(input.senderRole === "admin"
      ? { adminId: input.senderId, adminName: input.senderName }
      : {}),
  })

  return msgRef.id
}

/**
 * Marca as mensagens recebidas pelo usuário informado como lidas, zerando o contador.
 */
export async function markChatAsRead(chatId: string, readerRole: "admin" | "client"): Promise<void> {
  const field = readerRole === "admin" ? "unreadByAdmin" : "unreadByClient"
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.chats, chatId), {
    [field]: 0,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Incrementa o contador de não lidas do destinatário (chamado ao receber mensagem).
 * Usado internamente pelo listener de mensagens quando há novas mensagens.
 */
export async function incrementUnread(chatId: string, readerRole: "admin" | "client"): Promise<void> {
  const field = readerRole === "admin" ? "unreadByAdmin" : "unreadByClient"
  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.chats, chatId))
  if (!snap.exists()) return
  const current = (snap.data() as any)[field] ?? 0
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.chats, chatId), {
    [field]: current + 1,
  })
}

/**
 * Exclui um chat e todas as suas mensagens.
 */
export async function deleteChat(chatId: string): Promise<void> {
  const msgsSnap = await getDocs(messagesCol(chatId))
  const batch = writeBatch(db)
  msgsSnap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.chats, chatId))
}

/**
 * Converte um File de imagem em data URL base64.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Compacta uma imagem para no máximo ~800px e qualidade 0.7, retornando data URL base64.
 * Reduz drasticamente o tamanho antes de enviar ao Firestore.
 */
export async function compressImage(file: File, maxSize = 800, quality = 0.7): Promise<string> {
  const dataUrl = await fileToBase64(file)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width)
        width = maxSize
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height)
        height = maxSize
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      const mime = file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg"
      resolve(canvas.toDataURL(mime, quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

/**
 * Exclui uma mensagem específica de um chat.
 */
export async function deleteMessage(chatId: string, messageId: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.chats, chatId, FIRESTORE_COLLECTIONS.chatMessages, messageId))
}
