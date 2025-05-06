import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/conges/[id] - Récupérer une demande de congé par son ID
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const demandeConge = await prisma.demandeConge.findUnique({
      where: {
        id: params.id,
      },
      include: {
        utilisateur: true,
        collaborateur: true,
        notifications: true,
      },
    })

    if (!demandeConge) {
      return NextResponse.json({ error: "Demande de congé non trouvée" }, { status: 404 })
    }

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedDemandeConge = {
      ...demandeConge,
      dateDebut: new Date(demandeConge.dateDebut),
      dateFin: new Date(demandeConge.dateFin),
      dateCreation: new Date(demandeConge.dateCreation),
      dateModification: new Date(demandeConge.dateModification),
    }

    return NextResponse.json(formattedDemandeConge)
  } catch (error) {
    console.error("Erreur lors de la récupération de la demande de congé:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de la demande de congé" }, { status: 500 })
  }
}

// PUT /api/conges/[id] - Mettre à jour une demande de congé
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const data = await request.json()

    // Convertir les dates en format ISO pour Prisma
    const demandeData = {
      ...data,
      dateDebut: new Date(data.dateDebut),
      dateFin: new Date(data.dateFin),
      dateModification: new Date(),
    }

    const demandeConge = await prisma.demandeConge.update({
      where: {
        id: params.id,
      },
      data: demandeData,
      include: {
        utilisateur: true,
        collaborateur: true,
      },
    })

    // Si le statut a changé, créer une notification pour l'utilisateur
    if (data.statut === "Approuvé" || data.statut === "Refusé") {
      await prisma.notification.create({
        data: {
          utilisateurId: demandeConge.utilisateurId,
          message: `Votre demande de congés a été ${data.statut.toLowerCase()}`,
          lien: `/rh/conges?id=${demandeConge.id}`,
          dateCreation: new Date(),
          lue: false,
          type: "conge",
          demandeId: demandeConge.id,
        },
      })
    }

    return NextResponse.json(demandeConge)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la demande de congé:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la demande de congé" }, { status: 500 })
  }
}

// DELETE /api/conges/[id] - Supprimer une demande de congé
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Supprimer d'abord les notifications associées
    await prisma.notification.deleteMany({
      where: {
        demandeId: params.id,
      },
    })

    // Ensuite supprimer la demande de congé
    await prisma.demandeConge.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression de la demande de congé:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la demande de congé" }, { status: 500 })
  }
}
