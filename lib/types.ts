export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  images?: string[]
  badge?: string
  stock: number
  sold: number
  status: "active" | "inactive" | "low_stock"
  featured: boolean
  description?: string
  freeShipping?: boolean
  priceOnRequest?: boolean
  stockManaged?: boolean
  source?: ProductSource
  courseId?: string
  createdAt: Date
  updatedAt: Date
}

export type ProductCategory = "Cristais" | "Velas" | "Incensos" | "Oráculos" | "Acessórios" | "Rituais" | "Cursos"

export interface ProductSource {
  provider: "luar" | string
  id: string
  url?: string
  categoryId?: string
  categoryName?: string
  images?: string[]
  importedAt?: Date
}

export interface ConsultationType {
  id: string
  name: string
  duration: string
  price: number
  originalPrice?: number
  description: string
  features: string[]
  popular: boolean
  icon: string
  image: string
}

export interface Appointment {
  id: string
  clientId?: string
  client: string
  email: string
  phone: string
  type: string
  typeName: string
  date: string
  time: string
  status: "confirmed" | "pending" | "cancelled" | "completed"
  price: number
  notes?: string
  message?: string
  coupon?: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  totalSpent: number
  totalAppointments: number
  totalOrders: number
  lastActivity: string
  vip: boolean
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  phone?: string
  avatar?: string
  createdAt: Date
}

export interface CartItem {
  id: string
  productId: string
  name: string
  category: string
  price: number
  quantity: number
  image: string
  freeShipping?: boolean
  status?: string
  stock?: number
  priceOnRequest?: boolean
  stockManaged?: boolean
}

export interface Order {
  id: string
  clientId: string
  client: string
  items: CartItem[]
  total: number
  subtotal: number
  discount: number
  shipping: number
  coupon?: string
  shippingAddress?: string
  paymentMethod?: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  orderNsu?: string
  checkoutUrl?: string
  transactionNsu?: string
  paidAmount?: number
  captureMethod?: string
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  revenue: number
  revenueChange: string
  appointments: number
  appointmentsChange: string
  productsSold: number
  productsSoldChange: string
  newClients: number
  newClientsChange: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

/** Onde o cupom pode ser usado: loja (produtos), consultas (agendamentos) ou ambos */
export type CouponScope = "all" | "products" | "appointments"

/** Tipo de desconto: percentual sobre o subtotal elegível ou valor fixo em R$ */
export type CouponDiscountType = "percentage" | "fixed"

export interface Coupon {
  id: string
  code: string
  discount: number
  discountType?: CouponDiscountType
  scope?: CouponScope
  /** IDs de produtos específicos aos quais o cupom se aplica (loja) */
  productIds?: string[]
  /** Categorias de produto às quais o cupom se aplica (loja) */
  categories?: ProductCategory[]
  /** IDs de tipos de consulta aos quais o cupom se aplica (agendamento) */
  consultationTypeIds?: string[]
  minPurchase?: number
  maxUses?: number
  usedCount: number
  expiresAt?: Date
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserAddress {
  id: string
  userId: string
  nickname: string
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  isDefault: boolean
  createdAt: Date
}

export interface SavedCard {
  id: string
  userId: string
  nickname: string
  last4: string
  brand: string
  holderName: string
  expiryMonth: number
  expiryYear: number
  type: "credit" | "debit"
  isDefault: boolean
  createdAt: Date
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: Date
}

export type AsyncState<T> = {
  data: T
  loading: boolean
  error: Error | null
}

export type ChatMessageType = "text" | "image" | "audio"

export type ChatMessageStatus = "sending" | "sent" | "delivered" | "read"

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderRole: "admin" | "client"
  type: ChatMessageType
  text?: string
  /** Imagem em base64 (data URL) quando type === "image" */
  image?: string
  /** Mime type da imagem (ex: image/jpeg) */
  imageMime?: string
  /** Áudio em base64 (data URL) quando type === "audio" */
  audio?: string
  /** Mime type do áudio (ex: audio/webm) */
  audioMime?: string
  /** Duração do áudio em segundos (opcional) */
  audioDuration?: number
  status: ChatMessageStatus
  /** Se a mensagem foi deletada */
  deleted?: boolean
  createdAt: Date
}

export interface Chat {
  id: string
  /** ID do usuário cliente */
  clientId: string
  clientName: string
  clientEmail: string
  clientAvatar?: string
  /** ID do admin responsável (preenchido quando admin responde) */
  adminId?: string
  adminName?: string
  /** Referência ao agendamento que originou o chat (opcional) */
  appointmentId?: string
  appointmentType?: string
  appointmentDate?: string
  /** Última mensagem (preview) */
  lastMessage?: string
  lastMessageType?: ChatMessageType
  lastMessageAt?: Date
  /** Contadores de mensagens não lidas */
  unreadByClient: number
  unreadByAdmin: number
  /** Se o chat está arquivado */
  archived?: boolean
  /** Data em que foi arquivado */
  archivedAt?: Date
  createdAt: Date
  updatedAt: Date
}
