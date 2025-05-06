// Fonction pour calculer la distance entre deux points géographiques (formule de Haversine)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance // Distance en kilomètres
}

// Convertir degrés en radians
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

// Coordonnées du siège social
export const SIEGE_SOCIAL = {
  latitude: 42.7743,
  longitude: 2.9265,
  address: "7 avenue alfred sauvy, 66600 Rivesaltes, France",
}

// Déterminer la zone de trajet en fonction de la distance
export function determineZoneTrajet(distance: number): string {
  if (distance <= 5) return "1A"
  if (distance <= 10) return "1B"
  if (distance <= 20) return "2"
  if (distance <= 30) return "3"
  if (distance <= 40) return "4"
  if (distance <= 50) return "5"
  if (distance <= 55) return "6"
  if (distance <= 60) return "7"
  if (distance <= 70) return "8"
  if (distance <= 80) return "9"
  if (distance <= 90) return "10"
  if (distance <= 100) return "11"
  if (distance <= 120) return "12"
  if (distance <= 130) return "13"
  if (distance <= 140) return "14"
  if (distance <= 150) return "15"
  return "" // Au-delà de 150 km, pas de zone applicable
}
