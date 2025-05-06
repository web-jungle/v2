import { verifyToken } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// Middleware d'authentification
async function authenticate(request: Request) {
  // Extraire le token du header Authorization
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7); // Enlever "Bearer " du début

  // Vérifier le token
  const payload = await verifyToken(token);
  return payload;
}

// GET /api/conges - Récupérer toutes les demandes de congés
export async function GET(request: Request) {
  try {
    // Vérification d'authentification et autorisation
    const authPayload = await authenticate(request);

    if (!authPayload) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les paramètres de l'URL
    const url = new URL(request.url);
    const collaborateurId = url.searchParams.get("collaborateur_id");

    console.log("GET /api/conges - Récupération des demandes de congés");
    console.log("Filtre par collaborateur_id:", collaborateurId);

    // Définir les conditions de filtre
    const whereCondition = collaborateurId
      ? { collaborateurId: collaborateurId }
      : {};

    // Récupération des demandes de congés avec filtrage
    const demandesConges = await prisma.demandeConge.findMany({
      where: whereCondition,
      orderBy: {
        dateModification: "desc",
      },
      include: {
        utilisateur: {
          select: {
            role: true,
          },
        },
        collaborateur: true,
      },
    });

    console.log(`${demandesConges.length} demandes de congés trouvées`);

    if (collaborateurId) {
      console.log(`Filtrées pour le collaborateur: ${collaborateurId}`);
    }

    return NextResponse.json(demandesConges);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de congés:",
      error
    );
    return NextResponse.json(
      { error: "Impossible de récupérer les demandes de congés" },
      { status: 500 }
    );
  }
}

// POST /api/conges - Créer une nouvelle demande de congé
export async function POST(req: Request) {
  try {
    // Vérification d'authentification
    const authPayload = await authenticate(req);

    if (!authPayload) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const requestData = await req.json();
    console.log("POST /api/conges - Données reçues:", requestData);

    // Extraction des données de la demande
    const {
      utilisateurId,
      collaborateurId,
      dateDebut,
      dateFin,
      typeConge,
      motif,
    } = requestData;

    // Vérification des données requises
    if (
      !utilisateurId ||
      !collaborateurId ||
      !dateDebut ||
      !dateFin ||
      !typeConge ||
      !motif
    ) {
      return NextResponse.json(
        { error: "Données insuffisantes pour créer une demande de congé" },
        { status: 400 }
      );
    }

    // Récupérer les informations du collaborateur depuis la base de données
    const collaborateur = await prisma.collaborateur.findUnique({
      where: {
        id: collaborateurId,
      },
    });

    if (!collaborateur) {
      return NextResponse.json(
        { error: "Collaborateur non trouvé" },
        { status: 404 }
      );
    }

    // Utiliser le nom du collaborateur depuis la base de données
    const collaborateurNom = collaborateur.nom;
    console.log(
      `Utilisation du nom de collaborateur depuis la BD: ${collaborateurNom}`
    );

    // Création de la demande de congé
    const nouvelleDemandeConge = await prisma.demandeConge.create({
      data: {
        utilisateurId,
        collaborateurId,
        collaborateurNom,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        typeConge,
        motif,
        statut: "En attente",
        dateCreation: new Date(),
        dateModification: new Date(),
        notificationLue: false,
      },
      include: {
        utilisateur: {
          select: {
            role: true,
          },
        },
        collaborateur: true,
      },
    });

    console.log("Nouvelle demande de congé créée:", nouvelleDemandeConge.id);
    return NextResponse.json(nouvelleDemandeConge);
  } catch (error) {
    console.error("Erreur lors de la création de la demande de congé:", error);
    return NextResponse.json(
      { error: "Impossible de créer la demande de congé" },
      { status: 500 }
    );
  }
}
