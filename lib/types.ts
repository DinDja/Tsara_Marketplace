export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  badge?: string
  stock: number
  sold: number
  status: "active" | "inactive" | "low_stock"
  featured: boolean
  description?: string
  createdAt: Date
  updatedAt: Date
}

export type ProductCategory = "Cristais" | "Velas" | "Incensos" | "Oráculos" | "Acessórios" | "Rituais"

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
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
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
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentMethod?: string
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

export interface Coupon {
  id: string
  code: string
  discount: number
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
  isDefault: boolean
  createdAt: Date
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

export type AsyncState<T> = {
  data: T
  loading: boolean
  error: Error | null
}
