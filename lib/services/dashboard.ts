import { collection, getDocs, getCountFromServer, query, where, orderBy, limit } from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { DashboardStats } from "@/lib/types"

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [clientsCount, appointmentsCount, completedSnap, productsSnap] = await Promise.all([
      getCountFromServer(collection(db, FIRESTORE_COLLECTIONS.clients)),
      getCountFromServer(collection(db, FIRESTORE_COLLECTIONS.appointments)),
      getDocs(query(collection(db, FIRESTORE_COLLECTIONS.appointments), where("status", "==", "completed"))),
      getDocs(query(collection(db, FIRESTORE_COLLECTIONS.products))),
    ])

    const totalRevenue = completedSnap.docs.reduce((acc, d) => acc + (d.data().price || 0), 0)
    const productsSold = productsSnap.docs.reduce((acc, d) => acc + (d.data().sold || 0), 0)

    return {
      revenue: totalRevenue,
      revenueChange: "",
      appointments: appointmentsCount.data().count,
      appointmentsChange: "",
      productsSold,
      productsSoldChange: "",
      newClients: clientsCount.data().count,
      newClientsChange: "",
    }
  } catch {
    return { revenue: 0, revenueChange: "", appointments: 0, appointmentsChange: "", productsSold: 0, productsSoldChange: "", newClients: 0, newClientsChange: "" }
  }
}

export async function getTopProducts(): Promise<{ name: string; sales: number; revenue: string }[]> {
  try {
    const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.products), orderBy("sold", "desc"), limit(4)))
    return snap.docs.map((d) => {
      const p = d.data() as any
      return {
        name: p.name || "Produto",
        sales: p.sold || 0,
        revenue: `R$ ${((p.sold || 0) * (p.price || 0)).toFixed(0)}`,
      }
    })
  } catch {
    return []
  }
}

export async function getRecentAppointments(): Promise<{ id: number; client: string; type: string; date: string; status: string }[]> {
  try {
    const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.appointments), orderBy("createdAt", "desc"), limit(5)))
    return snap.docs.map((d, i) => {
      const data = d.data()
      return {
        id: i + 1,
        client: data.client || "Cliente",
        type: data.typeName || data.type || "Consulta",
        date: data.date ? new Date(data.date + "T12:00:00").toLocaleDateString("pt-BR") : "—",
        status: data.status || "pending",
      }
    })
  } catch {
    return []
  }
}

export async function getRecentOrders() {
  try {
    const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.orders), orderBy("createdAt", "desc"), limit(4)))
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        client: data.client || "Cliente",
        total: `R$ ${(data.total || 0).toFixed(2).replace(".", ",")}`,
        items: (data.items || []).length || 1,
        status: data.status || "processing",
      }
    })
  } catch {
    return []
  }
}
