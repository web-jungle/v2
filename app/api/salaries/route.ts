import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// GET /api/salaries - Récupérer toutes les fiches de poste
export async function GET() {
  try {
    console.log("GET /api/salaries - Récupération des fiches de poste");

    // Récupérer toutes les fiches de poste avec leurs données collaborateur associées
    const fichesDePoste = await prisma.ficheDePoste.findMany({
      include: {
        collaborateur: true,
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    console.log(`${fichesDePoste.length} fiches de poste trouvées`);

    // Formater les données pour correspondre à l'interface attendue par le frontend
    const formattedData = fichesDePoste.map((fiche) => {
      // Extraire le nom et prénom à partir du nom du collaborateur si disponible
      let nom = "";
      let prenom = "";

      if (fiche.collaborateur?.nom) {
        const nameParts = fiche.collaborateur.nom.split(" ");
        if (nameParts.length > 1) {
          prenom = nameParts.pop() || "";
          nom = nameParts.join(" ");
        } else {
          nom = fiche.collaborateur.nom;
        }
      }

      return {
        id: fiche.id,
        nom: nom,
        prenom: prenom,
        classification: fiche.classification,
        dateEntree: fiche.dateCreation,
        typeContrat: fiche.typeContrat,
        dureeContrat: fiche.dureeContrat,
        certifications: fiche.certifications,
        habilitations: fiche.habilitations,
        entreprise: fiche.entreprise,
        poste: fiche.poste,
        email: fiche.email || "",
        telephone: fiche.telephone || "",
        adresse: fiche.adresse || "",
        codePostal: fiche.codePostal || "",
        ville: fiche.ville || "",
        collaborateur: fiche.collaborateur,
        collaborateurId: fiche.collaborateurId,
        // Champs spécifiques à FicheDePoste
        description: fiche.description,
        competencesRequises: fiche.competencesRequises,
        missions: fiche.missions,
        experience: fiche.experience,
        formation: fiche.formation,
        remuneration: fiche.remuneration,
        avantages: fiche.avantages,
        horaires: fiche.horaires,
        lieuTravail: fiche.lieuTravail,
        dateCreation: fiche.dateCreation,
        dateModification: fiche.dateModification,
        estActive: fiche.estActive,
        dateNaissance: fiche.dateNaissance,
        numeroSecu: fiche.numeroSecu || "",
      };
    });

    console.log("Données formatées et envoyées");
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Erreur lors de la récupération des fiches de poste:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les fiches de poste" },
      { status: 500 }
    );
  }
}

// POST /api/salaries - Créer une nouvelle fiche de poste
export async function POST(req: Request) {
  try {
    const requestData = await req.json();
    console.log("POST /api/salaries - Données reçues:", requestData);

    // Extraire les champs pour la création de la fiche de poste
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
      competencesRequises = [],
      description = `Fiche de poste pour ${nom} ${prenom}`,
      missions = [],
      experience,
      formation,
      remuneration,
      avantages,
      horaires,
      lieuTravail,
    } = requestData;

    // Données pour la création de la fiche de poste
    const ficheDePosteData = {
      classification: classification || "Non spécifiée",
      poste: poste || "Non spécifié",
      entreprise: entreprise || "Non spécifiée",
      typeContrat: typeContrat || "CDI",
      dureeContrat,
      certifications: certifications || [],
      habilitations: habilitations || [],
      competencesRequises: competencesRequises || [],
      description,
      missions: missions || [],
      experience,
      formation,
      remuneration,
      avantages,
      horaires,
      lieuTravail,
      dateCreation: new Date(),
      dateModification: new Date(),
      estActive: true,
      email: email || "",
      telephone: telephone || "",
      adresse: adresse || "",
      codePostal: codePostal || "",
      ville: ville || "",
      dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
      numeroSecu: numeroSecu || "",
    };

    // Gestion du collaborateur associé
    let finalCollaborateurId = null;

    // Si un collaborateurId est fourni spécifiquement
    if (collaborateurId && collaborateurId !== "aucun") {
      // Vérifier si ce collaborateur existe
      const existingCollaborateur = await prisma.collaborateur.findUnique({
        where: { id: collaborateurId },
      });

      if (!existingCollaborateur) {
        return NextResponse.json(
          { error: "Collaborateur non trouvé" },
          { status: 404 }
        );
      }

      // Vérifier si ce collaborateur est déjà associé à une fiche de poste
      const existingFiche = await prisma.ficheDePoste.findFirst({
        where: { collaborateurId },
      });

      if (existingFiche) {
        return NextResponse.json(
          {
            error:
              "Ce collaborateur est déjà associé à une autre fiche de poste",
          },
          { status: 400 }
        );
      }

      finalCollaborateurId = collaborateurId;
    }
    // Si aucun collaborateurId n'est fourni, créer un nouveau collaborateur
    else if (nom && prenom) {
      // Vérifier si un collaborateur existe déjà avec ce nom
      const fullName = `${nom} ${prenom}`;
      const existingCollaborateur = await prisma.collaborateur.findFirst({
        where: { nom: fullName },
      });

      if (existingCollaborateur) {
        // Vérifier si ce collaborateur est déjà associé à une fiche de poste
        const existingFiche = await prisma.ficheDePoste.findFirst({
          where: { collaborateurId: existingCollaborateur.id },
        });

        if (existingFiche) {
          // Si déjà utilisé, on n'associe pas
          finalCollaborateurId = null;
        } else {
          // Sinon, on utilise ce collaborateur
          finalCollaborateurId = existingCollaborateur.id;
        }
      } else {
        // Créer un nouveau collaborateur
        const newCollaborateur = await prisma.collaborateur.create({
          data: {
            nom: fullName,
            couleur: "#3174ad", // Couleur par défaut
            entreprise,
          },
        });
        finalCollaborateurId = newCollaborateur.id;
      }
    }

    // Créer la fiche de poste
    const ficheDePoste = await prisma.ficheDePoste.create({
      data: {
        ...ficheDePosteData,
        collaborateurId: finalCollaborateurId,
      },
      include: {
        collaborateur: true,
      },
    });

    // Formater la réponse pour correspondre à l'interface attendue par le frontend
    const formattedResponse = {
      ...ficheDePoste,
      id: ficheDePoste.id,
      nom:
        nom ||
        ficheDePoste.collaborateur?.nom?.split(" ").slice(0, -1).join(" ") ||
        "",
      prenom: prenom || ficheDePoste.collaborateur?.nom?.split(" ").pop() || "",
      dateEntree: dateEntree || ficheDePoste.dateCreation,
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Erreur lors de la création de la fiche de poste:", error);
    return NextResponse.json(
      {
        error:
          "Impossible de créer la fiche de poste: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
