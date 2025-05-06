import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/notifications - Récupérer toutes les notifications
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const utilisateurId = searchParams.get("utilisateurId")

  try {
    const where = utilisateurId ? { utilisateurId } : {}

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        utilisateur: true,
        demandeConge: true,
      },
      orderBy: {
        dateCreation: "desc",
      },
    })

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedNotifications = notifications.map((notification) => ({
      ...notification,
      dateCreation: new Date(notification.dateCreation),
    }))

    return NextResponse.json(formattedNotifications)
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des notifications" }, { status: 500 })
  }
}

// POST /api/notifications - Créer une nouvelle notification
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const notification = await prisma.notification.create({
      data: {
        ...data,
        dateCreation: new Date(),
      },
      include: {
        utilisateur: true,
        demandeConge: true,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la notification" }, { status: 500 })
  }
}
