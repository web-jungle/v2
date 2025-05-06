import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/collaborateurs - Récupérer tous les collaborateurs
export async function GET() {
  try {
    const collaborateurs = await prisma.collaborateur.findMany({
      orderBy: {
        nom: "asc",
      },
    })
    return NextResponse.json(collaborateurs)
  } catch (error) {
    console.error("Erreur lors de la récupération des collaborateurs:", error)
    return NextResponse.json({ error: "Impossible de récupérer les collaborateurs" }, { status: 500 })
  }
}

// POST /api/collaborateurs - Créer un nouveau collaborateur
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nom, couleur, entreprise } = body
    
    if (!nom || !couleur || !entreprise) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }
    
    const collaborateur = await prisma.collaborateur.create({
      data: {
        nom,
        couleur,
        entreprise,
      },
    })
    
    return NextResponse.json(collaborateur)
  } catch (error) {
    console.error("Erreur lors de la création du collaborateur:", error)
    return NextResponse.json({ error: "Impossible de créer le collaborateur" }, { status: 500 })
  }
}
