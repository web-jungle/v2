import { hashPassword } from "@/lib/auth-utils";
import {
  demandesCongesInitiales,
  notificationsInitiales,
} from "@/lib/conges-data";
import { contactsInitiaux } from "@/lib/crm-data";
import { collaborateurs, evenementsInitiaux } from "@/lib/data";
import { vehiculesInitiaux } from "@/lib/logistique-data";
import { stockItemsInitiaux } from "@/lib/logistique-stock-data";
import { contratsInitiaux } from "@/lib/maintenance-data";
import { prisma } from "@/lib/prisma";
import { salariesInitiaux } from "@/lib/rh-data";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

// GET /api/init-db - Initialiser la base de données avec des données de test
export async function GET() {
  try {
    // Insérer les collaborateurs
    for (const collaborateur of collaborateurs) {
      await prisma.collaborateur.upsert({
        where: { id: collaborateur.id },
        update: {
          nom: collaborateur.nom,
          couleur: collaborateur.couleur || "#000000", // Valeur par défaut si undefined
          entreprise: collaborateur.entreprise,
          aCompte: false,
        },
        create: {
          id: collaborateur.id,
          nom: collaborateur.nom,
          couleur: collaborateur.couleur || "#000000", // Valeur par défaut si undefined
          entreprise: collaborateur.entreprise,
          aCompte: false,
        },
      });
    }

    // Création du collaborateur administrateur et son compte
    console.log("👤 Création du collaborateur administrateur...");

    // Générer des UUID uniques
    const adminCollaborateurId = uuidv4();
    const adminCompteId = uuidv4();

    // Créer un collaborateur admin
    const adminCollaborateur = await prisma.collaborateur.create({
      data: {
        id: adminCollaborateurId,
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

    const adminCompte = await prisma.compte.create({
      data: {
        id: adminCompteId,
        identifiant: "admin",
        motDePasse: hashedPassword,
        role: "admin",
        collaborateurId: adminCollaborateurId,
      },
    });

    console.log(
      `  ✓ Compte administrateur créé avec identifiant: ${adminCompte.identifiant} et mot de passe: admin`
    );

    // Insérer les événements
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
          ticketRestaurant: false,
          heuresSupplementaires: evenement.heures_supplementaires,
          grandDeplacement: evenement.grand_deplacement,
          prgd: evenement.prgd,
          nombrePrgd: evenement.nombre_prgd || 0,
          typeAbsence: evenement.type_absence || null,
          verrouille: false,
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
          ticketRestaurant: false,
          heuresSupplementaires: evenement.heures_supplementaires,
          grandDeplacement: evenement.grand_deplacement,
          prgd: evenement.prgd,
          nombrePrgd: evenement.nombre_prgd || 0,
          typeAbsence: evenement.type_absence || null,
          verrouille: false,
        },
      });
    }

    // Insérer les salariés
    for (const salarie of salariesInitiaux) {
      await prisma.salarie.upsert({
        where: { collaborateurId: salarie.id },
        update: {
          nom: salarie.nom,
          prenom: salarie.prenom,
          classification: salarie.classification,
          dateEntree: salarie.dateEntree,
          typeContrat: salarie.typeContrat,
          dureeContrat: salarie.dureeContrat,
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
          dureeContrat: salarie.dureeContrat,
          certifications: salarie.certifications,
          habilitations: salarie.habilitations,
          entreprise: salarie.entreprise,
          poste: salarie.poste,
          email: salarie.email,
          telephone: salarie.telephone,
          collaborateurId: salarie.id,
        },
      });
    }

    // Insérer les véhicules
    for (const vehicule of vehiculesInitiaux) {
      await prisma.vehicule.upsert({
        where: { immatriculation: vehicule.immatriculation },
        update: {
          societe: vehicule.societe,
          marque: vehicule.marque,
          modele: vehicule.modele,
          etat: vehicule.etat,
          proprietaire: vehicule.proprietaire,
          dateMiseEnCirculation: vehicule.dateMiseEnCirculation,
          kilometrage: vehicule.kilometrage,
          kmProchaineRevision: vehicule.kmProchaineRevision,
          dateLimiteControleTechnique: vehicule.dateLimiteControleTechnique,
          dateLimiteControlePollution: vehicule.dateLimiteControlePollution,
          typeVehicule: vehicule.typeVehicule,
        },
        create: {
          id: vehicule.id,
          societe: vehicule.societe,
          marque: vehicule.marque,
          modele: vehicule.modele,
          immatriculation: vehicule.immatriculation,
          etat: vehicule.etat,
          proprietaire: vehicule.proprietaire,
          dateMiseEnCirculation: vehicule.dateMiseEnCirculation,
          kilometrage: vehicule.kilometrage,
          kmProchaineRevision: vehicule.kmProchaineRevision,
          dateLimiteControleTechnique: vehicule.dateLimiteControleTechnique,
          dateLimiteControlePollution: vehicule.dateLimiteControlePollution,
          typeVehicule: vehicule.typeVehicule,
        },
      });
    }

    // Insérer les contacts
    for (const contact of contactsInitiaux) {
      // Utiliser l'ID du compte admin généré
      const utilisateurId = adminCompteId;

      // Créer le contact sans les relations
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
          commentaires: contact.commentaires,
          dateCreation: contact.dateCreation,
          dateDerniereModification: contact.dateDerniereModification,
          utilisateurId: utilisateurId, // Utiliser l'ID du compte admin
          montantDevis: contact.montantDevis,
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
          commentaires: contact.commentaires,
          dateCreation: contact.dateCreation,
          dateDerniereModification: contact.dateDerniereModification,
          utilisateurId: utilisateurId, // Utiliser l'ID du compte admin
          montantDevis: contact.montantDevis,
          collaborateursIds: contact.collaborateursIds || [],
        },
      });

      // Connecter les collaborateurs au contact si nécessaire
      for (const collaborateurId of contact.collaborateursIds || []) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            collaborateurs: {
              connect: { id: collaborateurId },
            },
          },
        });
      }
    }

    // Insérer les demandes de congés
    for (const demande of demandesCongesInitiales) {
      // Utiliser l'ID du compte admin généré
      const utilisateurId = adminCompteId;

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
    }

    // Insérer les notifications
    for (const notification of notificationsInitiales) {
      // Utiliser l'ID du compte admin généré
      const utilisateurId = adminCompteId;

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
    }

    // Insérer les contrats de maintenance
    for (const contrat of contratsInitiaux) {
      await prisma.contratMaintenance.upsert({
        where: { reference: contrat.reference },
        update: {
          client: contrat.client,
          type: contrat.type,
          montant: contrat.montant,
          dateDebut: new Date(contrat.dateDebut || Date.now()),
          dateEcheance: new Date(contrat.dateEcheance || Date.now()),
          statut: contrat.statut,
          description: contrat.description,
          contactClient: contrat.contactClient,
          emailContact: contrat.emailContact,
          telephoneContact: contrat.telephoneContact,
          notes: contrat.notes,
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
          dateDebut: new Date(contrat.dateDebut || Date.now()),
          dateEcheance: new Date(contrat.dateEcheance || Date.now()),
          statut: contrat.statut,
          description: contrat.description,
          contactClient: contrat.contactClient,
          emailContact: contrat.emailContact,
          telephoneContact: contrat.telephoneContact,
          notes: contrat.notes,
          dateCreation: new Date(contrat.dateCreation || Date.now()),
          dateDerniereModification: new Date(
            contrat.dateDerniereModification || Date.now()
          ),
        },
      });
    }

    // Insérer les éléments de stock
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
    }

    return NextResponse.json({
      success: true,
      message: "Base de données initialisée avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de la base de données:",
      error
    );
    return NextResponse.json(
      {
        error: "Erreur lors de l'initialisation de la base de données",
        details: error,
      },
      { status: 500 }
    );
  }
}
