export interface Salarie {
  id: string;
  nom: string;
  prenom: string;
  classification: string;
  dateEntree: Date;
  typeContrat: "CDI" | "CDD" | "Alternance" | "Stage" | "Intérim" | "Autre";
  dureeContrat?: string; // Pour les CDD, alternances, etc.
  certifications: string[];
  habilitations: string[];
  entreprise: string;
  poste: string;
  email: string;
  telephone: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  dateNaissance?: Date;
  numeroSecu?: string;
  collaborateurId?: string; // ID du collaborateur associé
  collaborateur?: {
    id: string;
    nom: string;
    entreprise: string;
    couleur?: string;
  };
}

export const typeContrats = [
  "CDI",
  "CDD",
  "Alternance",
  "Stage",
  "Intérim",
  "Autre",
] as const;
