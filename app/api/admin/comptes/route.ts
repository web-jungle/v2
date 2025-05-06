import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer tous les comptes avec leurs relations
    const comptes = await prisma.compte.findMany({
      include: {
        collaborateur: true,
        collaborateursGeres: true,
      },
    });

    return NextResponse.json(comptes, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des comptes:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la récupération des comptes",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      identifiant,
      mot_de_passe,
      role,
      collaborateur_id,
      collaborateursGeres,
    } = body;

    // Vérifier si le collaborateur existe
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { id: collaborateur_id },
      include: { compte: true },
    });

    if (!collaborateur) {
      return NextResponse.json(
        { message: "Collaborateur non trouvé" },
        { status: 404 }
      );
    }

    if (collaborateur.compte) {
      return NextResponse.json(
        { message: "Ce collaborateur a déjà un compte" },
        { status: 400 }
      );
    }

    // Créer le compte
    const compteData: any = {
      identifiant,
      motDePasse: mot_de_passe,
      role,
      collaborateur: {
        connect: { id: collaborateur_id },
      },
    };

    // Ajouter les collaborateurs gérés si c'est un manager
    if (
      role === "manager" &&
      Array.isArray(collaborateursGeres) &&
      collaborateursGeres.length > 0
    ) {
      compteData.collaborateursGeres = {
        connect: collaborateursGeres.map((id: string) => ({ id })),
      };
    }

    // Créer le compte
    const nouveauCompte = await prisma.compte.create({
      data: compteData,
      include: {
        collaborateur: true,
        collaborateursGeres: true,
      },
    });

    // Mettre à jour le champ aCompte du collaborateur
    await prisma.collaborateur.update({
      where: { id: collaborateur_id },
      data: {
        aCompte: true,
      },
    });

    return NextResponse.json(nouveauCompte, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du compte:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la création du compte",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
