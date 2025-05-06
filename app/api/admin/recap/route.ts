import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Fonction utilitaire pour décomposer les zones
function decomposeZone(zoneTrajet: string | null): {
  zone5: number;
  zoneAutre: string | null;
  quantiteZoneAutre: number;
} {
  if (!zoneTrajet) {
    return { zone5: 0, zoneAutre: null, quantiteZoneAutre: 0 };
  }

  const zone = parseInt(zoneTrajet);

  if (isNaN(zone)) {
    return { zone5: 0, zoneAutre: null, quantiteZoneAutre: 0 };
  }

  switch (zone) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return {
        zone5: zone === 5 ? 1 : 0,
        zoneAutre: zone !== 5 ? `zone ${zone}` : null,
        quantiteZoneAutre: zone !== 5 ? 1 : 0,
      };
    case 6:
      return { zone5: 1, zoneAutre: "zone 1A", quantiteZoneAutre: 1 };
    case 7:
      return { zone5: 1, zoneAutre: "zone 1B", quantiteZoneAutre: 1 };
    case 8:
      return { zone5: 1, zoneAutre: "zone 2", quantiteZoneAutre: 1 };
    case 9:
      return { zone5: 1, zoneAutre: "zone 3", quantiteZoneAutre: 1 };
    case 10:
      return { zone5: 1, zoneAutre: "zone 4", quantiteZoneAutre: 1 };
    case 11:
      return { zone5: 2, zoneAutre: null, quantiteZoneAutre: 0 };
    case 12:
      return { zone5: 2, zoneAutre: "zone 1A", quantiteZoneAutre: 1 };
    case 13:
      return { zone5: 2, zoneAutre: "zone 1B", quantiteZoneAutre: 1 };
    case 14:
      return { zone5: 2, zoneAutre: "zone 2", quantiteZoneAutre: 1 };
    case 15:
      return { zone5: 2, zoneAutre: "zone 3", quantiteZoneAutre: 1 };
    default:
      return { zone5: 0, zoneAutre: null, quantiteZoneAutre: 0 };
  }
}

// GET /api/admin/recap - Récupérer les données pour le récapitulatif
export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de filtre
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");
    const entreprise = searchParams.get("entreprise");
    const collaborateurId = searchParams.get("collaborateurId");

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json(
        { error: "Le mois et l'année sont requis et doivent être des nombres" },
        { status: 400 }
      );
    }

    // Construire les dates pour filtrer par mois
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Dernier jour du mois

    // Construire la clause where pour les collaborateurs
    const whereClauseCollab: any = {};
    if (entreprise && entreprise !== "all") {
      whereClauseCollab.entreprise = entreprise;
    }
    if (collaborateurId && collaborateurId !== "all") {
      whereClauseCollab.id = collaborateurId;
    }

    // Récupérer les collaborateurs
    const collaborateurs = await prisma.collaborateur.findMany({
      where: whereClauseCollab,
      orderBy: {
        nom: "asc",
      },
    });

    // Construire la clause where pour les événements
    const whereClauseEvent: any = {
      start: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (collaborateurId && collaborateurId !== "all") {
      whereClauseEvent.collaborateurId = collaborateurId;
    } else if (entreprise && entreprise !== "all") {
      whereClauseEvent.collaborateur = {
        entreprise: entreprise,
      };
    }

    // Récupérer les événements
    const evenements = await prisma.evenement.findMany({
      where: whereClauseEvent,
      include: {
        collaborateur: true,
      },
      orderBy: {
        start: "asc",
      },
    });

    // Traiter les événements pour décomposer les zones
    const evenementsTraites = evenements.map((event) => {
      const zoneInfo = decomposeZone(event.zoneTrajet);
      return {
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        createdAt: event.createdAt.toISOString(),
        decomposedZone: zoneInfo,
      };
    });

    // Récupérer les entreprises disponibles
    const entreprises = await prisma.collaborateur.findMany({
      select: {
        entreprise: true,
      },
      distinct: ["entreprise"],
      orderBy: {
        entreprise: "asc",
      },
    });

    const listeEntreprises = entreprises.map((e) => e.entreprise);

    return NextResponse.json({
      collaborateurs,
      evenements: evenementsTraites,
      entreprises: listeEntreprises,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de récapitulatif:",
      error
    );
    return NextResponse.json(
      { error: "Impossible de récupérer les données de récapitulatif" },
      { status: 500 }
    );
  }
}
