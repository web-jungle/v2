import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// GET /api/contacts - Récupérer tous les contacts
export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        utilisateur: true,
        collaborateurs: true,
      },
    });

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedContacts = contacts.map((contact) => ({
      ...contact,
      dateCreation: new Date(contact.dateCreation),
      dateDerniereModification: new Date(contact.dateDerniereModification),
      archiveDate: contact.archiveDate ? new Date(contact.archiveDate) : null,
    }));

    return NextResponse.json(formattedContacts);
  } catch (error) {
    console.error("Erreur lors de la récupération des contacts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des contacts" },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Créer un nouveau contact
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Extraire les IDs des collaborateurs pour créer les relations
    const { collaborateursIds, ...contactData } = data;

    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        dateCreation: new Date(),
        dateDerniereModification: new Date(),
        collaborateurs: {
          connect: collaborateursIds.map((id: string) => ({ id })),
        },
      },
      include: {
        utilisateur: true,
        collaborateurs: true,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du contact:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du contact" },
      { status: 500 }
    );
  }
}
