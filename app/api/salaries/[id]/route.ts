import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/salaries/[id] - Récupérer un salarié spécifique
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id
    
    const salarie = await prisma.salarie.findUnique({
      where: { id },
      include: {
        collaborateur: true,
      },
    })
    
    if (!salarie) {
      return NextResponse.json(
        { error: "Salarié non trouvé" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(salarie)
  } catch (error) {
    console.error("Erreur lors de la récupération du salarié:", error)
    return NextResponse.json(
      { error: "Impossible de récupérer le salarié" },
      { status: 500 }
    )
  }
}

// PATCH /api/salaries/[id] - Mettre à jour un salarié
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id
    const requestData = await req.json()
    
    // Extraire uniquement les champs qui existent dans le modèle Salarie
    const {
      nom,
      prenom,
      classification,
      dateEntree,
      typeContrat,
      dureeContrat,
      certifications,
      habilitations,
      entreprise,
      poste,
      email,
      telephone,
      adresse,
      codePostal,
      ville,
      dateNaissance,
      numeroSecu,
      collaborateurId,
    } = requestData
    
    // Récupérer le salarié existant
    const existingSalarie = await prisma.salarie.findUnique({
      where: { id },
      include: { collaborateur: true },
    })
    
    if (!existingSalarie) {
      return NextResponse.json(
        { error: "Salarié non trouvé" },
        { status: 404 }
      )
    }
    
    // Données de base pour la mise à jour du salarié
    const salarieUpdateData = {
      nom,
      prenom,
      classification,
      dateEntree: new Date(dateEntree),
      typeContrat,
      dureeContrat,
      certifications: certifications || [],
      habilitations: habilitations || [],
      entreprise,
      poste,
      email,
      telephone,
      adresse,
      codePostal,
      ville,
      dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
      numeroSecu,
    }
    
    // Gérer le collaborateur
    let finalCollaborateurId = existingSalarie.collaborateurId
    
    // Si un collaborateurId est spécifiquement fourni
    if (collaborateurId !== undefined) {
      // Si on veut supprimer l'association
      if (collaborateurId === "aucun" || collaborateurId === null) {
        finalCollaborateurId = null
      } 
      // Si on veut changer l'association pour un nouveau collaborateur
      else if (collaborateurId !== existingSalarie.collaborateurId) {
        // Vérifier si ce collaborateur est déjà associé à un autre salarié
        const otherSalarie = await prisma.salarie.findUnique({
          where: { 
            collaborateurId: collaborateurId,
          },
        })
        
        if (otherSalarie && otherSalarie.id !== id) {
          return NextResponse.json(
            { error: "Ce collaborateur est déjà associé à un autre salarié" },
            { status: 400 }
          )
        }
        
        finalCollaborateurId = collaborateurId
      }
      // Sinon on garde l'association existante
    }
    
    // Si le salarié a un collaborateur associé et que ce collaborateur doit être mis à jour
    if (existingSalarie.collaborateur && finalCollaborateurId === existingSalarie.collaborateurId) {
      // Mettre à jour le collaborateur si le nom ou l'entreprise ont changé
      if (
        `${nom} ${prenom}` !== existingSalarie.collaborateur.nom ||
        entreprise !== existingSalarie.collaborateur.entreprise
      ) {
        // On vérifie que collaborateurId n'est pas null avant de l'utiliser
        if (existingSalarie.collaborateurId) {
          await prisma.collaborateur.update({
            where: { id: existingSalarie.collaborateurId },
            data: {
              nom: `${nom} ${prenom}`,
              entreprise,
            },
          })
        }
      }
    }
    
    // Mettre à jour le salarié
    const salarie = await prisma.salarie.update({
      where: { id },
      data: {
        ...salarieUpdateData,
        collaborateurId: finalCollaborateurId,
      },
      include: {
        collaborateur: true,
      },
    })
    
    return NextResponse.json(salarie)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du salarié:", error)
    return NextResponse.json(
      { error: "Impossible de mettre à jour le salarié: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}

// DELETE /api/salaries/[id] - Supprimer un salarié
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id
    
    // Récupérer le salarié pour obtenir son collaborateurId
    const salarie = await prisma.salarie.findUnique({
      where: { id },
    })
    
    if (!salarie) {
      return NextResponse.json(
        { error: "Salarié non trouvé" },
        { status: 404 }
      )
    }
    
    // Supprimer le salarié
    await prisma.salarie.delete({
      where: { id },
    })
    
    // Note: Le collaborateur reste dans la base de données
    // Si vous souhaitez également le supprimer, décommentez le code ci-dessous
    /*
    await prisma.collaborateur.delete({
      where: { id: salarie.collaborateurId },
    })
    */
    
    return NextResponse.json({ success: true, message: "Salarié supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du salarié:", error)
    return NextResponse.json(
      { error: "Impossible de supprimer le salarié" },
      { status: 500 }
    )
  }
}
