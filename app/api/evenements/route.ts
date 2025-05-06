import { verifyToken } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/evenements - Récupérer tous les événements
export async function GET(req: Request) {
  try {
    // Récupérer les paramètres de filtre de l'URL
    const { searchParams } = new URL(req.url);
    const collaborateurId = searchParams.get("collaborateurId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construction de la requête avec filtres conditionnels
    const whereClause: any = {};

    if (collaborateurId) {
      whereClause.collaborateurId = collaborateurId;
    }

    if (startDate && endDate) {
      whereClause.start = {
        gte: new Date(startDate),
      };
      whereClause.end = {
        lte: new Date(endDate),
      };
    }

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

    console.log("API evenements - données retournées:", formattedEvenements[0]);
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
    // Vérification de l'authentification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const verifiedToken = await verifyToken(token);

    if (!verifiedToken) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // Vérification du rôle (seuls admin et manager peuvent créer des événements)
    const { role } = verifiedToken;
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
