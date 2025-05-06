export type StatutConge = "En attente" | "Approuvé" | "Refusé"
export type TypeConge = "Congés payés" | "RTT" | "Congé sans solde" | "Maladie" | "Autre"

export interface DemandeConge {
  id: string
  utilisateurId: string
  collaborateurId: string
  collaborateurNom: string
  dateDebut: Date
  dateFin: Date
  typeConge: TypeConge
  motif: string
  statut: StatutConge
  commentaireAdmin?: string
  dateCreation: Date
  dateModification: Date
  notificationLue: boolean
}

export interface Notification {
  id: string
  utilisateurId: string
  message: string
  lien: string
  dateCreation: Date
  lue: boolean
  type: "conge" | "system" | "autre"
  demandeId?: string
}

export interface StatistiquesConges {
  totalDemandes: number
  enAttente: number
  approuvees: number
  refusees: number
  parType: Record<TypeConge, number>
  parMois: Record<string, number> // Format: "YYYY-MM": count
}
