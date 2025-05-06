import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/conges - Récupérer toutes les demandes de congés
export async function GET() {
  try {
    const demandesConges = await prisma.demandeConge.findMany({
      include: {
        utilisateur: true,
        collaborateur: true,
        notifications: true,
      },
    })

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedDemandesConges = demandesConges.map((demande) => ({
      ...demande,
      dateDebut: new Date(demande.dateDebut),
      dateFin: new Date(demande.dateFin),
      dateCreation: new Date(demande.dateCreation),
      dateModification: new Date(demande.dateModification),
    }))

    return NextResponse.json(formattedDemandesConges)
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes de congés:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des demandes de congés" }, { status: 500 })
  }
}

// POST /api/conges - Créer une nouvelle demande de congé
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Convertir les dates en format ISO pour Prisma
    const demandeData = {
      ...data,
      dateDebut: new Date(data.dateDebut),
      dateFin: new Date(data.dateFin),
      dateCreation: new Date(),
      dateModification: new Date(),
    }

    const demandeConge = await prisma.demandeConge.create({
      data: demandeData,
      include: {
        utilisateur: true,
        collaborateur: true,
      },
    })

    // Créer une notification pour l'administrateur
    await prisma.notification.create({
      data: {
        utilisateurId: "1", // ID de l'administrateur
        message: `Nouvelle demande de congés de ${demandeConge.collaborateurNom}`,
        lien: `/rh/conges?id=${demandeConge.id}`,
        dateCreation: new Date(),
        lue: false,
        type: "conge",
        demandeId: demandeConge.id,
      },
    })

    // Créer une notification pour l'utilisateur qui a fait la demande
    await prisma.notification.create({
      data: {
        utilisateurId: demandeConge.utilisateurId,
        message: "Votre demande de congés est en attente de validation",
        lien: `/rh/conges?id=${demandeConge.id}`,
        dateCreation: new Date(),
        lue: true,
        type: "conge",
        demandeId: demandeConge.id,
      },
    })

    return NextResponse.json(demandeConge, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la demande de congé:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la demande de congé" }, { status: 500 })
  }
}
