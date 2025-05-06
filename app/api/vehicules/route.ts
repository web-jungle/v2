import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// GET /api/vehicules - Récupérer tous les véhicules
export async function GET() {
  try {
    const vehicules = await prisma.vehicule.findMany();

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedVehicules = vehicules.map((vehicule) => ({
      ...vehicule,
      dateMiseEnCirculation: vehicule.dateMiseEnCirculation
        ? new Date(vehicule.dateMiseEnCirculation)
        : null,
      dateLimiteControleTechnique: vehicule.dateLimiteControleTechnique
        ? new Date(vehicule.dateLimiteControleTechnique)
        : null,
      dateLimiteControlePollution: vehicule.dateLimiteControlePollution
        ? new Date(vehicule.dateLimiteControlePollution)
        : null,
    }));

    return NextResponse.json(formattedVehicules);
  } catch (error) {
    console.error("Erreur lors de la récupération des véhicules:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des véhicules" },
      { status: 500 }
    );
  }
}

// POST /api/vehicules - Créer un nouveau véhicule
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Convertir les dates en format ISO pour Prisma
    const vehiculeData = {
      ...data,
      dateMiseEnCirculation: data.dateMiseEnCirculation
        ? new Date(data.dateMiseEnCirculation)
        : null,
      dateLimiteControleTechnique: data.dateLimiteControleTechnique
        ? new Date(data.dateLimiteControleTechnique)
        : null,
      dateLimiteControlePollution: data.dateLimiteControlePollution
        ? new Date(data.dateLimiteControlePollution)
        : null,
    };

    const vehicule = await prisma.vehicule.create({
      data: vehiculeData,
    });

    return NextResponse.json(vehicule, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du véhicule:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du véhicule" },
      { status: 500 }
    );
  }
}
