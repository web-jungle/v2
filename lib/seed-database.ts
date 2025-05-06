import { createServerSupabaseClient } from "./supabase";

// Données initiales pour les collaborateurs
const collaborateursInitiaux = [
  {
    id: "1",
    nom: "ARTES Damien",
    couleur: "#3174ad",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "2",
    nom: "BENAMARA Walid",
    couleur: "#e6550d",
    entreprise: "ORIZON TELECOM",
  },
  {
    id: "3",
    nom: "BELTRAN Noah",
    couleur: "#31a354",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "4",
    nom: "BERRAHMOUNE Abdelkader",
    couleur: "#756bb1",
    entreprise: "ORIZON INSTALLATION",
  },
  {
    id: "5",
    nom: "BLOT Alexia",
    couleur: "#636363",
    entreprise: "ORIZON TELECOM",
  },
  // Ajoutez d'autres collaborateurs selon vos besoins
];

// Données initiales pour les utilisateurs
const utilisateursInitiaux = [
  {
    id: "1",
    identifiant: "admin",
    mot_de_passe: "adminV66+",
    nom: "Administrateur",
    role: "admin",
    collaborateur_id: null,
    collaborateurs_geres: [],
  },
  {
    id: "2",
    identifiant: "manager",
    mot_de_passe: "managerV66+",
    nom: "Chef d'équipe",
    role: "manager",
    collaborateur_id: null,
    collaborateurs_geres: ["1", "2", "3"],
  },
  {
    id: "3",
    identifiant: "damien.artes",
    mot_de_passe: "damienV66+",
    nom: "ARTES Damien",
    role: "collaborateur",
    collaborateur_id: "1",
    collaborateurs_geres: [],
  },
  // Ajoutez d'autres utilisateurs selon vos besoins
];

// Fonction pour initialiser la base de données
export async function seedDatabase() {
  const supabase = createServerSupabaseClient();

  // Insérer les collaborateurs
  for (const collaborateur of collaborateursInitiaux) {
    const { error } = await supabase
      .from("collaborateurs")
      .upsert(collaborateur, { onConflict: "id" });

    if (error) {
      console.error("Erreur lors de l'insertion du collaborateur:", error);
    }
  }

  // Insérer les utilisateurs
  for (const utilisateur of utilisateursInitiaux) {
    const { error } = await supabase
      .from("utilisateurs")
      .upsert(utilisateur, { onConflict: "id" });

    if (error) {
      console.error("Erreur lors de l'insertion de l'utilisateur:", error);
    }
  }

  console.log("Base de données initialisée avec succès");
}
