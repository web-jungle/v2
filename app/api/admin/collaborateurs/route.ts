import { prisma } from "@/lib/prisma";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Récupérer tous les collaborateurs avec leur statut de compte
    const collaborateurs = await prisma.collaborateur.findMany({
      include: {
        compte: true, // Inclure les informations du compte pour le champ aCompte
      },
    });

    // Mise à jour du champ aCompte basé sur l'existence d'un compte associé
    for (const collaborateur of collaborateurs) {
      await prisma.collaborateur.update({
        where: { id: collaborateur.id },
        data: {
          aCompte: collaborateur.compte !== null,
        },
      });
    }

    // Récupérer à nouveau les collaborateurs avec le champ aCompte à jour
    const updatedCollaborateurs = await prisma.collaborateur.findMany();

    return NextResponse.json(updatedCollaborateurs, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des collaborateurs:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la récupération des collaborateurs",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
