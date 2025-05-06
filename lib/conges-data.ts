import type { DemandeConge, Notification } from "./conges-types"

// Données initiales pour les demandes de congés
export const demandesCongesInitiales: DemandeConge[] = [
  {
    id: "1",
    utilisateurId: "3", // ARTES Damien
    collaborateurId: "1",
    collaborateurNom: "ARTES Damien",
    dateDebut: new Date(2023, 6, 15), // 15 juillet 2023
    dateFin: new Date(2023, 6, 30), // 30 juillet 2023
    typeConge: "Congés payés",
    motif: "Vacances d'été",
    statut: "Approuvé",
    commentaireAdmin: "Bon congé !",
    dateCreation: new Date(2023, 5, 10), // 10 juin 2023
    dateModification: new Date(2023, 5, 15), // 15 juin 2023
    notificationLue: true,
  },
  {
    id: "2",
    utilisateurId: "4", // BENAMARA Walid
    collaborateurId: "2",
    collaborateurNom: "BENAMARA Walid",
    dateDebut: new Date(2023, 11, 24), // 24 décembre 2023
    dateFin: new Date(2023, 11, 31), // 31 décembre 2023
    typeConge: "Congés payés",
    motif: "Vacances de fin d'année",
    statut: "Approuvé",
    dateCreation: new Date(2023, 10, 5), // 5 novembre 2023
    dateModification: new Date(2023, 10, 10), // 10 novembre 2023
    notificationLue: true,
  },
  {
    id: "3",
    utilisateurId: "5", // BELTRAN Noah
    collaborateurId: "3",
    collaborateurNom: "BELTRAN Noah",
    dateDebut: new Date(2024, 1, 12), // 12 février 2024
    dateFin: new Date(2024, 1, 16), // 16 février 2024
    typeConge: "RTT",
    motif: "Vacances d'hiver",
    statut: "Refusé",
    commentaireAdmin: "Période chargée, merci de reporter vos congés.",
    dateCreation: new Date(2024, 0, 15), // 15 janvier 2024
    dateModification: new Date(2024, 0, 20), // 20 janvier 2024
    notificationLue: true,
  },
  {
    id: "4",
    utilisateurId: "3", // ARTES Damien
    collaborateurId: "1",
    collaborateurNom: "ARTES Damien",
    dateDebut: new Date(2024, 4, 1), // 1 mai 2024
    dateFin: new Date(2024, 4, 10), // 10 mai 2024
    typeConge: "Congés payés",
    motif: "Vacances de printemps",
    statut: "En attente",
    dateCreation: new Date(2024, 3, 1), // 1 avril 2024
    dateModification: new Date(2024, 3, 1), // 1 avril 2024
    notificationLue: false,
  },
  {
    id: "5",
    utilisateurId: "4", // BENAMARA Walid
    collaborateurId: "2",
    collaborateurNom: "BENAMARA Walid",
    dateDebut: new Date(2024, 7, 1), // 1 août 2024
    dateFin: new Date(2024, 7, 15), // 15 août 2024
    typeConge: "Congés payés",
    motif: "Vacances d'été",
    statut: "En attente",
    dateCreation: new Date(2024, 5, 15), // 15 juin 2024
    dateModification: new Date(2024, 5, 15), // 15 juin 2024
    notificationLue: false,
  },
]

// Données initiales pour les notifications
export const notificationsInitiales: Notification[] = [
  {
    id: "1",
    utilisateurId: "1", // Admin
    message: "Nouvelle demande de congés de ARTES Damien",
    lien: "/rh/conges?id=4",
    dateCreation: new Date(2024, 3, 1), // 1 avril 2024
    lue: false,
    type: "conge",
    demandeId: "4",
  },
  {
    id: "2",
    utilisateurId: "1", // Admin
    message: "Nouvelle demande de congés de BENAMARA Walid",
    lien: "/rh/conges?id=5",
    dateCreation: new Date(2024, 5, 15), // 15 juin 2024
    lue: false,
    type: "conge",
    demandeId: "5",
  },
  {
    id: "3",
    utilisateurId: "3", // ARTES Damien
    message: "Votre demande de congés est en attente de validation",
    lien: "/rh/conges?id=4",
    dateCreation: new Date(2024, 3, 1), // 1 avril 2024
    lue: true,
    type: "conge",
    demandeId: "4",
  },
  {
    id: "4",
    utilisateurId: "4", // BENAMARA Walid
    message: "Votre demande de congés est en attente de validation",
    lien: "/rh/conges?id=5",
    dateCreation: new Date(2024, 5, 15), // 15 juin 2024
    lue: true,
    type: "conge",
    demandeId: "5",
  },
  {
    id: "5",
    utilisateurId: "5", // BELTRAN Noah
    message: "Votre demande de congés a été refusée",
    lien: "/rh/conges?id=3",
    dateCreation: new Date(2024, 0, 20), // 20 janvier 2024
    lue: true,
    type: "conge",
    demandeId: "3",
  },
]
