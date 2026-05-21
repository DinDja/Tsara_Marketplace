import { Timestamp } from "firebase/firestore"
import { createProduct } from "./products"
import { createConsultationType } from "./consultations"

export async function seedProducts() {
  const products = [
    { name: "Ametista Natural", category: "Cristais" as const, price: 89.90, originalPrice: 120.00, rating: 4.9, reviews: 127, image: "/products/ametista.jpg", badge: "Mais Vendido", stock: 23, sold: 45, status: "active" as const, featured: true, description: "Cristal de ametista bruta天然" },
    { name: "Vela de Proteção 7 Dias", category: "Velas" as const, price: 45.00, rating: 4.8, reviews: 89, image: "/products/vela.jpg", stock: 8, sold: 38, status: "low_stock" as const, featured: false, description: "" },
    { name: "Tarot de Marselha Original", category: "Oráculos" as const, price: 189.90, rating: 5.0, reviews: 234, image: "/products/tarot.jpg", badge: "Premium", stock: 15, sold: 32, status: "active" as const, featured: true, description: "" },
    { name: "Kit Incensos Purificação", category: "Incensos" as const, price: 59.90, rating: 4.7, reviews: 156, image: "/products/incenso.jpg", badge: "Novo", stock: 45, sold: 28, status: "active" as const, featured: false, description: "" },
    { name: "Quartzo Rosa Bruto", category: "Cristais" as const, price: 75.00, rating: 4.9, reviews: 98, image: "/products/quartzo.jpg", stock: 3, sold: 19, status: "low_stock" as const, featured: false, description: "" },
    { name: "Baralho Cigano Tradicional", category: "Oráculos" as const, price: 159.90, originalPrice: 199.90, rating: 4.9, reviews: 312, image: "/products/cigano.jpg", badge: "Favorito", stock: 12, sold: 22, status: "active" as const, featured: true, description: "" },
    { name: "Pêndulo de Cristal", category: "Acessórios" as const, price: 45.00, rating: 4.6, reviews: 67, image: "/products/pendulo.jpg", stock: 0, sold: 15, status: "inactive" as const, featured: false, description: "" },
    { name: "Sal Grosso Consagrado 1kg", category: "Rituais" as const, price: 18.90, rating: 4.8, reviews: 203, image: "/products/sal.jpg", stock: 50, sold: 67, status: "active" as const, featured: false, description: "" },
  ]
  for (const p of products) {
    try { await createProduct(p) } catch { /* skip */ }
  }
}

export async function seedConsultations() {
  const types = [
    { name: "Tarot Terapêutico", duration: "60 min", price: 180, originalPrice: undefined as number | undefined, description: "Uma jornada profunda pelo simbolismo do Tarot.", features: ["Leitura completa de 10 cartas", "Análise de ciclos e padrões", "Orientações práticas", "Gravação da sessão"], popular: true, icon: "🃏", image: "" },
    { name: "Baralho Cigano", duration: "45 min", price: 150, originalPrice: undefined, description: "A sabedoria ancestral cigana aplicada às suas questões.", features: ["Tiragem da Mesa Real", "Foco em questões específicas", "Previsões temporais", "Resumo por escrito"], popular: false, icon: "🔮", image: "" },
    { name: "Sessão Completa", duration: "90 min", price: 280, originalPrice: 330, description: "Combine Tarot e Baralho Cigano para uma visão 360°.", features: ["Tarot + Baralho Cigano", "Análise de todas as áreas", "Mapa energético pessoal", "Acompanhamento por 7 dias"], popular: false, icon: "✨", image: "" },
  ]
  for (const t of types) {
    try { await createConsultationType(t as any) } catch { /* skip */ }
  }
}
