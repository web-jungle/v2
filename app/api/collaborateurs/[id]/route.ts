import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Récupérer un collaborateur spécifique
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id
    
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { id },
    })
    
    if (!collaborateur) {
      return NextResponse.json(
        { error: "Collaborateur non trouvé" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(collaborateur)
  } catch (error) {
    console.error("Erreur lors de la récupération du collaborateur:", error)
    return NextResponse.json(
      { error: "Impossible de récupérer le collaborateur" },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour un collaborateur
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id
    const body = await req.json()
    const { nom, couleur, entreprise } = body
    
    const collaborateur = await prisma.collaborateur.update({
      where: { id },
      data: {
        nom,
        couleur,
        entreprise,
      },
    })
    
    return NextResponse.json(collaborateur)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du collaborateur:", error)
    return NextResponse.json(
      { error: "Impossible de mettre à jour le collaborateur" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un collaborateur
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id
    
    await prisma.collaborateur.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du collaborateur:", error)
    return NextResponse.json(
      { error: "Impossible de supprimer le collaborateur" },
      { status: 500 }
    )
  }
}
