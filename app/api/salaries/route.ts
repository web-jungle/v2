import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/salaries - Récupérer tous les salariés
export async function GET() {
  try {
    // Récupérer tous les salariés avec leurs données collaborateur associées
    const salaries = await prisma.salarie.findMany({
      include: {
        collaborateur: true,
      },
      orderBy: {
        nom: 'asc',
      },
    })
    
    return NextResponse.json(salaries)
  } catch (error) {
    console.error("Erreur lors de la récupération des salariés:", error)
    return NextResponse.json(
      { error: "Impossible de récupérer les salariés" },
      { status: 500 }
    )
  }
}

// POST /api/salaries - Créer un nouveau salarié
export async function POST(req: Request) {
  try {
    const requestData = await req.json()
    
    // Extraire uniquement les champs qui existent dans le modèle Salarie
    const {
      id,
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
    
    // Données de base pour la création du salarié
    const salarieData = {
      id,
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
    
    // Déterminer le collaborateurId à utiliser
    let finalCollaborateurId = null
    
    // Si un collaborateurId est fourni spécifiquement, vérifier s'il est déjà utilisé
    if (collaborateurId && collaborateurId !== "aucun") {
      // Vérifier si ce collaborateur est déjà associé à un salarié
      const existingSalarie = await prisma.salarie.findUnique({
        where: { collaborateurId: collaborateurId }
      });
      
      if (existingSalarie) {
        return NextResponse.json(
          { error: "Ce collaborateur est déjà associé à un autre salarié" },
          { status: 400 }
        );
      }
      
      finalCollaborateurId = collaborateurId;
    } 
    // Sinon, si aucun collaborateurId n'est fourni et qu'on n'a pas explicitement indiqué "aucun",
    // vérifier si un collaborateur existe déjà avec ce nom
    else if (!collaborateurId) {
      const existingCollaborateur = await prisma.collaborateur.findFirst({
        where: {
          nom: `${nom} ${prenom}`,
        },
      });
      
      // Si un collaborateur existe, vérifier s'il est déjà utilisé
      if (existingCollaborateur) {
        // Vérifier si ce collaborateur est déjà associé à un salarié
        const existingSalarie = await prisma.salarie.findUnique({
          where: { collaborateurId: existingCollaborateur.id }
        });
        
        if (existingSalarie) {
          // Si déjà utilisé, ne pas l'associer
          finalCollaborateurId = null;
        } else {
          // Sinon, l'utiliser
          finalCollaborateurId = existingCollaborateur.id;
        }
      } 
      // Sinon, créer un nouveau collaborateur
      else {
        const newCollaborateur = await prisma.collaborateur.create({
          data: {
            nom: `${nom} ${prenom}`,
            couleur: "#3174ad", // Couleur par défaut
            entreprise,
          },
        });
        finalCollaborateurId = newCollaborateur.id;
      }
    }
    
    // Créer le salarié avec ou sans lien vers un collaborateur
    const salarie = await prisma.salarie.create({
      data: {
        ...salarieData,
        collaborateurId: finalCollaborateurId,
      },
      include: {
        collaborateur: true,
      },
    });
    
    return NextResponse.json(salarie);
  } catch (error) {
    console.error("Erreur lors de la création du salarié:", error);
    return NextResponse.json(
      { error: "Impossible de créer le salarié: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
