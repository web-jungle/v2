import type { Contact, ContactStatus } from "./crm-types"

// Statuts possibles pour un contact
export const contactStatuses: ContactStatus[] = [
  "À contacter",
  "VT à programmer",
  "VT programmé",
  "Devis à faire",
  "Devis envoyé",
  "Travaux à réaliser",
  "À facturer",
  "Terminé",
]

// Catégories possibles pour un contact
export const contactCategories = ["IRVE", "ALARME", "ELEC", "PAC", "CET", "PV", "RENO"] as const

// Données initiales pour les contacts
export const contactsInitiaux: Contact[] = [
  {
    id: "1",
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@example.com",
    telephone: "06 12 34 56 78",
    adresse: "123 Rue de Paris",
    codePostal: "75001",
    ville: "Paris",
    categories: ["ELEC", "ALARME"],
    status: "À contacter",
    commentaires: "Client intéressé par une installation électrique complète et un système d'alarme.",
    dateCreation: new Date(2023, 0, 15),
    dateDerniereModification: new Date(2023, 0, 15),
    utilisateurId: "1",
    collaborateursIds: ["1", "3"], // Affecté à l'admin et à BELTRAN Noah
  },
  {
    id: "2",
    nom: "Martin",
    prenom: "Sophie",
    email: "sophie.martin@example.com",
    telephone: "07 23 45 67 89",
    adresse: "456 Avenue des Champs",
    codePostal: "69002",
    ville: "Lyon",
    categories: ["PV", "PAC"],
    status: "VT à programmer",
    commentaires: "Souhaite installer des panneaux solaires et une pompe à chaleur. Disponible les après-midis.",
    dateCreation: new Date(2023, 1, 20),
    dateDerniereModification: new Date(2023, 2, 5),
    utilisateurId: "1",
    collaborateursIds: ["2"], // Affecté à BENAMARA Walid
  },
  {
    id: "3",
    nom: "Petit",
    prenom: "Robert",
    email: "robert.petit@example.com",
    telephone: "06 34 56 78 90",
    adresse: "789 Boulevard Saint-Michel",
    codePostal: "33000",
    ville: "Bordeaux",
    categories: ["IRVE"],
    status: "Devis envoyé",
    commentaires: "Installation d'une borne de recharge pour véhicule électrique. Devis envoyé le 10/03/2023.",
    dateCreation: new Date(2023, 2, 1),
    dateDerniereModification: new Date(2023, 2, 10),
    utilisateurId: "2",
    collaborateursIds: ["2", "4"], // Affecté à BENAMARA Walid et BERRAHMOUNE Abdelkader
    montantDevis: 2450.75,
  },
  {
    id: "4",
    nom: "Leroy",
    prenom: "Marie",
    email: "marie.leroy@example.com",
    telephone: "07 45 67 89 01",
    adresse: "101 Rue de la République",
    codePostal: "13001",
    ville: "Marseille",
    categories: ["RENO", "ELEC"],
    status: "Travaux à réaliser",
    commentaires: "Rénovation complète de l'installation électrique. Travaux prévus pour avril 2023.",
    dateCreation: new Date(2023, 1, 5),
    dateDerniereModification: new Date(2023, 3, 1),
    utilisateurId: "2",
    collaborateursIds: ["3"], // Affecté à BELTRAN Noah
    montantDevis: 8750,
  },
  {
    id: "5",
    nom: "Moreau",
    prenom: "Thomas",
    email: "thomas.moreau@example.com",
    telephone: "06 56 78 90 12",
    adresse: "202 Avenue Jean Jaurès",
    codePostal: "59000",
    ville: "Lille",
    categories: ["CET", "PAC"],
    status: "VT programmé",
    commentaires: "Visite technique programmée le 15/04/2023 à 14h pour installation d'un chauffe-eau thermodynamique.",
    dateCreation: new Date(2023, 3, 1),
    dateDerniereModification: new Date(2023, 3, 5),
    utilisateurId: "1",
    collaborateursIds: ["1", "5"], // Affecté à l'admin et à BLOT Alexia
  },
]
