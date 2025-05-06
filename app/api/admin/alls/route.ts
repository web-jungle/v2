import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Récupérer tous les utilisateurs avec leurs collaborateurs associés
    const utilisateurs = await prisma.utilisateur.findMany({
      include: {
        collaborateur: true,
        collaborateursGeres: true, // Inclure la relation many-to-many
      },
    });

    // 2. Récupérer les IDs des collaborateurs déjà associés à un utilisateur
    const collaborateursDejaAssocies = utilisateurs
      .filter((user) => user.collaborateurId !== null)
      .map((user) => user.collaborateurId);

    // 3. Récupérer les collaborateurs qui ne sont pas associés à un utilisateur
    const collaborateursSansUtilisateur = await prisma.collaborateur.findMany({
      where: {
        id: {
          notIn: collaborateursDejaAssocies as string[],
        },
      },
    });

    // 4. Préparer le résultat final
    const resultat = [
      // Utilisateurs avec leurs infos de collaborateur
      ...utilisateurs.map((utilisateur) => ({
        ...utilisateur,
        estUtilisateur: true,
        // Si l'utilisateur a un collaborateur associé, utiliser ses propriétés
        couleur: utilisateur.collaborateur?.couleur,
        entreprise: utilisateur.collaborateur?.entreprise,
        // Transformer collaborateursGeres en un tableau d'IDs pour compatibilité
        collaborateursGeres: utilisateur.collaborateursGeres.map(
          (collab) => collab.id
        ),
      })),

      // Collaborateurs sans utilisateur (convertis en format compatible)
      ...collaborateursSansUtilisateur.map((collaborateur) => ({
        id: collaborateur.id,
        identifiant: null,
        motDePasse: null,
        nom: collaborateur.nom,
        role: null,
        collaborateurId: collaborateur.id,
        collaborateur: collaborateur,
        estUtilisateur: false,
        couleur: collaborateur.couleur,
        entreprise: collaborateur.entreprise,
        collaborateursGeres: [],
      })),
    ];

    return NextResponse.json(resultat);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
