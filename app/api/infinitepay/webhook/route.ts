import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orderNsu = body.order_nsu || body.orderNsu

    if (!orderNsu) {
      return NextResponse.json({ success: false, message: "order_nsu é obrigatório" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: null })
  } catch {
    return NextResponse.json({ success: false, message: "Erro ao processar webhook" }, { status: 400 })
  }
}
