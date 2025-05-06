import type { Salarie } from "./rh-types"
import { collaborateurs } from "./data"

// Générer des données de salariés basées sur les collaborateurs existants
export const salariesInitiaux: Salarie[] = collaborateurs.map((collaborateur, index) => {
  const [prenom, nom] = collaborateur.nom.split(" ")
  const dateEntree = new Date()
  dateEntree.setMonth(dateEntree.getMonth() - Math.floor(Math.random() * 36)) // Date d'entrée aléatoire dans les 3 dernières années

  const typeContrats = ["CDI", "CDD", "Alternance", "Stage", "Intérim", "Autre"] as const
  const classifications = ["Employé", "Agent de maîtrise", "Cadre", "Cadre supérieur"]
  const certifications = ["Habilitation électrique", "CACES", "SST", "Travail en hauteur", "Amiante", "Fibre optique"]
  const habilitations = ["B1", "B2", "BR", "BC", "H0", "H1", "H2"]

  // Sélectionner aléatoirement des certifications et habilitations
  const selectedCertifications = certifications
    .filter(() => Math.random() > 0.7)
    .slice(0, Math.floor(Math.random() * 3))
  const selectedHabilitations = habilitations.filter(() => Math.random() > 0.6).slice(0, Math.floor(Math.random() * 4))

  return {
    id: collaborateur.id,
    nom: nom || collaborateur.nom,
    prenom: prenom || "",
    classification: classifications[Math.floor(Math.random() * classifications.length)],
    dateEntree,
    typeContrat: typeContrats[Math.floor(Math.random() * 3)] as any, // Principalement CDI, CDD ou Alternance
    dureeContrat: Math.random() > 0.7 ? `${Math.floor(Math.random() * 24) + 6} mois` : undefined,
    certifications: selectedCertifications,
    habilitations: selectedHabilitations,
    entreprise: collaborateur.entreprise,
    poste: ["Technicien", "Chef d'équipe", "Responsable", "Assistant", "Directeur"][Math.floor(Math.random() * 5)],
    email: `${prenom?.toLowerCase() || "contact"}.${nom?.toLowerCase() || "orizon"}@orizon-group.fr`,
    telephone: `0${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 90) + 10} ${
      Math.floor(Math.random() * 90) + 10
    } ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
  }
})
