export type ContactCategory = "IRVE" | "ALARME" | "ELEC" | "PAC" | "CET" | "PV" | "RENO"

export type ContactStatus =
  | "À contacter"
  | "VT à programmer"
  | "VT programmé"
  | "Devis à faire"
  | "Devis envoyé"
  | "Travaux à réaliser"
  | "À facturer"
  | "Terminé"

export interface Document {
  id: string
  nom: string
  type: string
  dateAjout: Date
  url: string
  taille: number // en Ko
}

export interface Contact {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  codePostal: string
  ville: string
  categories: ContactCategory[]
  status: ContactStatus
  commentaires: string
  dateCreation: Date
  dateDerniereModification: Date
  utilisateurId: string
  collaborateursIds: string[] // IDs des collaborateurs affectés
  documents: Document[] // Documents associés au contact
  alertesIgnorees?: string[] // IDs des alertes ignorées par l'utilisateur
  archived?: boolean // Indique si le contact est archivé
  archiveDate?: Date // Date d'archivage du contact
  montantDevis?: number // Montant du devis en euros
}
