import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// GET /api/collaborateurs - Récupérer les collaborateurs avec filtrage selon le rôle
export async function GET(req: Request) {
  try {
    // Récupérer les informations utilisateur à partir des headers ajoutés par le middleware
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Utilisateur non identifié" },
        { status: 401 }
      );
    }

    // Filtrage des collaborateurs selon le rôle
    if (role === "collaborateur") {
      // Un collaborateur ne peut voir que ses propres informations
      const compte = await prisma.compte.findUnique({
        where: { id: userId },
        select: { collaborateurId: true },
      });

      if (!compte || !compte.collaborateurId) {
        return NextResponse.json(
          { error: "Aucun collaborateur associé à ce compte" },
          { status: 400 }
        );
      }

      const collaborateur = await prisma.collaborateur.findUnique({
        where: { id: compte.collaborateurId },
      });

      if (!collaborateur) {
        return NextResponse.json(
          { error: "Collaborateur non trouvé" },
          { status: 404 }
        );
      }

      return NextResponse.json([collaborateur]);
    } else if (role === "manager") {
      // Un manager peut voir ses informations et celles des collaborateurs qu'il gère
      const compte = await prisma.compte.findUnique({
        where: { id: userId },
        include: {
          collaborateur: true,
          collaborateursGeres: true,
        },
      });

      if (!compte) {
        return NextResponse.json(
          { error: "Compte non trouvé" },
          { status: 404 }
        );
      }

      const collaborateurs = [
        compte.collaborateur,
        ...compte.collaborateursGeres,
      ].filter(Boolean); // Filtrer les valeurs null/undefined

      return NextResponse.json(collaborateurs);
    } else {
      // Admin: récupérer tous les collaborateurs
      const collaborateurs = await prisma.collaborateur.findMany({
        orderBy: {
          nom: "asc",
        },
      });

      return NextResponse.json(collaborateurs);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des collaborateurs:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les collaborateurs" },
      { status: 500 }
    );
  }
}

// POST /api/collaborateurs - Créer un nouveau collaborateur
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nom, couleur, entreprise } = body;

    if (!nom || !couleur || !entreprise) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const collaborateur = await prisma.collaborateur.create({
      data: {
        nom,
        couleur,
        entreprise,
      },
    });

    return NextResponse.json(collaborateur);
  } catch (error) {
    console.error("Erreur lors de la création du collaborateur:", error);
    return NextResponse.json(
      { error: "Impossible de créer le collaborateur" },
      { status: 500 }
    );
  }
}
