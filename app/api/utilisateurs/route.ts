import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// GET /api/utilisateurs - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      select: {
        id: true,
        identifiant: true,
        nom: true,
        role: true,
        collaborateurId: true,
        collaborateursGeres: true,
        createdAt: true,
      },
    });
    return NextResponse.json(utilisateurs);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

// POST /api/utilisateurs - Créer un nouvel utilisateur
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const utilisateur = await prisma.utilisateur.create({
      data,
      select: {
        id: true,
        identifiant: true,
        nom: true,
        role: true,
        collaborateurId: true,
        collaborateursGeres: true,
        createdAt: true,
      },
    });
    return NextResponse.json(utilisateur, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
