export type Societe = "OT" | "OI" | "OG" | "YE"
export type EtatVehicule = "EN CIRCULATION" | "HORS SERVICE" | "EN RÉPARATION" | "VENDU"
export type TypeProprietaire = "ACHAT" | "CREDIT BAIL" | "LOCATION" | "LEASING"
export type TypeVehicule = "VOITURE" | "UTILITAIRE" | "CAMION" | "REMORQUE" | "AUTRE"
export type CableFO =
  | "6FO"
  | "12FO"
  | "24FO"
  | "36FO"
  | "48FO"
  | "72FO"
  | "96FO"
  | "144FO"
  | "288FO"
  | "432FO"
  | "576FO"
  | "764FO"
export type TypeM = "M6" | "M12"
export type TypeG = "G657" | "G652"
export type TypeEnroulement = "Touret" | "Couronne"

export interface Vehicule {
  id: string
  societe: Societe
  marque: string
  modele: string
  immatriculation: string
  etat: EtatVehicule
  proprietaire: TypeProprietaire
  typeVehicule?: TypeVehicule
  dateMiseEnCirculation?: Date
  finContrat?: Date
  kilometrage?: number
  kmProchaineRevision?: number
  dateLimiteControleTechnique?: Date
  dateLimiteControlePollution?: Date
  dernierEntretien?: Date
  prochainEntretien?: Date
  conducteurPrincipal?: string
  notes?: string
}

export interface StockItem {
  id: string
  cableType: CableFO
  typeM: TypeM
  typeG: TypeG
  enroulement: TypeEnroulement
  longueur: number
  reference?: string
  emplacement?: string
  dateReception?: Date
  notes?: string
}

export const societes: Societe[] = ["OT", "OI", "OG", "YE"]
export const etatsVehicule: EtatVehicule[] = ["EN CIRCULATION", "HORS SERVICE", "EN RÉPARATION", "VENDU"]
export const typesProprietaire: TypeProprietaire[] = ["ACHAT", "CREDIT BAIL", "LOCATION", "LEASING"]
export const typesVehicule: TypeVehicule[] = ["VOITURE", "UTILITAIRE", "CAMION", "REMORQUE", "AUTRE"]
export const cableTypes: CableFO[] = [
  "6FO",
  "12FO",
  "24FO",
  "36FO",
  "48FO",
  "72FO",
  "96FO",
  "144FO",
  "288FO",
  "432FO",
  "576FO",
  "764FO",
]
export const typeMs: TypeM[] = ["M6", "M12"]
export const typeGs: TypeG[] = ["G657", "G652"]
export const typeEnroulements: TypeEnroulement[] = ["Touret", "Couronne"]
