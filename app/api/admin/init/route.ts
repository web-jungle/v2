import { administrateursInitiaux } from "@/lib/data"
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("🔍 Début de l'initialisation des administrateurs...")
    
    // Insérer les administrateurs
    for (const admin of administrateursInitiaux) {
      await prisma.admin.upsert({
        where: { id: admin.id },
        update: {
          nom: admin.nom,
          prenom: admin.prenom,
          email: admin.email,
          telephone: admin.telephone,
          role: admin.role as any,
          departement: admin.departement,
          dateCreation: admin.date_creation,
          dernierAcces: admin.dernier_acces,
          estActif: admin.est_actif,
        },
        create: {
          id: admin.id,
          nom: admin.nom,
          prenom: admin.prenom,
          email: admin.email,
          telephone: admin.telephone,
          role: admin.role as any,
          departement: admin.departement,
          dateCreation: admin.date_creation,
          dernierAcces: admin.dernier_acces,
          estActif: admin.est_actif,
        },
      })
      console.log(`  ✓ Administrateur inséré: ${admin.prenom} ${admin.nom}`)
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Administrateurs initialisés avec succès", 
        count: administrateursInitiaux.length 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Erreur lors de l'initialisation des administrateurs:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur lors de l'initialisation des administrateurs", 
        error: error.message 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 