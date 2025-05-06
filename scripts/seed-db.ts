// Ce script peut être exécuté avec "npx ts-node scripts/seed-db.ts"
import { PrismaClient } from "@prisma/client"
import { collaborateurs, utilisateursInitiaux, evenementsInitiaux } from "../lib/data"

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Début de l'initialisation de la base de données...")

    // Insérer les collaborateurs
    console.log("Insertion des collaborateurs...")
    for (const collaborateur of collaborateurs) {
      await prisma.collaborateur.upsert({
        where: { id: collaborateur.id },
        update: collaborateur,
        create: collaborateur,
      })
    }

    // Insérer les utilisateurs
    console.log("Insertion des utilisateurs...")
    for (const utilisateur of utilisateursInitiaux) {
      await prisma.utilisateur.upsert({
        where: { id: utilisateur.id },
        update: {
          identifiant: utilisateur.identifiant,
          motDePasse: utilisateur.motDePasse,
          nom: utilisateur.nom,
          role: utilisateur.role,
          collaborateurId: utilisateur.collaborateurId,
          collaborateursGeres: utilisateur.collaborateursGeres || [],
        },
        create: {
          id: utilisateur.id,
          identifiant: utilisateur.identifiant,
          motDePasse: utilisateur.motDePasse,
          nom: utilisateur.nom,
          role: utilisateur.role,
          collaborateurId: utilisateur.collaborateurId,
          collaborateursGeres: utilisateur.collaborateursGeres || [],
        },
      })
    }

    // Insérer les événements
    console.log("Insertion des événements...")
    for (const evenement of evenementsInitiaux) {
      await prisma.evenement.upsert({
        where: { id: evenement.id },
        update: {
          title: evenement.title,
          start: evenement.start,
          end: evenement.end,
          collaborateurId: evenement.collaborateurId,
          typeEvenement: evenement.typeEvenement,
          lieuChantier: evenement.lieuChantier || null,
          zoneTrajet: evenement.zoneTrajet || null,
          panierRepas: evenement.panierRepas,
          ticketRestaurant: evenement.ticketRestaurant || false,
          heuresSupplementaires: evenement.heuresSupplementaires,
          grandDeplacement: evenement.grandDeplacement,
          prgd: evenement.prgd,
          nombrePrgd: evenement.nombrePrgd,
          typeAbsence: evenement.typeAbsence || null,
          verrouille: evenement.verrouille || false,
        },
        create: {
          id: evenement.id,
          title: evenement.title,
          start: evenement.start,
          end: evenement.end,
          collaborateurId: evenement.collaborateurId,
          typeEvenement: evenement.typeEvenement,
          lieuChantier: evenement.lieuChantier || null,
          zoneTrajet: evenement.zoneTrajet || null,
          panierRepas: evenement.panierRepas,
          ticketRestaurant: evenement.ticketRestaurant || false,
          heuresSupplementaires: evenement.heuresSupplementaires,
          grandDeplacement: evenement.grandDeplacement,
          prgd: evenement.prgd,
          nombrePrgd: evenement.nombrePrgd,
          typeAbsence: evenement.typeAbsence || null,
          verrouille: evenement.verrouille || false,
        },
      })
    }

    // Insérer les autres données...
    // (Le reste du code d'initialisation est similaire à celui de la route API init-db)

    console.log("Base de données initialisée avec succès!")
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
