import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/vehicules/[id] - Récupérer un véhicule par son ID
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const vehicule = await prisma.vehicule.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!vehicule) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedVehicule = {
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
    };

    return NextResponse.json(formattedVehicule);
  } catch (error) {
    console.error("Erreur lors de la récupération du véhicule:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du véhicule" },
      { status: 500 }
    );
  }
}

// PUT /api/vehicules/[id] - Mettre à jour un véhicule
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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

    const vehicule = await prisma.vehicule.update({
      where: {
        id: params.id,
      },
      data: vehiculeData,
    });

    return NextResponse.json(vehicule);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du véhicule:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du véhicule" },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicules/[id] - Supprimer un véhicule
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await prisma.vehicule.delete({
      where: {
        id: params.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du véhicule:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du véhicule" },
      { status: 500 }
    );
  }
}
