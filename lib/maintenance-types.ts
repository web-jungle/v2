export interface ContratMaintenance {
  id: string
  client: string
  reference: string
  type: string
  montant: number
  dateDebut: string
  dateEcheance: string
  statut: "En attente" | "Actif" | "Expiré" | "Résilié"
  description: string
  contactClient: string
  emailContact: string
  telephoneContact: string
  notes: string
  dateCreation: string
  dateDerniereModification?: string
}
