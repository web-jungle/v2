import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Tester la connexion en exécutant une requête simple
    const result = await prisma.$queryRaw`SELECT 1 as connected`

    return NextResponse.json({
      success: true,
      message: "Connexion à la base de données établie",
      data: result,
    })
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur de connexion à la base de données",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
