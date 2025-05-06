import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/contacts/[id] - Récupérer un contact par son ID
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const contact = await prisma.contact.findUnique({
      where: {
        id: params.id,
      },
      include: {
        utilisateur: true,
        collaborateurs: true,
      },
    })

    if (!contact) {
      return NextResponse.json({ error: "Contact non trouvé" }, { status: 404 })
    }

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedContact = {
      ...contact,
      dateCreation: new Date(contact.dateCreation),
      dateDerniereModification: new Date(contact.dateDerniereModification),
      archiveDate: contact.archiveDate ? new Date(contact.archiveDate) : null,
    }

    return NextResponse.json(formattedContact)
  } catch (error) {
    console.error("Erreur lors de la récupération du contact:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du contact" }, { status: 500 })
  }
}

// PUT /api/contacts/[id] - Mettre à jour un contact
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const data = await request.json()

    // Extraire les IDs des collaborateurs pour mettre à jour les relations
    const { collaborateursIds, ...contactData } = data

    // D'abord, déconnecter tous les collaborateurs existants
    await prisma.contact.update({
      where: {
        id: params.id,
      },
      data: {
        collaborateurs: {
          set: [],
        },
      },
    })

    // Ensuite, mettre à jour le contact avec les nouvelles données et relations
    const contact = await prisma.contact.update({
      where: {
        id: params.id,
      },
      data: {
        ...contactData,
        dateDerniereModification: new Date(),
        collaborateurs: {
          connect: collaborateursIds.map((id: string) => ({ id })),
        },
      },
      include: {
        utilisateur: true,
        collaborateurs: true,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contact:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du contact" }, { status: 500 })
  }
}

// DELETE /api/contacts/[id] - Supprimer un contact
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await prisma.contact.delete({
      where: {
        id: params.id,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du contact:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du contact" }, { status: 500 })
  }
}
