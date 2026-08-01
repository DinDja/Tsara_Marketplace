export const PRODUCT_CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "Cristais", label: "Cristais" },
  { id: "Velas", label: "Velas Ritualísticas" },
  { id: "Incensos", label: "Incensos" },
  { id: "Oráculos", label: "Oráculos" },
  { id: "Acessórios", label: "Acessórios" },
  { id: "Rituais", label: "Rituais" },
  { id: "Cursos", label: "Cursos" },
] as const

export const CONSULTATION_TYPES_DATA = [
  { id: "tarot", name: "Consulta de Tarot", duration: "45 min", price: 150, description: "Leitura profunda com o Tarot de Marselha", icon: "🃏" },
  { id: "cigano", name: "Baralho Cigano", duration: "30 min", price: 120, description: "Orientações com a sabedoria cigana", icon: "🔮" },
  { id: "completa", name: "Sessão Completa", duration: "90 min", price: 280, description: "Tarot + Baralho Cigano + Orientação espiritual", icon: "✨" },
] as const

export const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00",
] as const

export const MODALITIES = [
  { label: "Online", description: "Via Google Meet ou Zoom" },
  { label: "Telefone", description: "Ligação de voz" },
  { label: "Presencial", description: "São Paulo - SP" },
] as const

export const NAV_LINKS = [
  { href: "/produtos", label: "Loja" },
  { href: "/consultas", label: "Consultas" },
  { href: "/cursos", label: "Cursos" },
  { href: "#depoimentos", label: "Depoimentos" },
] as const

export const ADMIN_NAV = [
  { name: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { name: "Agendamentos", href: "/admin/agendamentos", icon: "Calendar" },
  { name: "Produtos", href: "/admin/produtos", icon: "Package" },
  { name: "Clientes", href: "/admin/clientes", icon: "Users" },
  { name: "Configurações", href: "/admin/configuracoes", icon: "Settings" },
] as const
