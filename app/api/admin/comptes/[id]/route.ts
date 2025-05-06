import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const compte = await prisma.compte.findUnique({
      where: { id },
      include: {
        collaborateur: true,
        collaborateursGeres: true,
      },
    });

    if (!compte) {
      return NextResponse.json(
        { message: `Compte avec l'ID ${id} non trouvé` },
        { status: 404 }
      );
    }

    return NextResponse.json(compte, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération du compte:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la récupération du compte",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { identifiant, mot_de_passe, role, collaborateursGeres } = body;

    // Vérifier si le compte existe
    const compteExistant = await prisma.compte.findUnique({
      where: { id },
      include: {
        collaborateursGeres: true,
      },
    });

    if (!compteExistant) {
      return NextResponse.json(
        { message: `Compte avec l'ID ${id} non trouvé` },
        { status: 404 }
      );
    }

    // Préparer les données pour la mise à jour
    const compteData: any = {
      identifiant,
      role,
    };

    // Ajouter le mot de passe si fourni
    if (mot_de_passe) {
      compteData.motDePasse = mot_de_passe;
    }

    // Gérer les collaborateurs gérés
    if (Array.isArray(collaborateursGeres)) {
      // IDs actuels des collaborateurs gérés
      const currentIds = compteExistant.collaborateursGeres.map((c) => c.id);

      // IDs à ajouter et à retirer
      const idsToAdd = collaborateursGeres.filter(
        (id) => !currentIds.includes(id)
      );
      const idsToRemove = currentIds.filter(
        (id) => !collaborateursGeres.includes(id)
      );

      if (idsToAdd.length > 0 || idsToRemove.length > 0) {
        compteData.collaborateursGeres = {};

        if (idsToAdd.length > 0) {
          // S'assurer que nous avons des chaînes d'ID simples, pas des objets
          compteData.collaborateursGeres.connect = idsToAdd.map(
            (id: string | any) => {
              // Si l'ID est un objet avec une propriété id, extraire la valeur
              if (typeof id === "object" && id !== null && "id" in id) {
                return { id: id.id };
              }
              // Sinon utiliser l'ID directement
              return { id };
            }
          );
        }

        if (idsToRemove.length > 0) {
          // S'assurer que nous avons des chaînes d'ID simples, pas des objets
          compteData.collaborateursGeres.disconnect = idsToRemove.map(
            (id: string | any) => {
              // Si l'ID est un objet avec une propriété id, extraire la valeur
              if (typeof id === "object" && id !== null && "id" in id) {
                return { id: id.id };
              }
              // Sinon utiliser l'ID directement
              return { id };
            }
          );
        }
      }
    }

    // Mettre à jour le compte
    const compteModifie = await prisma.compte.update({
      where: { id },
      data: compteData,
      include: {
        collaborateur: true,
        collaborateursGeres: true,
      },
    });

    return NextResponse.json(compteModifie, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compte:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la mise à jour du compte",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Vérifier si le compte existe
    const compte = await prisma.compte.findUnique({
      where: { id },
      include: {
        collaborateur: true,
      },
    });

    if (!compte) {
      return NextResponse.json(
        { message: `Compte avec l'ID ${id} non trouvé` },
        { status: 404 }
      );
    }

    // Supprimer le compte
    await prisma.compte.delete({ where: { id } });

    // Mettre à jour le champ aCompte du collaborateur associé
    if (compte.collaborateur) {
      await prisma.collaborateur.update({
        where: { id: compte.collaborateur.id },
        data: { aCompte: false },
      });
    }

    return NextResponse.json(
      { message: "Compte supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la suppression du compte",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
