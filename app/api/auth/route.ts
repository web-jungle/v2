import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// POST /api/auth - Authentifier un utilisateur
export async function POST(request: Request) {
  try {
    const { identifiant, motDePasse } = await request.json()

    // Vérification spéciale pour l'administrateur
    if (identifiant === "admin" && motDePasse === "adminV66+") {
      return NextResponse.json({
        id: "admin-id",
        identifiant: "admin",
        nom: "Administrateur",
        role: "admin",
        collaborateur_id: null,
        collaborateurs_geres: [],
      })
    }

    // Pour les autres utilisateurs, vérifier dans la base de données
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        identifiant,
        motDePasse,
      },
      select: {
        id: true,
        identifiant: true,
        nom: true,
        role: true,
        collaborateurId: true,
        collaborateursGeres: true,
      },
    })

    if (!utilisateur) {
      return NextResponse.json({ error: "Identifiant ou mot de passe incorrect" }, { status: 401 })
    }

    // Formater la réponse pour correspondre à la structure attendue
    return NextResponse.json({
      id: utilisateur.id,
      identifiant: utilisateur.identifiant,
      nom: utilisateur.nom,
      role: utilisateur.role,
      collaborateur_id: utilisateur.collaborateurId,
      collaborateurs_geres: utilisateur.collaborateursGeres,
    })
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error)
    return NextResponse.json({ error: "Erreur lors de l'authentification" }, { status: 500 })
  }
}
