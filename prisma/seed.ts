import { hashPassword } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

import {
  demandesCongesInitiales,
  notificationsInitiales,
} from "../lib/conges-data";
import { contactsInitiaux } from "../lib/crm-data";
import {
  administrateursInitiaux,
  collaborateurs,
  evenementsInitiaux,
} from "../lib/data";
import { vehiculesInitiaux } from "../lib/logistique-data";
import { stockItemsInitiaux } from "../lib/logistique-stock-data";
import { contratsInitiaux } from "../lib/maintenance-data";
import { salariesInitiaux } from "../lib/rh-data";

async function main() {
  try {
    console.log("🌱 Début de l'initialisation de la base de données...");

    // 1. Insérer les collaborateurs
    console.log("👥 Insertion des collaborateurs...");
    for (const collaborateur of collaborateurs) {
      await prisma.collaborateur.upsert({
        where: { id: collaborateur.id },
        update: {
          ...collaborateur,
          aCompte: false, // Par défaut, pas de compte
        },
        create: {
          ...collaborateur,
          aCompte: false, // Par défaut, pas de compte
        },
      });
      console.log(`  ✓ Collaborateur inséré: ${collaborateur.nom}`);
    }

    // 2. Création du collaborateur administrateur et son compte
    console.log("👤 Création du collaborateur administrateur...");

    // Créer un collaborateur admin
    const adminCollaborateur = await prisma.collaborateur.upsert({
      where: { id: "admin-collaborateur-id" },
      update: {
        nom: "Administrateur",
        couleur: "#FF0000", // Rouge pour admin
        entreprise: "ORIZON GROUP",
        aCompte: true,
      },
      create: {
        id: "admin-collaborateur-id",
        nom: "Administrateur",
        couleur: "#FF0000", // Rouge pour admin
        entreprise: "ORIZON GROUP",
        aCompte: true,
      },
    });

    console.log(
      `  ✓ Collaborateur administrateur inséré: ${adminCollaborateur.nom}`
    );

    // Créer le compte admin lié au collaborateur
    const hashedPassword = hashPassword("admin");

    await prisma.compte.upsert({
      where: { collaborateurId: adminCollaborateur.id },
      update: {
        identifiant: "admin",
        motDePasse: hashedPassword,
        role: "admin",
      },
      create: {
        id: "admin-account-id",
        identifiant: "admin",
        motDePasse: hashedPassword,
        role: "admin",
        collaborateurId: adminCollaborateur.id,
      },
    });

    console.log(
      `  ✓ Compte administrateur créé avec identifiant: admin et mot de passe: admin`
    );

    // 3. Insérer les événements
    console.log("📅 Insertion des événements...");
    for (const evenement of evenementsInitiaux) {
      await prisma.evenement.upsert({
        where: { id: evenement.id },
        update: {
          title: evenement.title,
          start: evenement.start,
          end: evenement.end,
          collaborateurId: evenement.collaborateur_id,
          typeEvenement: evenement.type_evenement,
          lieuChantier: evenement.lieu_chantier || null,
          zoneTrajet: evenement.zone_trajet || null,
          panierRepas: evenement.panier_repas,
          ticketRestaurant: false, // Valeur par défaut
          heuresSupplementaires: evenement.heures_supplementaires,
          grandDeplacement: evenement.grand_deplacement,
          prgd: evenement.prgd,
          nombrePrgd: evenement.nombre_prgd || 0,
          typeAbsence: evenement.type_absence || null,
          verrouille: false, // Valeur par défaut
          latitude: null, // Valeur par défaut
          longitude: null, // Valeur par défaut
          adresseComplete: null, // Valeur par défaut
        },
        create: {
          id: evenement.id,
          title: evenement.title,
          start: evenement.start,
          end: evenement.end,
          collaborateurId: evenement.collaborateur_id,
          typeEvenement: evenement.type_evenement,
          lieuChantier: evenement.lieu_chantier || null,
          zoneTrajet: evenement.zone_trajet || null,
          panierRepas: evenement.panier_repas,
          ticketRestaurant: false, // Valeur par défaut
          heuresSupplementaires: evenement.heures_supplementaires,
          grandDeplacement: evenement.grand_deplacement,
          prgd: evenement.prgd,
          nombrePrgd: evenement.nombre_prgd || 0,
          typeAbsence: evenement.type_absence || null,
          verrouille: false, // Valeur par défaut
          latitude: null, // Valeur par défaut
          longitude: null, // Valeur par défaut
          adresseComplete: null, // Valeur par défaut
        },
      });
      console.log(`  ✓ Événement inséré: ${evenement.title}`);
    }

    // 4. Insérer les salariés (RH)
    console.log("👷 Insertion des salariés...");
    for (const salarie of salariesInitiaux) {
      await prisma.salarie.upsert({
        where: { collaborateurId: salarie.id },
        update: {
          nom: salarie.nom,
          prenom: salarie.prenom,
          classification: salarie.classification,
          dateEntree: salarie.dateEntree,
          typeContrat: salarie.typeContrat,
          dureeContrat: salarie.dureeContrat || null,
          certifications: salarie.certifications,
          habilitations: salarie.habilitations,
          entreprise: salarie.entreprise,
          poste: salarie.poste,
          email: salarie.email,
          telephone: salarie.telephone,
        },
        create: {
          id: salarie.id,
          nom: salarie.nom,
          prenom: salarie.prenom,
          classification: salarie.classification,
          dateEntree: salarie.dateEntree,
          typeContrat: salarie.typeContrat,
          dureeContrat: salarie.dureeContrat || null,
          certifications: salarie.certifications,
          habilitations: salarie.habilitations,
          entreprise: salarie.entreprise,
          poste: salarie.poste,
          email: salarie.email,
          telephone: salarie.telephone,
          collaborateurId: salarie.id,
        },
      });
      console.log(`  ✓ Salarié inséré: ${salarie.prenom} ${salarie.nom}`);
    }

    // 5. Insérer les véhicules (Logistique)
    console.log("🚗 Insertion des véhicules...");
    for (const vehicule of vehiculesInitiaux) {
      await prisma.vehicule.upsert({
        where: { id: vehicule.id },
        update: {
          societe: vehicule.societe,
          marque: vehicule.marque,
          modele: vehicule.modele,
          immatriculation: vehicule.immatriculation,
          etat: vehicule.etat,
          proprietaire: vehicule.proprietaire,
          dateMiseEnCirculation: vehicule.dateMiseEnCirculation || null,
          kilometrage: vehicule.kilometrage || null,
          kmProchaineRevision: vehicule.kmProchaineRevision || null,
          dateLimiteControleTechnique:
            vehicule.dateLimiteControleTechnique || null,
          dateLimiteControlePollution:
            vehicule.dateLimiteControlePollution || null,
          typeVehicule: vehicule.typeVehicule || null,
        },
        create: {
          id: vehicule.id,
          societe: vehicule.societe,
          marque: vehicule.marque,
          modele: vehicule.modele,
          immatriculation: vehicule.immatriculation,
          etat: vehicule.etat,
          proprietaire: vehicule.proprietaire,
          dateMiseEnCirculation: vehicule.dateMiseEnCirculation || null,
          kilometrage: vehicule.kilometrage || null,
          kmProchaineRevision: vehicule.kmProchaineRevision || null,
          dateLimiteControleTechnique:
            vehicule.dateLimiteControleTechnique || null,
          dateLimiteControlePollution:
            vehicule.dateLimiteControlePollution || null,
          typeVehicule: vehicule.typeVehicule || null,
        },
      });
      console.log(
        `  ✓ Véhicule inséré: ${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation})`
      );
    }

    // 6. Insérer les contacts (CRM)
    console.log("📞 Insertion des contacts...");
    for (const contact of contactsInitiaux) {
      // Mettre à jour l'utilisateurId pour utiliser l'administrateur
      const utilisateurId = "admin-account-id";

      // Créer le contact
      await prisma.contact.upsert({
        where: { id: contact.id },
        update: {
          nom: contact.nom,
          prenom: contact.prenom,
          email: contact.email,
          telephone: contact.telephone,
          adresse: contact.adresse,
          codePostal: contact.codePostal,
          ville: contact.ville,
          categories: contact.categories,
          status: contact.status,
          commentaires: contact.commentaires || null,
          dateCreation: contact.dateCreation,
          dateDerniereModification: contact.dateDerniereModification,
          utilisateurId: utilisateurId, // Utiliser l'admin pour tous les contacts
          collaborateursIds: contact.collaborateursIds,
          montantDevis: contact.montantDevis || null,
          archived: false,
          archiveDate: null,
        },
        create: {
          id: contact.id,
          nom: contact.nom,
          prenom: contact.prenom,
          email: contact.email,
          telephone: contact.telephone,
          adresse: contact.adresse,
          codePostal: contact.codePostal,
          ville: contact.ville,
          categories: contact.categories,
          status: contact.status,
          commentaires: contact.commentaires || null,
          dateCreation: contact.dateCreation,
          dateDerniereModification: contact.dateDerniereModification,
          utilisateurId: utilisateurId, // Utiliser l'admin pour tous les contacts
          collaborateursIds: contact.collaborateursIds,
          montantDevis: contact.montantDevis || null,
          archived: false,
          archiveDate: null,
        },
      });

      // Connecter les collaborateurs au contact
      for (const collaborateurId of contact.collaborateursIds) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            collaborateurs: {
              connect: { id: collaborateurId },
            },
          },
        });
      }

      console.log(`  ✓ Contact inséré: ${contact.prenom} ${contact.nom}`);
    }

    // 7. Insérer les demandes de congés
    console.log("🏖️ Insertion des demandes de congés...");
    for (const demande of demandesCongesInitiales) {
      // Utiliser l'ID du compte admin
      const utilisateurId = "admin-account-id";

      await prisma.demandeConge.upsert({
        where: { id: demande.id },
        update: {
          utilisateurId: utilisateurId, // Utiliser l'admin
          collaborateurId: demande.collaborateurId,
          collaborateurNom: demande.collaborateurNom,
          dateDebut: demande.dateDebut,
          dateFin: demande.dateFin,
          typeConge: demande.typeConge,
          motif: demande.motif,
          statut: demande.statut,
          commentaireAdmin: demande.commentaireAdmin || null,
          dateCreation: demande.dateCreation,
          dateModification: demande.dateModification,
          notificationLue: demande.notificationLue,
        },
        create: {
          id: demande.id,
          utilisateurId: utilisateurId, // Utiliser l'admin
          collaborateurId: demande.collaborateurId,
          collaborateurNom: demande.collaborateurNom,
          dateDebut: demande.dateDebut,
          dateFin: demande.dateFin,
          typeConge: demande.typeConge,
          motif: demande.motif,
          statut: demande.statut,
          commentaireAdmin: demande.commentaireAdmin || null,
          dateCreation: demande.dateCreation,
          dateModification: demande.dateModification,
          notificationLue: demande.notificationLue,
        },
      });
      console.log(
        `  ✓ Demande de congé insérée: ${demande.collaborateurNom} (${demande.typeConge})`
      );
    }

    // 8. Insérer les notifications
    console.log("🔔 Insertion des notifications...");
    for (const notification of notificationsInitiales) {
      // Utiliser l'ID du compte admin
      const utilisateurId = "admin-account-id";

      await prisma.notification.upsert({
        where: { id: notification.id },
        update: {
          utilisateurId: utilisateurId, // Utiliser l'admin
          message: notification.message,
          lien: notification.lien,
          dateCreation: notification.dateCreation,
          lue: notification.lue,
          type: notification.type,
          demandeId: notification.demandeId || null,
        },
        create: {
          id: notification.id,
          utilisateurId: utilisateurId, // Utiliser l'admin
          message: notification.message,
          lien: notification.lien,
          dateCreation: notification.dateCreation,
          lue: notification.lue,
          type: notification.type,
          demandeId: notification.demandeId || null,
        },
      });
      console.log(`  ✓ Notification insérée: ${notification.message}`);
    }

    // 9. Insérer les contrats de maintenance
    console.log("📝 Insertion des contrats de maintenance...");
    for (const contrat of contratsInitiaux) {
      await prisma.contratMaintenance.upsert({
        where: { id: contrat.id },
        update: {
          client: contrat.client,
          reference: contrat.reference,
          type: contrat.type,
          montant: contrat.montant,
          dateDebut: new Date(contrat.dateDebut),
          dateEcheance: new Date(contrat.dateEcheance),
          statut: contrat.statut,
          description: contrat.description,
          contactClient: contrat.contactClient,
          emailContact: contrat.emailContact,
          telephoneContact: contrat.telephoneContact,
          notes: contrat.notes || null,
          dateCreation: new Date(contrat.dateCreation || Date.now()),
          dateDerniereModification: new Date(
            contrat.dateDerniereModification || Date.now()
          ),
        },
        create: {
          id: contrat.id,
          client: contrat.client,
          reference: contrat.reference,
          type: contrat.type,
          montant: contrat.montant,
          dateDebut: new Date(contrat.dateDebut),
          dateEcheance: new Date(contrat.dateEcheance),
          statut: contrat.statut,
          description: contrat.description,
          contactClient: contrat.contactClient,
          emailContact: contrat.emailContact,
          telephoneContact: contrat.telephoneContact,
          notes: contrat.notes || null,
          dateCreation: new Date(contrat.dateCreation || Date.now()),
          dateDerniereModification: new Date(
            contrat.dateDerniereModification || Date.now()
          ),
        },
      });
      console.log(
        `  ✓ Contrat de maintenance inséré: ${contrat.reference} (${contrat.client})`
      );
    }

    // 10. Insérer les stocks (Logistique)
    console.log("📦 Insertion des stocks...");
    for (const stockItem of stockItemsInitiaux) {
      await prisma.stockItem.upsert({
        where: { id: stockItem.id },
        update: {
          cableType: stockItem.cableType,
          typeM: stockItem.typeM,
          typeG: stockItem.typeG,
          enroulement: stockItem.enroulement,
          longueur: stockItem.longueur,
        },
        create: {
          id: stockItem.id,
          cableType: stockItem.cableType,
          typeM: stockItem.typeM,
          typeG: stockItem.typeG,
          enroulement: stockItem.enroulement,
          longueur: stockItem.longueur,
        },
      });
      console.log(
        `  ✓ Stock inséré: ${stockItem.cableType} ${stockItem.typeM} ${stockItem.typeG} (${stockItem.longueur}m)`
      );
    }

    // 11. Insérer les administrateurs
    console.log("👮 Insertion des administrateurs...");
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
      });
      console.log(`  ✓ Administrateur inséré: ${admin.prenom} ${admin.nom}`);
    }

    console.log("✅ Initialisation terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
