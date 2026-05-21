import { collection, getDocs } from "firebase/firestore"
import { db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { DashboardStats } from "@/lib/types"

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [clientsSnap, appointmentsSnap, productsSnap] = await Promise.all([
      getDocs(collection(db, FIRESTORE_COLLECTIONS.clients)),
      getDocs(collection(db, FIRESTORE_COLLECTIONS.appointments)),
      getDocs(collection(db, FIRESTORE_COLLECTIONS.products)),
    ])

    const appointments = appointmentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any))
    const completed = appointments.filter((a) => a.status === "completed")
    const totalRevenue = completed.reduce((acc, a) => acc + (a.price || 0), 0)
    const productsSold = productsSnap.docs.reduce((acc, d) => acc + (d.data().sold || 0), 0)

    return {
      revenue: totalRevenue,
      revenueChange: "",
      appointments: appointments.length,
      appointmentsChange: "",
      productsSold,
      productsSoldChange: "",
      newClients: clientsSnap.size,
      newClientsChange: "",
    }
  } catch {
    return { revenue: 0, revenueChange: "", appointments: 0, appointmentsChange: "", productsSold: 0, productsSoldChange: "", newClients: 0, newClientsChange: "" }
  }
}

export async function getTopProducts(): Promise<{ name: string; sales: number; revenue: string }[]> {
  try {
    const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.products))
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 4)
      .map((p) => ({
        name: p.name || "Produto",
        sales: p.sold || 0,
        revenue: `R$ ${((p.sold || 0) * (p.price || 0)).toFixed(0)}`,
      }))
  } catch {
    return []
  }
}

export async function getRecentAppointments(): Promise<{ id: number; client: string; type: string; date: string; status: string }[]> {
  try {
    const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.appointments))
    return snap.docs.slice(0, 5).map((d, i) => {
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
    const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.orders))
    return snap.docs.slice(0, 4).map((d) => {
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
