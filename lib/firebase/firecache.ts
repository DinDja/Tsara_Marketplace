import {
  getDocsFromCache,
  getDocsFromServer,
  getDocFromCache,
  getDocFromServer,
  type Query,
  type DocumentReference,
  type QuerySnapshot,
  type DocumentSnapshot,
} from "firebase/firestore"

/**
 * TTL (tempo de vida) por coleção, em milissegundos.
 * Ajuste conforme a frequência com que cada tipo de dado muda.
 * Dados que mudam pouco (catálogo, tipos de consulta) => TTL longo.
 * Dados voláteis (estoque, agendamentos) => TTL curto.
 */
export const CACHE_TTL: Record<string, number> = {
  consultations: 60 * 60 * 1000,        // 1h — catálogo raramente muda
  products: 5 * 60 * 1000,              // 5min — estoque/preço podem mudar
  coupons: 60 * 60 * 1000,              // 1h — cupons mudam pouco
  reviews: 15 * 60 * 1000,              // 15min
  cursos: 60 * 60 * 1000,               // 1h
  clients: 60 * 1000,                  // 1min — adminEditing frequente
  users: 5 * 60 * 1000,                 // 5min
  appointments: 30 * 1000,              // 30s — alta volatilidade
  orders: 30 * 1000,                    // 30s
  default: 60 * 1000,                  // 1min fallback
}

/** Marca de quando uma chave foi sincronizada com o servidor. */
function readStamp(key: string): number {
  if (typeof window === "undefined") return 0
  const raw = window.localStorage.getItem(`firecache:${key}`)
  return raw ? Number(raw) : 0
}

function writeStamp(key: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(`firecache:${key}`, String(Date.now()))
}

/** Invalida o cache de uma coleção (chama após criar/atualizar/deletar). */
export function invalidateCache(collection: string): void {
  if (typeof window === "undefined") return
  const prefix = `firecache:`
  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const k = window.localStorage.key(i)
    if (k && k.startsWith(prefix) && k.includes(`:${collection}:`)) {
      window.localStorage.removeItem(k)
    }
  }
}

function isFresh(key: string, ttl: number): boolean {
  return Date.now() - readStamp(key) < ttl
}

/**
 * Lê uma query do cache (sem custo de leitura no servidor).
 * Se o cache estiver vazio OU o TTL tiver expirado, busca do servidor
 * e atualiza a marca de tempo. Retorna sempre um QuerySnapshot.
 *
 * Em SSR não há IndexedDB — cai direto em getDocsFromServer.
 */
export async function cachedQuery(
  cacheKey: string,
  query: Query,
  collection: string,
): Promise<QuerySnapshot> {
  const ttl = CACHE_TTL[collection] ?? CACHE_TTL.default

  if (typeof window !== "undefined" && isFresh(cacheKey, ttl)) {
    try {
      const cached = await getDocsFromCache(query)
      if (!cached.empty) return cached
    } catch {
      // cache não populado ainda — cai para servidor
    }
  }

  const fresh = await getDocsFromServer(query)
  writeStamp(cacheKey)
  return fresh
}

/**
 * Lê um documento único do cache com TTL. Similar a cachedQuery.
 */
export async function cachedDoc(
  cacheKey: string,
  ref: DocumentReference,
  collection: string,
): Promise<DocumentSnapshot> {
  const ttl = CACHE_TTL[collection] ?? CACHE_TTL.default

  if (typeof window !== "undefined" && isFresh(cacheKey, ttl)) {
    try {
      const cached = await getDocFromCache(ref)
      if (cached.exists()) return cached
    } catch {
      // cache vazio — cai para servidor
    }
  }

  const fresh = await getDocFromServer(ref)
  writeStamp(cacheKey)
  return fresh
}
