import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Vérifier la connexion à la base de données via Prisma
    // Une simple requête qui comptera le nombre de collaborateurs
    const count = await prisma.collaborateur.count();

    // Si nous sommes ici, la requête a réussi, donc la DB est accessible
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      count,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'état:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
