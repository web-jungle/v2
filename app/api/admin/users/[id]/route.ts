import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Attendre les paramètres de route avant d'y accéder
    const { id: userId } = await params;
    const body = await request.json();
    const {
      identifiant,
      nom,
      role,
      collaborateur_id,
      collaborateurs_geres,
      mot_de_passe,
    } = body;

    console.log("Données reçues par l'API:", {
      userId,
      identifiant,
      nom,
      role,
      collaborateur_id,
      collaborateurs_geres,
      mot_de_passe: mot_de_passe ? "***" : undefined, // Masquer le mot de passe pour la sécurité
    });

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.utilisateur.findUnique({
      where: { id: userId },
      include: {
        collaborateursGeres: true, // Pour connaître l'état actuel des relations
      },
    });

    console.log("Utilisateur existant:", existingUser);

    // Préparer les données pour la mise à jour
    const userData: any = {
      identifiant,
      nom,
      role,
    };

    // Gestion de la relation one-to-one avec un collaborateur
    if (collaborateur_id) {
      // Associer un collaborateur
      userData.collaborateur = {
        connect: { id: collaborateur_id },
      };
    } else if (existingUser?.collaborateurId) {
      // Dissocier le collaborateur actuel si l'utilisateur en avait un mais n'en veut plus
      userData.collaborateur = {
        disconnect: true,
      };
    }

    // Gestion de la relation many-to-many avec les collaborateurs gérés
    if (Array.isArray(collaborateurs_geres)) {
      // IDs des collaborateurs actuellement gérés
      const currentIds =
        existingUser?.collaborateursGeres?.map((c) => c.id) || [];
      // IDs des nouveaux collaborateurs à gérer
      const newIds = collaborateurs_geres;

      // Tableau des IDs à connecter (nouveaux qui n'étaient pas déjà présents)
      const idsToConnect = newIds.filter((id) => !currentIds.includes(id));
      // Tableau des IDs à déconnecter (anciens qui ne sont plus présents)
      const idsToDisconnect = currentIds.filter((id) => !newIds.includes(id));

      // Construire les opérations de mise à jour des relations
      userData.collaborateursGeres = {};

      if (idsToConnect.length > 0) {
        userData.collaborateursGeres.connect = idsToConnect.map(
          (id: string) => ({ id })
        );
      }

      if (idsToDisconnect.length > 0) {
        userData.collaborateursGeres.disconnect = idsToDisconnect.map(
          (id: string) => ({ id })
        );
      }

      console.log("Opérations sur collaborateursGeres:", {
        idsToConnect,
        idsToDisconnect,
        operations: userData.collaborateursGeres,
      });
    }

    // Ajouter le mot de passe si fourni
    if (mot_de_passe) {
      userData.motDePasse = mot_de_passe;
    }

    if (existingUser) {
      // Cas 1: L'utilisateur existe, faire une mise à jour
      console.log("Mise à jour de l'utilisateur avec:", userData);

      const updatedUser = await prisma.utilisateur.update({
        where: { id: userId },
        data: userData,
        include: {
          collaborateur: true,
          collaborateursGeres: true,
        },
      });

      console.log("Utilisateur mis à jour:", updatedUser);

      // Transformer les données pour les renvoyer au format attendu par le frontend
      const formattedUser = {
        ...updatedUser,
        collaborateur_id: updatedUser.collaborateurId,
        collaborateursGeres: updatedUser.collaborateursGeres.map((c) => c.id),
      };

      return NextResponse.json(formattedUser, { status: 200 });
    } else {
      // Vérifier si le collaborateur existe
      const existingCollaborateur = await prisma.collaborateur.findUnique({
        where: { id: userId },
      });

      if (existingCollaborateur) {
        // Cas 2: Collaborateur existe mais pas d'utilisateur - créer un utilisateur
        if (!mot_de_passe) {
          return NextResponse.json(
            { message: "Mot de passe requis pour créer un utilisateur" },
            { status: 400 }
          );
        }

        // Créer un utilisateur en l'associant au collaborateur existant
        const createData: any = {
          id: userId,
          identifiant,
          motDePasse: mot_de_passe,
          nom,
          role,
          collaborateur: {
            connect: { id: userId }, // Associer l'utilisateur au collaborateur existant
          },
        };

        // Ajouter la connexion aux collaborateurs gérés si nécessaire
        if (collaborateurs_geres && collaborateurs_geres.length > 0) {
          createData.collaborateursGeres = {
            connect: collaborateurs_geres.map((id: string) => ({ id })),
          };
        }

        console.log("Création d'un utilisateur avec:", createData);

        const newUser = await prisma.utilisateur.create({
          data: createData,
          include: {
            collaborateur: true,
            collaborateursGeres: true,
          },
        });

        console.log("Nouvel utilisateur créé:", newUser);

        // Transformer les données pour les renvoyer au format attendu par le frontend
        const formattedUser = {
          ...newUser,
          collaborateur_id: newUser.collaborateurId,
          collaborateursGeres: newUser.collaborateursGeres.map((c) => c.id),
        };

        return NextResponse.json(formattedUser, { status: 201 });
      } else {
        // Cas 3: Ni utilisateur ni collaborateur trouvé
        return NextResponse.json(
          { message: `ID ${userId} non trouvé dans la base de données` },
          { status: 404 }
        );
      }
    }
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la mise à jour de l'utilisateur",
        error: error.message,
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
    // Attendre les paramètres de route avant d'y accéder
    const { id: userId } = await params;

    // Vérifier s'il s'agit du dernier administrateur
    const userToDelete = await prisma.utilisateur.findUnique({
      where: { id: userId },
    });
    if (userToDelete?.role === "admin") {
      const adminCount = await prisma.utilisateur.count({
        where: { role: "admin" },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { message: "Impossible de supprimer le dernier administrateur" },
          { status: 400 }
        );
      }
    }

    await prisma.utilisateur.delete({ where: { id: userId } });

    return NextResponse.json(
      { message: "Utilisateur supprimé avec succès" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la suppression de l'utilisateur",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
