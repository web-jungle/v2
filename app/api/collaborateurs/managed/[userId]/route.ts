import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Récupérer le compte du manager
    const managerAccount = await prisma.compte.findUnique({
      where: { id: userId },
      include: {
        collaborateur: true,
        collaborateursGeres: true,
      },
    });

    if (!managerAccount) {
      return NextResponse.json(
        { error: "Compte manager non trouvé" },
        { status: 404 }
      );
    }

    // Préparer le tableau de collaborateurs: le manager lui-même + ceux qu'il gère
    const collaborateurs = [
      managerAccount.collaborateur,
      ...managerAccount.collaborateursGeres,
    ];

    return NextResponse.json(collaborateurs);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des collaborateurs gérés:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
