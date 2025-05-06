import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/salaries/[id] - Récupérer une fiche de poste spécifique
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const ficheId = params.id;
    console.log("GET /api/salaries/[id] - Récupération de la fiche:", ficheId);

    // Chercher la fiche de poste par son ID
    const ficheDePoste = await prisma.ficheDePoste.findUnique({
      where: { id: ficheId },
      include: {
        collaborateur: true,
      },
    });

    if (!ficheDePoste) {
      return NextResponse.json(
        { error: "Fiche de poste non trouvée" },
        { status: 404 }
      );
    }

    // Extraire le nom et prénom à partir du nom du collaborateur si disponible
    let nom = "";
    let prenom = "";

    if (ficheDePoste.collaborateur?.nom) {
      const nameParts = ficheDePoste.collaborateur.nom.split(" ");
      if (nameParts.length > 1) {
        prenom = nameParts.pop() || "";
        nom = nameParts.join(" ");
      } else {
        nom = ficheDePoste.collaborateur.nom;
      }
    }

    // Formater la réponse pour correspondre à l'interface attendue par le frontend
    const formattedResponse = {
      ...ficheDePoste,
      nom: nom,
      prenom: prenom,
      dateEntree: ficheDePoste.dateCreation,
      email: ficheDePoste.email || "",
      telephone: ficheDePoste.telephone || "",
      adresse: ficheDePoste.adresse || "",
      codePostal: ficheDePoste.codePostal || "",
      ville: ficheDePoste.ville || "",
      dateNaissance: ficheDePoste.dateNaissance || null,
      numeroSecu: ficheDePoste.numeroSecu || "",
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la fiche de poste:",
      error
    );
    return NextResponse.json(
      { error: "Impossible de récupérer la fiche de poste" },
      { status: 500 }
    );
  }
}

// PATCH /api/salaries/[id] - Mettre à jour un salarié existant
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const ficheId = params.id;
    console.log("PATCH /api/salaries/[id] - ID de la fiche:", ficheId);

    // Vérifier si l'ID est valide
    if (!ficheId) {
      console.error("ID de fiche invalide:", ficheId);
      return NextResponse.json(
        { error: "ID de fiche invalide" },
        { status: 400 }
      );
    }

    const requestData = await req.json();
    console.log(
      "PATCH /api/salaries/[id] - Données reçues:",
      JSON.stringify(requestData, null, 2)
    );

    // Vérifier si la fiche de poste existe
    const existingFiche = await prisma.ficheDePoste.findUnique({
      where: { id: ficheId },
      include: {
        collaborateur: true,
      },
    });

    if (!existingFiche) {
      console.error("Fiche non trouvée pour l'ID:", ficheId);

      // Si c'est un ID temporaire, on crée une nouvelle fiche au lieu de renvoyer une erreur
      const isTemporaryId =
        ficheId.startsWith("temp_") || /^\d+$/.test(ficheId);

      if (isTemporaryId) {
        console.log("ID temporaire détecté, création d'une nouvelle fiche");
        // Redirection vers l'endpoint POST pour créer une nouvelle fiche
        const url = new URL(req.url);
        url.pathname = "/api/salaries";

        // Création d'une nouvelle requête avec la méthode POST
        const newRequest = new Request(url, {
          method: "POST",
          headers: req.headers,
          body: JSON.stringify(requestData),
        });

        // Redirection vers l'API POST
        return fetch(newRequest);
      }

      return NextResponse.json(
        { error: "Fiche de poste non trouvée" },
        { status: 404 }
      );
    } else {
      console.log("Fiche existante trouvée:", existingFiche.id);
    }

    // Extraire les données de la requête
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

    console.log("Données extraites de la requête:");
    console.log("Nom:", nom);
    console.log("Prénom:", prenom);
    console.log("Téléphone reçu:", telephone);
    console.log("Email:", email);
    console.log("Classification:", classification);
    console.log("Poste:", poste);

    // Préparer les données pour la fiche de poste
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
      email: email || "",
      telephone: telephone || "",
      adresse: adresse || "",
      codePostal: codePostal || "",
      ville: ville || "",
      dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
      numeroSecu: numeroSecu || "",
      dateModification: new Date(),
    };

    let updatedFiche;
    let finalCollaborateurId = collaborateurId;

    if (existingFiche) {
      // Mettre à jour la fiche existante
      console.log("Mise à jour d'une fiche existante:", ficheId);

      // Si on change de collaborateur
      if (
        collaborateurId &&
        collaborateurId !== existingFiche.collaborateurId
      ) {
        // Vérifier si le nouveau collaborateur existe
        const newCollaborateur = await prisma.collaborateur.findUnique({
          where: { id: collaborateurId },
        });

        if (!newCollaborateur) {
          return NextResponse.json(
            { error: "Collaborateur non trouvé" },
            { status: 404 }
          );
        }

        // Vérifier si le nouveau collaborateur a déjà une fiche
        const existingFicheForNewCollab = await prisma.ficheDePoste.findUnique({
          where: { collaborateurId },
        });

        if (
          existingFicheForNewCollab &&
          existingFicheForNewCollab.id !== ficheId
        ) {
          return NextResponse.json(
            {
              error:
                "Ce collaborateur est déjà associé à une autre fiche de poste",
            },
            { status: 400 }
          );
        }
      }

      // Mettre à jour la fiche
      updatedFiche = await prisma.ficheDePoste.update({
        where: { id: ficheId },
        data: {
          ...ficheDePosteData,
          collaborateurId: collaborateurId === "aucun" ? null : collaborateurId,
        },
        include: {
          collaborateur: true,
        },
      });
    } else {
      // Créer une nouvelle fiche
      console.log("Création d'une nouvelle fiche pour collaborateur");

      if (collaborateurId && collaborateurId !== "aucun") {
        // Vérifier si le collaborateur existe
        const collaborateur = await prisma.collaborateur.findUnique({
          where: { id: collaborateurId },
        });

        if (!collaborateur) {
          return NextResponse.json(
            { error: "Collaborateur non trouvé" },
            { status: 404 }
          );
        }

        // Vérifier s'il a déjà une fiche
        const existingFicheForCollab = await prisma.ficheDePoste.findUnique({
          where: { collaborateurId },
        });

        if (existingFicheForCollab) {
          return NextResponse.json(
            { error: "Ce collaborateur est déjà associé à une fiche de poste" },
            { status: 400 }
          );
        }

        finalCollaborateurId = collaborateurId;
      } else if (nom && prenom) {
        // Créer un nouveau collaborateur si nom et prénom fournis mais pas d'ID
        const fullName = `${nom} ${prenom}`;
        const newCollaborateur = await prisma.collaborateur.create({
          data: {
            nom: fullName,
            couleur: "#3174ad", // Couleur par défaut
            entreprise,
          },
        });

        finalCollaborateurId = newCollaborateur.id;
      }

      // Créer la fiche de poste
      updatedFiche = await prisma.ficheDePoste.create({
        data: {
          ...ficheDePosteData,
          collaborateurId:
            finalCollaborateurId === "aucun" ? null : finalCollaborateurId,
          dateCreation: new Date(),
        },
        include: {
          collaborateur: true,
        },
      });
    }

    // Formater la réponse
    const formattedResponse = {
      ...updatedFiche,
      nom:
        nom ||
        updatedFiche.collaborateur?.nom?.split(" ").slice(0, -1).join(" ") ||
        "",
      prenom: prenom || updatedFiche.collaborateur?.nom?.split(" ").pop() || "",
      dateEntree: dateEntree || updatedFiche.dateCreation,
      email: email || "",
      telephone: telephone || "",
      adresse: adresse || "",
      codePostal: codePostal || "",
      ville: ville || "",
      dateNaissance: dateNaissance,
      numeroSecu: numeroSecu || "",
    };

    // S'assurer que le nom et prénom ne sont pas vides
    if (!formattedResponse.nom || !formattedResponse.prenom) {
      console.error("ERREUR: Nom ou prénom manquant dans la réponse formatée");
      console.log("Nom original:", nom);
      console.log("Prénom original:", prenom);

      // Forcer les valeurs si elles sont vides
      formattedResponse.nom = nom || "ERREUR NOM MANQUANT";
      formattedResponse.prenom = prenom || "ERREUR PRENOM MANQUANT";
    }

    // Vérifier le téléphone dans la réponse formatée
    console.log(
      "Téléphone dans la réponse formatée:",
      formattedResponse.telephone
    );
    console.log("Valeur brute du téléphone:", telephone);

    console.log("Réponse formatée:", formattedResponse);
    console.log("Fiche de poste mise à jour/créée avec succès");
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la fiche de poste:", error);
    return NextResponse.json(
      {
        error:
          "Impossible de mettre à jour la fiche de poste: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/salaries/[id] - Supprimer une fiche de poste
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const ficheId = params.id;
    console.log(
      "DELETE /api/salaries/[id] - Suppression de la fiche:",
      ficheId
    );

    // Vérifier si la fiche existe
    const ficheDePoste = await prisma.ficheDePoste.findUnique({
      where: { id: ficheId },
    });

    if (!ficheDePoste) {
      return NextResponse.json(
        { error: "Fiche de poste non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la fiche de poste
    await prisma.ficheDePoste.delete({
      where: { id: ficheId },
    });

    return NextResponse.json({
      success: true,
      message: "Fiche de poste supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la fiche de poste:", error);
    return NextResponse.json(
      { error: "Impossible de supprimer la fiche de poste" },
      { status: 500 }
    );
  }
}
