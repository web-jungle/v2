import type { Contact } from "./crm-types"

/**
 * Vérifie si un contact est inactif depuis un certain nombre de jours
 * @param contact Le contact à vérifier
 * @param days Le nombre de jours d'inactivité à vérifier
 * @returns true si le contact est inactif depuis le nombre de jours spécifié
 */
export function isContactInactive(contact: Contact, days = 5): boolean {
  const now = new Date()
  const creationDate = new Date(contact.dateCreation)
  const lastModifiedDate = new Date(contact.dateDerniereModification)

  // Calculer la différence en jours entre maintenant et la date de création
  const daysSinceCreation = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24))

  // Vérifier si la dernière modification est la même que la date de création
  const noActivitySinceCreation = lastModifiedDate.getTime() === creationDate.getTime()

  // Le contact est inactif s'il a été créé il y a au moins X jours et n'a pas été modifié depuis
  return daysSinceCreation >= days && noActivitySinceCreation
}

/**
 * Calcule le nombre de jours depuis la dernière activité sur un contact
 * @param contact Le contact à vérifier
 * @returns Le nombre de jours depuis la dernière activité
 */
export function daysSinceLastActivity(contact: Contact): number {
  const now = new Date()
  const lastModifiedDate = new Date(contact.dateDerniereModification)

  return Math.floor((now.getTime() - lastModifiedDate.getTime()) / (1000 * 60 * 60 * 24))
}
