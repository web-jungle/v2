import {
  demandesCongesInitiales,
  notificationsInitiales,
} from "@/lib/conges-data";
import { contactsInitiaux } from "@/lib/crm-data";

export const runtime = 'nodejs';
import {
  collaborateurs,
  evenementsInitiaux,
  utilisateursInitiaux,
} from "@/lib/data";
import { vehiculesInitiaux } from "@/lib/logistique-data";
import { stockItemsInitiaux } from "@/lib/logistique-stock-data";
import { contratsInitiaux } from "@/lib/maintenance-data";
import { prisma } from "@/lib/prisma";
import { salariesInitiaux } from "@/lib/rh-data";
import { NextResponse } from "next/server";

// GET /api/init-db - Initialiser la base de données avec des données de test
export async function GET() {
  try {
    // Insérer les collaborateurs
    for (const collaborateur of collaborateurs) {
      await prisma.collaborateur.upsert({
        where: { id: collaborateur.id },
        update: collaborateur,
        create: collaborateur,
      });
    }

    // Insérer les utilisateurs
    for (const utilisateur of utilisateursInitiaux) {
      await prisma.utilisateur.upsert({
        where: { id: utilisateur.id },
        update: {
          identifiant: utilisateur.identifiant,
          mot_de_passe: utilisateur.mot_de_passe,
          nom: utilisateur.nom,
          role: utilisateur.role,
          collaborateur_id: utilisateur.collaborateur_id,
          collaborateurs_geres: utilisateur.collaborateurs_geres || [],
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
      });
    }

    // Insérer les événements
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
          utilisateurId: contact.utilisateurId,
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
          utilisateurId: contact.utilisateurId,
          collaborateursIds: contact.collaborateursIds,
          montantDevis: contact.montantDevis,
        },
      });

      // Mettre à jour les relations avec les collaborateurs
      if (contact.collaborateursIds && contact.collaborateursIds.length > 0) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            collaborateurs: {
              connect: contact.collaborateursIds.map((id) => ({ id })),
            },
          },
        });
      }
    }

    // Insérer les demandes de congés
    for (const demande of demandesCongesInitiales) {
      await prisma.demandeConge.upsert({
        where: { id: demande.id },
        update: {
          utilisateurId: demande.utilisateurId,
          collaborateurId: demande.collaborateurId,
          collaborateurNom: demande.collaborateurNom,
          dateDebut: demande.dateDebut,
          dateFin: demande.dateFin,
          typeConge: demande.typeConge,
          motif: demande.motif,
          statut: demande.statut,
          commentaireAdmin: demande.commentaireAdmin,
          dateCreation: demande.dateCreation,
          dateModification: demande.dateModification,
          notificationLue: demande.notificationLue,
        },
        create: {
          id: demande.id,
          utilisateurId: demande.utilisateurId,
          collaborateurId: demande.collaborateurId,
          collaborateurNom: demande.collaborateurNom,
          dateDebut: demande.dateDebut,
          dateFin: demande.dateFin,
          typeConge: demande.typeConge,
          motif: demande.motif,
          statut: demande.statut,
          commentaireAdmin: demande.commentaireAdmin,
          dateCreation: demande.dateCreation,
          dateModification: demande.dateModification,
          notificationLue: demande.notificationLue,
        },
      });
    }

    // Insérer les notifications
    for (const notification of notificationsInitiales) {
      await prisma.notification.upsert({
        where: { id: notification.id },
        update: {
          utilisateurId: notification.utilisateurId,
          message: notification.message,
          lien: notification.lien,
          dateCreation: notification.dateCreation,
          lue: notification.lue,
          type: notification.type,
          demandeId: notification.demandeId,
        },
        create: {
          id: notification.id,
          utilisateurId: notification.utilisateurId,
          message: notification.message,
          lien: notification.lien,
          dateCreation: notification.dateCreation,
          lue: notification.lue,
          type: notification.type,
          demandeId: notification.demandeId,
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
          dateDebut: new Date(contrat.dateDebut),
          dateEcheance: new Date(contrat.dateEcheance),
          statut: contrat.statut,
          description: contrat.description,
          contactClient: contrat.contactClient,
          emailContact: contrat.emailContact,
          telephoneContact: contrat.telephoneContact,
          notes: contrat.notes,
          dateCreation: new Date(contrat.dateCreation),
          dateDerniereModification: new Date(contrat.dateDerniereModification),
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
          notes: contrat.notes,
          dateCreation: new Date(contrat.dateCreation),
          dateDerniereModification: new Date(contrat.dateDerniereModification),
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
