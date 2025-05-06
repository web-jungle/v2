import { generateToken, verifyPassword } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/auth - Authentifier un utilisateur
export async function POST(request: Request) {
  try {
    const { identifiant, motDePasse } = await request.json();

    // Pour le compte admin de démonstration (à supprimer en production)
    if (identifiant === "admin" && motDePasse === "adminV66+") {
      // Générer un token pour l'administrateur
      const token = await generateToken("admin-id", "admin");

      return NextResponse.json({
        token,
        userId: "admin-id",
        role: "admin",
        collaborateur_id: null,
        collaborateurs_geres: [],
      });
    }

    // Pour les utilisateurs normaux, vérifier dans la base de données
    const compte = await prisma.compte.findUnique({
      where: {
        identifiant,
      },
      include: {
        collaborateur: {
          select: {
            id: true,
            nom: true,
          },
        },
        collaborateursGeres: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!compte) {
      return NextResponse.json(
        { error: "Identifiant ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    let isPasswordValid = false;

    // Si le mot de passe est déjà haché (contient ":")
    if (compte.motDePasse.includes(":")) {
      isPasswordValid = verifyPassword(motDePasse, compte.motDePasse);
    } else {
      // Sinon, comparer directement (pour la compatibilité avec les anciens mots de passe)
      isPasswordValid = compte.motDePasse === motDePasse;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Identifiant ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Générer un token JWT
    const token = await generateToken(compte.id, compte.role);

    // Retourner le token et les informations nécessaires
    return NextResponse.json({
      token,
      userId: compte.id,
      role: compte.role,
      collaborateur_id: compte.collaborateurId,
      collaborateurs_geres: compte.collaborateursGeres.map(
        (collab) => collab.id
      ),
    });
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'authentification" },
      { status: 500 }
    );
  }
}
