import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Formater une date en format français
export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr })
  } catch (error) {
    return "Date invalide"
  }
}

// Obtenir la couleur de fond en fonction du statut
export function getStatusColor(status: string): string {
  switch (status) {
    case "Actif":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "En attente":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "Expiré":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "Résilié":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

// Vérifier si un contrat est proche de l'expiration (moins de 30 jours)
export function isNearExpiration(dateEcheance: string): boolean {
  const today = new Date()
  const echeance = new Date(dateEcheance)
  const diffTime = echeance.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 30 && diffDays > 0
}

// Vérifier si un contrat est expiré
export function isExpired(dateEcheance: string): boolean {
  const today = new Date()
  const echeance = new Date(dateEcheance)
  return echeance < today
}
