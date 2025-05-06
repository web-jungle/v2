import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/contrats/[id] - Récupérer un contrat de maintenance par son ID
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const contrat = await prisma.contratMaintenance.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!contrat) {
      return NextResponse.json({ error: "Contrat de maintenance non trouvé" }, { status: 404 })
    }

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedContrat = {
      ...contrat,
      dateDebut: new Date(contrat.dateDebut),
      dateEcheance: new Date(contrat.dateEcheance),
      dateCreation: new Date(contrat.dateCreation),
      dateDerniereModification: new Date(contrat.dateDerniereModification),
    }

    return NextResponse.json(formattedContrat)
  } catch (error) {
    console.error("Erreur lors de la récupération du contrat de maintenance:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du contrat de maintenance" }, { status: 500 })
  }
}

// PUT /api/contrats/[id] - Mettre à jour un contrat de maintenance
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const data = await request.json()

    // Convertir les dates en format ISO pour Prisma
    const contratData = {
      ...data,
      dateDebut: new Date(data.dateDebut),
      dateEcheance: new Date(data.dateEcheance),
      dateDerniereModification: new Date(),
    }

    const contrat = await prisma.contratMaintenance.update({
      where: {
        id: params.id,
      },
      data: contratData,
    })

    return NextResponse.json(contrat)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contrat de maintenance:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du contrat de maintenance" }, { status: 500 })
  }
}

// DELETE /api/contrats/[id] - Supprimer un contrat de maintenance
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await prisma.contratMaintenance.delete({
      where: {
        id: params.id,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du contrat de maintenance:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du contrat de maintenance" }, { status: 500 })
  }
}
