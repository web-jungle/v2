import type { Collaborateur, Evenement, Utilisateur } from "./types";

// Liste des entreprises
export const entreprises = [
  "ORIZON TELECOM",
  "ORIZON INSTALLATION",
  "ORIZON GROUP",
  "YELLEEN",
];

// Liste des collaborateurs avec leurs entreprises
export const collaborateurs: Collaborateur[] = [
  {
    id: "5be40aa8-3d27-44dc-af53-2e16df5cef97",
    nom: "ARTES Damien",
    couleur: "#3174ad",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "7a9cd593-753a-4c75-8fa7-d368788a2c3f",
    nom: "BENAMARA Walid",
    couleur: "#e6550d",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "98b34d32-9b1e-4da9-b31a-156ec3f68285",
    nom: "BELTRAN Noah",
    couleur: "#31a354",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "f4b7c870-77bc-453e-8c9d-37d37bbc3a6e",
    nom: "BERRAHMOUNE Abdelkader",
    couleur: "#756bb1",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "d2f5e0a5-20bf-47d2-a04a-10616d02457b",
    nom: "BLOT Alexia",
    couleur: "#636363",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "af1c1c3b-1d08-432c-be2e-d70fef4270c0",
    nom: "BOFILL Nausicaa",
    couleur: "#8c564b",
    entreprise: "ORIZON GROUP",
  },
  {
    id: "6e823313-78b3-45d2-9afd-9e4d5892932a",
    nom: "BORDES Marc",
    couleur: "#9c9ede",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "a6f4f9b1-3a23-4a22-b97f-aa9f9df61a6f",
    nom: "CHAVANETTES Dorian",
    couleur: "#cedb9c",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "c8d47c3e-0aca-4022-a4e6-ebcf0a1c8c8d",
    nom: "DA COSTA JEROME",
    couleur: "#e7969c",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "b9d7f12e-37df-4aa8-8f32-e5a35f9e28e7",
    nom: "DARGAUD Mickael",
    couleur: "#7b4173",
    entreprise: "YELLEEN",
  },
  {
    id: "e8b3f4a2-5c6d-4e2f-9a8b-7c9d0e1f8a9b",
    nom: "EL GHANANE Ahmed",
    couleur: "#a55194",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "d7c6b5a4-3e2d-1f0e-9d8c-7b6a5f4e3d2c",
    nom: "FARDAU Aurélien",
    couleur: "#ce6dbd",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "c6b5a4d3-2e1f-0d9c-8b7a-6f5e4d3c2b1a",
    nom: "FERNANDEZ Sandra",
    couleur: "#de9ed6",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "b5a4d3c2-1e0f-9d8c-7b6a-5f4e3d2c1b0a",
    nom: "GALETO Kévin",
    couleur: "#3182bd",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "a4d3c2b1-0e9f-8d7c-6b5a-4f3e2d1c0b9a",
    nom: "GIANNICI Mélanie",
    couleur: "#6baed6",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "9d3c2b1a-0e9f-8d7c-6b5a-4f3e2d1c0b9a",
    nom: "HAMITOUCHE Ahmed",
    couleur: "#9ecae1",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "8d2c1b0a-9e8f-7d6c-5b4a-3f2e1d0c9b8a",
    nom: "INNECCO Eric",
    couleur: "#c6dbef",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "7c1b0a9d-8e7f-6c5b-4a3f-2e1d0c9b8a7",
    nom: "LIMONE Nominoë",
    couleur: "#e6550d",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "6b0a9d8c-7f6e-5b4a-3f2e-1d0c9b8a7c6",
    nom: "MARTINEZ Axel",
    couleur: "#fd8d3c",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "5a9d8c7b-6f5e-4d3c-2b1a-0f9e8d7c6b5",
    nom: "MOLINS Johan",
    couleur: "#fdae6b",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "4d8c7b6a-5f4e-3d2c-1b0a-9e8f7d6c5b4",
    nom: "MOREAU Loïc",
    couleur: "#fdd0a2",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "3c7b6a5f-4e3d-2c1b-0a9e-8f7d6c5b4a3",
    nom: "NOGUES Julien",
    couleur: "#31a354",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "2b6a5f4e-3d2c-1b0a-9e8f-7d6c5b4a3f2",
    nom: "OLIVE Jonathan",
    couleur: "#74c476",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "1a5f4e3d-2c1b-0a9e-8f7d-6c5b4a3f2e1",
    nom: "ORDONEZ Adrian",
    couleur: "#a1d99b",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "0a4e3d2c-1b0a-9e8f-7d6c-5b4a3f2e1d0",
    nom: "ORDONEZ Anaïs",
    couleur: "#c7e9c0",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "9d8c7b6a-5f4e-3d2c-1b0a-9e8f7d6c5b4",
    nom: "PEIRACCHIA Rodrigo",
    couleur: "#756bb1",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "8c7b6a5f-4e3d-2c1b-0a9e-8f7d6c5b4a3",
    nom: "POULNOT Maxime",
    couleur: "#9e9ac8",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "7b6a5f4e-3d2c-1b0a-9e8f-7d6c5b4a3f2",
    nom: "ROUCHON Amélie",
    couleur: "#bcbddc",
    entreprise: "ORIZON GROUP",
  },
  {
    id: "6a5f4e3d-2c1b-0a9e-8f7d-6c5b4a3f2e1",
    nom: "SANCHEZ David",
    couleur: "#dadaeb",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "5f4e3d2c-1b0a-9e8f-7d6c-5b4a3f2e1d0",
    nom: "SANCHEZ Rémi",
    couleur: "#636363",
    entreprise: "YELLEEN",
  },
  {
    id: "4e3d2c1b-0a9e-8f7d-6c5b-4a3f2e1d0c9",
    nom: "SIMON Pierre-Luc",
    couleur: "#969696",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "3d2c1b0a-9e8f-7d6c-5b4a-3f2e1d0c9b8",
    nom: "STOUPY Arnaud",
    couleur: "#bdbdbd",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "2c1b0a9e-8f7d-6c5b-4a3f-2e1d0c9b8a7",
    nom: "TAIBI Stéphan",
    couleur: "#d9d9d9",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "1b0a9e8f-7d6c-5b4a-3f2e-1d0c9b8a7c6",
    nom: "WILLIOT Maxime",
    couleur: "#f7b6d2",
    entreprise: "ORIZON GROUP",
  },
];

// Générer des événements pour la semaine en cours
const today = new Date();
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi de la semaine en cours

export const evenementsInitiaux: Evenement[] = [
  {
    id: "1",
    title: "ARTES Damien - Chantier Paris",
    start: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate(),
      8,
      0
    ),
    end: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate(),
      17,
      0
    ),
    collaborateur_id: "5be40aa8-3d27-44dc-af53-2e16df5cef97",
    type_evenement: "presence",
    lieu_chantier: "Paris",
    zone_trajet: "1A",
    panier_repas: true,
    ticket_restaurant: false,
    heures_supplementaires: 0,
    grand_deplacement: false,
    prgd: false,
    nombre_prgd: 0,
    verrouille: false,
  },
  {
    id: "2",
    title: "BENAMARA Walid - Chantier Lyon",
    start: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 1,
      8,
      0
    ),
    end: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 1,
      17,
      0
    ),
    collaborateur_id: "7a9cd593-753a-4c75-8fa7-d368788a2c3f",
    type_evenement: "presence",
    lieu_chantier: "Lyon",
    zone_trajet: "2",
    panier_repas: false,
    ticket_restaurant: false,
    heures_supplementaires: 2,
    grand_deplacement: true,
    prgd: true,
    nombre_prgd: 1,
    verrouille: false,
  },
  {
    id: "3",
    title: "BELTRAN Noah - Chantier Marseille",
    start: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 2,
      8,
      0
    ),
    end: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 4,
      17,
      0
    ),
    collaborateur_id: "98b34d32-9b1e-4da9-b31a-156ec3f68285",
    type_evenement: "presence",
    lieu_chantier: "Marseille",
    zone_trajet: "3",
    panier_repas: false,
    ticket_restaurant: false,
    heures_supplementaires: 0,
    grand_deplacement: true,
    prgd: false,
    nombre_prgd: 0,
    verrouille: false,
  },
  {
    id: "4",
    title: "BERRAHMOUNE Abdelkader - RTT",
    start: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 3,
      8,
      0
    ),
    end: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 3,
      17,
      0
    ),
    collaborateur_id: "f4b7c870-77bc-453e-8c9d-37d37bbc3a6e",
    type_evenement: "absence",
    lieu_chantier: null,
    zone_trajet: null,
    panier_repas: false,
    ticket_restaurant: false,
    heures_supplementaires: 0,
    grand_deplacement: false,
    prgd: false,
    nombre_prgd: 0,
    type_absence: "RTT",
    verrouille: false,
  },
  {
    id: "5",
    title: "BLOT Alexia - CP",
    start: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 4,
      8,
      0
    ),
    end: new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 4,
      17,
      0
    ),
    collaborateur_id: "d2f5e0a5-20bf-47d2-a04a-10616d02457b",
    type_evenement: "absence",
    lieu_chantier: null,
    zone_trajet: null,
    panier_repas: false,
    ticket_restaurant: false,
    heures_supplementaires: 0,
    grand_deplacement: false,
    prgd: false,
    nombre_prgd: 0,
    type_absence: "CP",
    verrouille: false,
  },
];

// Table des administrateurs (pour la page admin)
export interface Admin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: "super_admin" | "admin" | "moderateur";
  departement: string;
  date_creation: Date;
  dernier_acces: Date;
  est_actif: boolean;
}

// Données initiales pour la table des administrateurs
export const administrateursInitiaux: Admin[] = [
  {
    id: "1",
    nom: "DURAND",
    prenom: "Jean",
    email: "jean.durand@orizon-group.fr",
    telephone: "06 12 34 56 78",
    role: "super_admin",
    departement: "Direction",
    date_creation: new Date("2023-01-15"),
    dernier_acces: new Date(),
    est_actif: true,
  },
  {
    id: "2",
    nom: "MARTIN",
    prenom: "Sophie",
    email: "sophie.martin@orizon-group.fr",
    telephone: "06 23 45 67 89",
    role: "admin",
    departement: "Ressources Humaines",
    date_creation: new Date("2023-03-20"),
    dernier_acces: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours avant aujourd'hui
    est_actif: true,
  },
  {
    id: "3",
    nom: "PETIT",
    prenom: "Thomas",
    email: "thomas.petit@orizon-group.fr",
    telephone: "06 34 56 78 90",
    role: "moderateur",
    departement: "Support Technique",
    date_creation: new Date("2023-06-10"),
    dernier_acces: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours avant aujourd'hui
    est_actif: true,
  },
  {
    id: "4",
    nom: "LEROY",
    prenom: "Marie",
    email: "marie.leroy@orizon-group.fr",
    telephone: "06 45 67 89 01",
    role: "admin",
    departement: "Finance",
    date_creation: new Date("2023-08-05"),
    dernier_acces: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 jours avant aujourd'hui
    est_actif: false,
  },
  {
    id: "5",
    nom: "BERNARD",
    prenom: "Lucas",
    email: "lucas.bernard@orizon-group.fr",
    telephone: "06 56 78 90 12",
    role: "moderateur",
    departement: "Communication",
    date_creation: new Date("2023-10-12"),
    dernier_acces: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour avant aujourd'hui
    est_actif: true,
  },
];

// Ajouter des données initiales pour les collaborateurs gérés par les managers
export const utilisateursInitiaux: Utilisateur[] = [
  {
    id: "1",
    identifiant: "admin",
    mot_de_passe: "adminV66+",
    nom: "Administrateur",
    role: "admin",
    collaborateur_id: null,
    collaborateursGeres: [],
  },
  {
    id: "2",
    identifiant: "manager",
    mot_de_passe: "managerV66+",
    nom: "Chef d'équipe",
    role: "manager",
    collaborateur_id: null,
    collaborateursGeres: [
      "5be40aa8-3d27-44dc-af53-2e16df5cef97",
      "7a9cd593-753a-4c75-8fa7-d368788a2c3f",
      "98b34d32-9b1e-4da9-b31a-156ec3f68285",
    ], // Gère ARTES Damien, BENAMARA Walid et BELTRAN Noah
  },
  {
    id: "3",
    identifiant: "damien.artes",
    mot_de_passe: "damienV66+",
    nom: "ARTES Damien",
    role: "collaborateur",
    collaborateur_id: "5be40aa8-3d27-44dc-af53-2e16df5cef97",
    collaborateursGeres: [],
  },
  {
    id: "4",
    identifiant: "walid.benamara",
    mot_de_passe: "walidV66+",
    nom: "BENAMARA Walid",
    role: "collaborateur",
    collaborateur_id: "7a9cd593-753a-4c75-8fa7-d368788a2c3f",
    collaborateursGeres: [],
  },
  {
    id: "5",
    identifiant: "noah.beltran",
    mot_de_passe: "noahV66+",
    nom: "BELTRAN Noah",
    role: "collaborateur",
    collaborateur_id: "98b34d32-9b1e-4da9-b31a-156ec3f68285",
    collaborateursGeres: [],
  },
];
