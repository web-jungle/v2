import { prisma } from "../lib/prisma";

/**
 * Script pour supprimer toutes les données de la base de données sans supprimer les tables
 */
async function resetDatabase() {
  console.log("🗑️ Suppression de toutes les données de la base de données...");

  try {
    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères

    // 1. Supprimer les notifications
    await prisma.notification.deleteMany();
    console.log("✓ Notifications supprimées");

    // 2. Supprimer les demandes de congés
    await prisma.demandeConge.deleteMany();
    console.log("✓ Demandes de congés supprimées");

    // 3. Supprimer les contacts
    await prisma.contact.deleteMany();
    console.log("✓ Contacts supprimés");

    // 4. Supprimer les événements
    await prisma.evenement.deleteMany();
    console.log("✓ Événements supprimés");

    // 5. Supprimer les contrats de maintenance
    await prisma.contratMaintenance.deleteMany();
    console.log("✓ Contrats de maintenance supprimés");

    // 6. Supprimer les éléments de stock
    await prisma.stockItem.deleteMany();
    console.log("✓ Éléments de stock supprimés");

    // 7. Supprimer les administrateurs
    await prisma.admin.deleteMany();
    console.log("✓ Administrateurs supprimés");

    // 8. Supprimer les fiches de poste
    await prisma.ficheDePoste.deleteMany();
    console.log("✓ Fiches de poste supprimées");

    // 9. Supprimer les salariés
    await prisma.salarie.deleteMany();
    console.log("✓ Salariés supprimés");

    // 10. Supprimer les véhicules
    await prisma.vehicule.deleteMany();
    console.log("✓ Véhicules supprimés");

    // 11. Supprimer les comptes
    await prisma.compte.deleteMany();
    console.log("✓ Comptes supprimés");

    // 12. Supprimer les collaborateurs
    await prisma.collaborateur.deleteMany();
    console.log("✓ Collaborateurs supprimés");

    console.log("✅ Toutes les données ont été supprimées avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des données:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
resetDatabase()
  .then(() => console.log("✅ Script terminé"))
  .catch((error) => console.error("❌ Erreur:", error));
