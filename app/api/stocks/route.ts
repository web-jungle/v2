import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/stocks - Récupérer tous les éléments de stock
export async function GET() {
  try {
    const stockItems = await prisma.stockItem.findMany()
    return NextResponse.json(stockItems)
  } catch (error) {
    console.error("Erreur lors de la récupération des éléments de stock:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des éléments de stock" }, { status: 500 })
  }
}

// POST /api/stocks - Créer un nouvel élément de stock
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const stockItem = await prisma.stockItem.create({
      data,
    })
    return NextResponse.json(stockItem, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de l'élément de stock:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'élément de stock" }, { status: 500 })
  }
}
