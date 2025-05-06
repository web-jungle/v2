import { verifyToken } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/evenements/[id] - Récupérer un événement par son ID
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = params.id;

    const evenement = await prisma.evenement.findUnique({
      where: { id },
      include: {
        collaborateur: true,
      },
    });

    if (!evenement) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedEvenement = {
      ...evenement,
      start: new Date(evenement.start),
      end: new Date(evenement.end),
    };

    return NextResponse.json(formattedEvenement);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer l'événement" },
      { status: 500 }
    );
  }
}

// PATCH /api/evenements/[id] - Mettre à jour un événement
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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

    // Vérification du rôle (seuls admin et manager peuvent modifier des événements)
    const { role } = verifiedToken;
    if (role !== "admin" && role !== "manager") {
      return NextResponse.json(
        {
          error:
            "Accès refusé. Seuls les administrateurs et managers peuvent modifier des événements.",
        },
        { status: 403 }
      );
    }

    const id = params.id;
    const data = await req.json();

    // Validation des données
    if (!data) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Vérifier si l'événement existe
    const existingEvenement = await prisma.evenement.findUnique({
      where: { id },
    });

    if (!existingEvenement) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Préparer les données selon le schéma Prisma exact
    const prismaData: any = {};

    // Ne prendre que les propriétés qui existent dans le schéma Prisma
    if (data.title !== undefined) prismaData.title = data.title;
    if (data.start) prismaData.start = new Date(data.start);
    if (data.end) prismaData.end = new Date(data.end);
    if (data.collaborateurId !== undefined)
      prismaData.collaborateurId = data.collaborateurId;
    if (data.typeEvenement !== undefined)
      prismaData.typeEvenement = data.typeEvenement;
    if (data.lieuChantier !== undefined)
      prismaData.lieuChantier = data.lieuChantier;
    if (data.zoneTrajet !== undefined) prismaData.zoneTrajet = data.zoneTrajet;
    if (data.panierRepas !== undefined)
      prismaData.panierRepas = Boolean(data.panierRepas);
    if (data.ticketRestaurant !== undefined)
      prismaData.ticketRestaurant = Boolean(data.ticketRestaurant);
    if (data.heuresSupplementaires !== undefined)
      prismaData.heuresSupplementaires = Number(data.heuresSupplementaires);
    if (data.grandDeplacement !== undefined)
      prismaData.grandDeplacement = Boolean(data.grandDeplacement);
    if (data.prgd !== undefined) prismaData.prgd = Boolean(data.prgd);
    if (data.nombrePrgd !== undefined)
      prismaData.nombrePrgd = Number(data.nombrePrgd);
    if (data.typeAbsence !== undefined)
      prismaData.typeAbsence = data.typeAbsence;
    if (data.verrouille !== undefined)
      prismaData.verrouille = Boolean(data.verrouille);
    if (data.latitude !== undefined) prismaData.latitude = data.latitude;
    if (data.longitude !== undefined) prismaData.longitude = data.longitude;
    if (data.adresseComplete !== undefined)
      prismaData.adresseComplete = data.adresseComplete;

    const evenement = await prisma.evenement.update({
      where: { id },
      data: prismaData,
      include: {
        collaborateur: true,
      },
    });

    return NextResponse.json(evenement);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'événement:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour l'événement" },
      { status: 500 }
    );
  }
}

// DELETE /api/evenements/[id] - Supprimer un événement
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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

    // Vérification du rôle (seuls admin et manager peuvent supprimer des événements)
    const { role } = verifiedToken;
    if (role !== "admin" && role !== "manager") {
      return NextResponse.json(
        {
          error:
            "Accès refusé. Seuls les administrateurs et managers peuvent supprimer des événements.",
        },
        { status: 403 }
      );
    }

    const id = params.id;

    // Vérifier si l'événement existe
    const existingEvenement = await prisma.evenement.findUnique({
      where: { id },
    });

    if (!existingEvenement) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    await prisma.evenement.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Événement supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    return NextResponse.json(
      { error: "Impossible de supprimer l'événement" },
      { status: 500 }
    );
  }
}
