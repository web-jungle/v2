export type TypeEvenement = "presence" | "absence" | "formation" | "autre";
export type TypeAbsence = "CP" | "RTT" | "CSS" | "Arrêt Travail" | "Abs Inj";
export type ZoneTrajet = "Zone 1" | "Zone 2" | "Zone 3" | "Zone 4" | "Zone 5";
export type Role = "admin" | "manager" | "collaborateur";

export interface Collaborateur {
  id: string;
  nom: string;
  couleur?: string;
  entreprise: string;
  created_at?: string;
}

export interface Utilisateur {
  id: string;
  identifiant: string;
  mot_de_passe: string;
  nom: string;
  role: Role;
  collaborateur_id: string | null;
  collaborateursGeres: string[];
  created_at?: string;
}

export interface SessionUtilisateur {
  id: string;
  identifiant: string;
  nom: string;
  role: Role;
  collaborateur_id: string | null;
  collaborateurs_geres: string[];
}

export interface Evenement {
  id: string;
  title: string;
  start: Date;
  end: Date;
  collaborateur_id: string;
  collaborateurId?: string;
  type_evenement: string;
  typeEvenement?: string;
  lieu_chantier: string | null;
  lieuChantier?: string | null;
  zone_trajet: string | null;
  zoneTrajet?: string | null;
  panier_repas: boolean;
  panierRepas?: boolean;
  ticket_restaurant: boolean;
  ticketRestaurant?: boolean;
  heures_supplementaires: number;
  heuresSupplementaires?: number;
  grand_deplacement: boolean;
  grandDeplacement?: boolean;
  prgd: boolean;
  nombre_prgd: number;
  nombrePrgd?: number;
  type_absence?: string | null;
  typeAbsence?: string | null;
  verrouille: boolean;
  latitude?: number | null;
  longitude?: number | null;
  adresse_complete?: string | null;
  adresseComplete?: string | null;
  created_at?: string;
  collaborateur?: Collaborateur;
  // Interface pour la décomposition des zones
  decomposedZone?: {
    zone5: number;
    zoneAutre: string | null;
    quantiteZoneAutre: number;
  };
}

// Interface pour les résultats de géocodage
export interface GeocodingResult {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

// Constantes pour les entreprises
export const entreprises = [
  "ORIZON TELECOM",
  "ORIZON INSTALLATION",
  "ORIZON GROUP",
  "YELLEEN",
];
