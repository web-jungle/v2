import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/evenements - Récupérer les événements avec filtrage selon le rôle
export async function GET(req: Request) {
  try {
    // Récupérer les informations utilisateur à partir des headers ajoutés par le middleware
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Utilisateur non identifié" },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de filtre de l'URL
    const { searchParams } = new URL(req.url);
    const collaborateurId = searchParams.get("collaborateurId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construction de la requête avec filtres conditionnels
    const whereClause: any = {};

    // Filtrage intelligent selon le rôle de l'utilisateur
    if (collaborateurId) {
      // Si un ID spécifique est demandé, privilégier ce paramètre
      whereClause.collaborateurId = collaborateurId;
    } else if (role === "collaborateur") {
      // Si collaborateur, récupérer uniquement ses propres événements
      // Récupérer d'abord l'ID du collaborateur lié au compte
      const compte = await prisma.compte.findUnique({
        where: { id: userId },
        select: { collaborateurId: true },
      });

      if (!compte || !compte.collaborateurId) {
        return NextResponse.json(
          { error: "Aucun collaborateur associé à ce compte" },
          { status: 400 }
        );
      }

      whereClause.collaborateurId = compte.collaborateurId;
    } else if (role === "manager") {
      // Si manager, récupérer ses événements et ceux des collaborateurs qu'il gère
      const compte = await prisma.compte.findUnique({
        where: { id: userId },
        include: {
          collaborateur: { select: { id: true } },
          collaborateursGeres: { select: { id: true } },
        },
      });

      if (!compte) {
        return NextResponse.json(
          { error: "Compte non trouvé" },
          { status: 404 }
        );
      }

      // Créer un tableau d'IDs incluant le manager et ses collaborateurs gérés
      const collaborateurIds = [
        compte.collaborateurId,
        ...compte.collaborateursGeres.map((c) => c.id),
      ].filter(Boolean); // Filtrer les valeurs null/undefined

      whereClause.collaborateurId = { in: collaborateurIds };
    }
    // Pour admin, aucun filtre par défaut (récupération de tous les événements)

    // Ajouter les filtres de date si fournis
    if (startDate && endDate) {
      whereClause.start = {
        gte: new Date(startDate),
      };
      whereClause.end = {
        lte: new Date(endDate),
      };
    }

    console.log("Filtre appliqué pour les événements:", whereClause);

    const evenements = await prisma.evenement.findMany({
      where: whereClause,
      include: {
        collaborateur: true,
      },
      orderBy: {
        start: "asc",
      },
    });

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedEvenements = evenements.map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));

    console.log(
      `API evenements - ${formattedEvenements.length} événements retournés`
    );
    return NextResponse.json(formattedEvenements);
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les événements" },
      { status: 500 }
    );
  }
}

// POST /api/evenements - Créer un nouvel événement
export async function POST(req: Request) {
  try {
    // Vérifier si l'utilisateur a les droits pour créer des événements
    const role = req.headers.get("x-user-role");

    if (!role) {
      return NextResponse.json(
        { error: "Utilisateur non identifié" },
        { status: 401 }
      );
    }

    // Vérification du rôle (seuls admin et manager peuvent créer des événements)
    if (role !== "admin" && role !== "manager") {
      return NextResponse.json(
        {
          error:
            "Accès refusé. Seuls les administrateurs et managers peuvent créer des événements.",
        },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Validation des données requises
    if (
      !data.collaborateurId ||
      !data.start ||
      !data.end ||
      !data.typeEvenement
    ) {
      return NextResponse.json(
        {
          error:
            "Données requises manquantes: collaborateurId, start, end, typeEvenement",
        },
        { status: 400 }
      );
    }

    // Extraire uniquement les propriétés reconnues par Prisma
    // et s'assurer qu'elles ont le bon nom et le bon format
    const cleanedData = {
      id: data.id,
      title: data.title || "",
      start: new Date(data.start),
      end: new Date(data.end),
      collaborateurId: data.collaborateurId,
      typeEvenement: data.typeEvenement,
      lieuChantier: data.lieuChantier || "",
      zoneTrajet: data.zoneTrajet || "",
      panierRepas: Boolean(data.panierRepas),
      ticketRestaurant: Boolean(data.ticketRestaurant),
      heuresSupplementaires: Number(data.heuresSupplementaires || 0),
      grandDeplacement: Boolean(data.grandDeplacement),
      prgd: Boolean(data.prgd),
      nombrePrgd: Number(data.nombrePrgd || data.nombrePRGD || 0), // Accepter les deux formats
      typeAbsence: data.typeAbsence,
      verrouille: Boolean(data.verrouille),
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      adresseComplete: data.adresseComplete || null,
    };

    console.log("Données nettoyées envoyées à Prisma:", cleanedData);

    const evenement = await prisma.evenement.create({
      data: cleanedData,
      include: {
        collaborateur: true,
      },
    });

    return NextResponse.json(evenement, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    return NextResponse.json(
      { error: "Impossible de créer l'événement" },
      { status: 500 }
    );
  }
}
