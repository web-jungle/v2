import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/contrats - Récupérer tous les contrats de maintenance
export async function GET() {
  try {
    const contrats = await prisma.contratMaintenance.findMany()

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedContrats = contrats.map((contrat) => ({
      ...contrat,
      dateDebut: new Date(contrat.dateDebut),
      dateEcheance: new Date(contrat.dateEcheance),
      dateCreation: new Date(contrat.dateCreation),
      dateDerniereModification: new Date(contrat.dateDerniereModification),
    }))

    return NextResponse.json(formattedContrats)
  } catch (error) {
    console.error("Erreur lors de la récupération des contrats de maintenance:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des contrats de maintenance" }, { status: 500 })
  }
}

// POST /api/contrats - Créer un nouveau contrat de maintenance
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Convertir les dates en format ISO pour Prisma
    const contratData = {
      ...data,
      dateDebut: new Date(data.dateDebut),
      dateEcheance: new Date(data.dateEcheance),
      dateCreation: new Date(),
      dateDerniereModification: new Date(),
    }

    const contrat = await prisma.contratMaintenance.create({
      data: contratData,
    })

    return NextResponse.json(contrat, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du contrat de maintenance:", error)
    return NextResponse.json({ error: "Erreur lors de la création du contrat de maintenance" }, { status: 500 })
  }
}
