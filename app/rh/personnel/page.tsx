"use client";

import ExportRHExcel from "@/components/rh/export-rh-excel";
import ImportCSV from "@/components/rh/import-csv";
import SalarieDetails from "@/components/rh/salarie-details";
import SalarieForm from "@/components/rh/salarie-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type { Salarie } from "@/lib/rh-types";
import { Collaborateur } from "@/lib/types";
import {
  ArrowLeft,
  FileText,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Étendre le type Salarie pour inclure le collaborateur
interface SalarieWithCollaborateur extends Salarie {
  collaborateur?: Collaborateur;
}

// Fonction utilitaire pour formater les dates en toute sécurité
const formatDate = (date: any) => {
  if (!date) return "Non définie";

  try {
    // Vérifier si la date est une chaîne ISO ou un objet Date
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) return "Date invalide";

    // Formater la date au format français
    return dateObj.toLocaleDateString("fr-FR");
  } catch (error) {
    console.error("Erreur de formatage de date:", error);
    return "Date invalide";
  }
};

export default function PersonnelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [salaries, setSalaries] = useState<SalarieWithCollaborateur[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentSalarie, setCurrentSalarie] =
    useState<SalarieWithCollaborateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntreprise, setFilterEntreprise] = useState<string | null>(null);

  // Fonction utilitaire pour gérer les états de chargement spécifiques
  const setActionLoading = (action: string, id: string, isLoading: boolean) => {
    setLoadingActions((prev) => ({
      ...prev,
      [`${action}_${id}`]: isLoading,
    }));
  };

  const isActionLoading = (action: string, id: string) => {
    return loadingActions[`${action}_${id}`] || false;
  };

  // Vérifier si l'utilisateur est admin ou manager

  // Charger les salariés depuis l'API
  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/salaries");

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des salariés");
        }

        const data = await response.json();

        // Traiter les données pour assurer que le nom est correctement formaté
        // et que les dates sont correctement parsées
        const processedData = data.map((salarie: Salarie) => {
          // Convertir les chaînes de date en objets Date
          const processedSalarie = {
            ...salarie,
            dateEntree: salarie.dateEntree
              ? new Date(salarie.dateEntree)
              : new Date(),
            dateNaissance: salarie.dateNaissance
              ? new Date(salarie.dateNaissance)
              : undefined,
          };

          // Si le salarié a un collaborateur associé, utiliser son nom
          if (salarie.collaborateur) {
            return {
              ...processedSalarie,
              nom: salarie.collaborateur.nom,
              prenom: "", // Vider le prénom car il est déjà inclus dans le nom du collaborateur
            };
          }
          return processedSalarie;
        });

        setSalaries(processedData);
        console.log(processedData);
      } catch (error) {
        console.error("Erreur lors du chargement des salariés:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les salariés.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSalaries();
    }
  }, [user, toast]);

  // Filtrer les salariés
  const filteredSalaries = salaries.filter((salarie) => {
    const matchesSearch =
      searchTerm === "" ||
      salarie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie.poste.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEntreprise =
      filterEntreprise === null || salarie.entreprise === filterEntreprise;

    return matchesSearch && matchesEntreprise;
  });

  // Gérer l'ajout d'un salarié
  const handleAddSalarie = () => {
    setCurrentSalarie(null);
    setIsFormOpen(true);
  };

  // Gérer la suppression d'un salarié
  const handleDeleteSalarie = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce salarié ?")) {
      return;
    }

    try {
      setActionLoading("delete", id, true);
      const response = await fetch(`/api/salaries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            "Une erreur est survenue lors de la suppression du salarié"
        );
      }

      // Mettre à jour le state local en supprimant le salarié
      setSalaries((prevSalaries) =>
        prevSalaries.filter((salarie) => salarie.id !== id)
      );

      toast({
        title: "Succès",
        description: "Salarié supprimé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du salarié:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer le salarié.",
        variant: "destructive",
      });
    } finally {
      setActionLoading("delete", id, false);
    }
  };

  // Gérer l'affichage des détails d'un salarié
  const handleViewSalarie = (salarie: Salarie) => {
    setCurrentSalarie(salarie);
    setIsDetailsOpen(true);
  };

  // Gérer la modification d'un salarié
  const handleEditSalarie = (salarie: Salarie) => {
    setCurrentSalarie(salarie);
    setIsFormOpen(true);
  };

  // Fonction qui sauvegarde une fiche de poste
  const handleSaveSalarie = async (salarie: SalarieWithCollaborateur) => {
    try {
      console.log("==== DÉBUT SAUVEGARDE SALARIÉ ====");
      console.log("Données du salarié:", salarie);
      console.log("ID du salarié:", salarie.id);
      console.log("ID du collaborateur:", salarie.collaborateur?.id);
      console.log("Nom:", salarie.nom);
      console.log("Prénom:", salarie.prenom);

      // Vérifier que les données essentielles sont présentes
      if (!salarie.nom || !salarie.prenom) {
        toast({
          title: "Données manquantes",
          description: "Le nom et le prénom sont obligatoires",
          variant: "destructive",
        });
        return;
      }

      const ficheId = salarie.id;
      setActionLoading("save", ficheId, true);
      let response;

      // Préparer les données pour la fiche de poste
      const ficheDePosteData = {
        id: salarie.id,
        classification: salarie.classification,
        poste: salarie.poste,
        entreprise: salarie.entreprise,
        typeContrat: salarie.typeContrat,
        dureeContrat: salarie.dureeContrat,
        certifications: salarie.certifications || [],
        habilitations: salarie.habilitations || [],
        competencesRequises: [], // Champ obligatoire pour FicheDePoste
        description: `Fiche de poste pour ${salarie.nom} ${salarie.prenom}`,
        missions: [], // Champ obligatoire pour FicheDePoste
        dateCreation: new Date(),
        dateModification: new Date(),
        estActive: true,
        collaborateurId: salarie.collaborateur?.id || undefined,
        // Autres champs optionnels
        experience: undefined,
        formation: undefined,
        remuneration: undefined,
        avantages: undefined,
        horaires: undefined,
        lieuTravail: undefined,
      };

      const bodyData = {
        ...ficheDePosteData,
        nom: salarie.nom,
        prenom: salarie.prenom,
        email: salarie.email,
        telephone: salarie.telephone,
        adresse: salarie.adresse,
        codePostal: salarie.codePostal,
        ville: salarie.ville,
        dateNaissance: salarie.dateNaissance,
        numeroSecu: salarie.numeroSecu,
        dateEntree: salarie.dateEntree,
      };

      console.log("Données à envoyer:", JSON.stringify(bodyData, null, 2));
      console.log("Téléphone à envoyer:", salarie.telephone);

      // Vérifier si c'est une nouvelle fiche ou une mise à jour
      // Un ID existant dans la base de données ne commencera pas par un nombre (comme Date.now())
      const isNewFiche =
        !salarie.id ||
        /^\d+$/.test(salarie.id) ||
        salarie.id.startsWith("temp_");

      if (!isNewFiche) {
        // Mise à jour d'une fiche existante
        console.log("Mise à jour d'une fiche de poste existante");

        const endpoint = `/api/salaries/${salarie.id}`;
        console.log("Endpoint utilisé:", endpoint);

        try {
          response = await fetch(endpoint, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
          });

          console.log("Réponse reçue - statut:", response.status);
          console.log("Réponse reçue - ok:", response.ok);

          // Essayer de lire le corps brut de la réponse
          const rawResponse = await response.text();
          console.log("Réponse brute:", rawResponse);

          // Convertir en JSON si possible
          try {
            const jsonResponse = JSON.parse(rawResponse);
            console.log("Réponse JSON parsée:", jsonResponse);

            if (!response.ok) {
              throw new Error(
                jsonResponse.error ||
                  `Erreur HTTP: ${response.status} - ${response.statusText}`
              );
            }

            // Utilisez jsonResponse au lieu de faire un autre await response.json()
            return jsonResponse;
          } catch (parseError) {
            console.error("Erreur de parsing JSON:", parseError);
            if (!response.ok) {
              throw new Error(
                `Erreur HTTP: ${response.status} - ${response.statusText}`
              );
            }
          }
        } catch (fetchError) {
          console.error("Erreur fetch détaillée:", fetchError);
          throw fetchError;
        }
      } else {
        // Création d'une nouvelle fiche de poste
        console.log("Création d'une nouvelle fiche de poste");

        response = await fetch("/api/salaries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...ficheDePosteData,
            nom: salarie.nom,
            prenom: salarie.prenom,
            email: salarie.email,
            telephone: salarie.telephone,
            adresse: salarie.adresse,
            codePostal: salarie.codePostal,
            ville: salarie.ville,
            dateNaissance: salarie.dateNaissance,
            numeroSecu: salarie.numeroSecu,
            dateEntree: salarie.dateEntree,
          }),
        });

        console.log("Réponse reçue", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erreur API:", errorData);
          throw new Error(
            errorData.error ||
              "Une erreur est survenue lors de la création de la fiche de poste"
          );
        }
      }

      const savedFiche = await response.json();
      console.log("Fiche de poste sauvegardée:", savedFiche);
      console.log(
        "ID Collaborateur associé à la fiche:",
        savedFiche.collaborateurId
      );
      console.log("Objet Collaborateur:", savedFiche.collaborateur);

      // Vérifier que les données essentielles sont bien présentes dans la réponse
      if (!savedFiche.nom || !savedFiche.prenom) {
        console.warn(
          "Attention: Nom ou prénom manquant dans la réponse de l'API"
        );
        // On conserve les valeurs d'origine
        savedFiche.nom = salarie.nom;
        savedFiche.prenom = salarie.prenom;
      }

      // Adapter le format de la réponse pour correspondre à ce qu'attend l'interface
      const processedFiche: SalarieWithCollaborateur = {
        ...savedFiche,
        nom: savedFiche.nom || salarie.nom, // Utiliser les données d'origine si manquantes
        prenom: savedFiche.prenom || salarie.prenom, // Utiliser les données d'origine si manquantes
        dateEntree:
          savedFiche.dateEntree || savedFiche.dateCreation
            ? new Date(savedFiche.dateEntree || savedFiche.dateCreation)
            : new Date(),
        dateNaissance: savedFiche.dateNaissance
          ? new Date(savedFiche.dateNaissance)
          : undefined,
      };

      // Rafraîchir la liste des fiches en mettant à jour le state local
      setSalaries((prevSalaries) => {
        // Vérifier si c'est une mise à jour ou un ajout
        const existingIndex = prevSalaries.findIndex(
          (s) => s.id === processedFiche.id
        );

        if (existingIndex >= 0) {
          // Mise à jour d'une fiche existante
          const updatedSalaries = [...prevSalaries];
          updatedSalaries[existingIndex] = processedFiche;
          return updatedSalaries;
        } else {
          // Ajout d'une nouvelle fiche
          return [...prevSalaries, processedFiche];
        }
      });

      setIsFormOpen(false);
      setCurrentSalarie(null);

      toast({
        title: "Succès",
        description: `Fiche de poste ${
          salarie.id && !salarie.id.startsWith("temp_") ? "modifiée" : "ajoutée"
        } avec succès.`,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde de la fiche de poste:",
        error
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de sauvegarder la fiche de poste.",
        variant: "destructive",
      });
    } finally {
      setActionLoading("save", salarie.id || "new", false);
    }
  };

  // Gérer l'importation de salariés
  const handleImportSalaries = async (
    importedSalaries: SalarieWithCollaborateur[]
  ) => {
    try {
      setIsLoading(true);
      toast({
        title: "Importation en cours",
        description: `Importation de ${importedSalaries.length} salariés...`,
      });

      const createdSalaries: SalarieWithCollaborateur[] = [];
      const errors: string[] = [];

      // Créer chaque salarié via l'API
      for (let i = 0; i < importedSalaries.length; i++) {
        const salarieData = importedSalaries[i];
        try {
          const response = await fetch("/api/salaries", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(salarieData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Erreur lors de l'importation");
          }

          const newSalarie = await response.json();

          // Traiter les dates du salarié importé
          const processedSalarie: SalarieWithCollaborateur = {
            ...newSalarie,
            dateEntree: newSalarie.dateEntree
              ? new Date(newSalarie.dateEntree)
              : new Date(),
            dateNaissance: newSalarie.dateNaissance
              ? new Date(newSalarie.dateNaissance)
              : undefined,
          };

          createdSalaries.push(processedSalarie);

          // Mise à jour progressive du state pour montrer l'avancement
          if (i % 5 === 0 || i === importedSalaries.length - 1) {
            // Mettre à jour le toast tous les 5 imports ou à la fin
            toast({
              title: "Importation en cours",
              description: `Progression: ${i + 1}/${
                importedSalaries.length
              } salariés importés`,
            });
          }
        } catch (error) {
          console.error(
            `Erreur lors de l'importation du salarié ${salarieData.nom} ${salarieData.prenom}:`,
            error
          );
          errors.push(
            `${salarieData.nom} ${salarieData.prenom}: ${
              error instanceof Error ? error.message : "Erreur inconnue"
            }`
          );
        }
      }

      // Mettre à jour la liste des salariés en une seule opération
      setSalaries((prevSalaries) => [...prevSalaries, ...createdSalaries]);

      // Afficher le résultat final
      if (errors.length > 0) {
        toast({
          title: `Importation partielle - ${createdSalaries.length} salariés importés avec ${errors.length} erreurs`,
          description:
            errors.length > 3
              ? `${errors.slice(0, 3).join("\n")}... et ${
                  errors.length - 3
                } autres erreurs`
              : errors.join("\n"),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Importation réussie",
          description: `${createdSalaries.length} salariés ont été importés avec succès.`,
        });
      }

      // Fermer la fenêtre d'importation
      setIsImportOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'importation des salariés:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer les salariés.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir la liste des entreprises uniques
  const entreprises = Array.from(new Set(salaries.map((s) => s.entreprise)));

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return null;
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/rh")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Button>
          <h1 className="text-3xl font-bold">Gestion du Personnel</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            Importer CSV
          </Button>
          <ExportRHExcel salaries={filteredSalaries} />
          <Button
            onClick={handleAddSalarie}
            className="bg-green-500 hover:bg-green-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un salarié
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtres:</span>
        </div>

        <select
          className="border rounded-md px-3 py-2 bg-background"
          value={filterEntreprise || ""}
          onChange={(e) => setFilterEntreprise(e.target.value || null)}
        >
          <option value="">Toutes les entreprises</option>
          {entreprises.map((entreprise) => (
            <option key={entreprise} value={entreprise}>
              {entreprise}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des salariés</CardTitle>
          <CardDescription>
            {filteredSalaries.length} salarié
            {filteredSalaries.length > 1 ? "s" : ""} trouvé
            {filteredSalaries.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom Complet</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Type de contrat</TableHead>
                  <TableHead>Date d'entrée</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalaries.length > 0 ? (
                  filteredSalaries.map((salarie) => (
                    <TableRow key={salarie.id}>
                      <TableCell className="font-medium">
                        {salarie.nom} {salarie.prenom}
                      </TableCell>
                      <TableCell>{salarie.poste}</TableCell>
                      <TableCell>{salarie.entreprise}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {salarie.classification}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            salarie.typeContrat === "CDI"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            salarie.typeContrat === "CDI" ? "bg-green-500" : ""
                          }
                        >
                          {salarie.typeContrat}
                          {salarie.dureeContrat
                            ? ` (${salarie.dureeContrat})`
                            : ""}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(salarie.dateEntree)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSalarie(salarie)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSalarie(salarie)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSalarie(salarie.id)}
                          disabled={isActionLoading("delete", salarie.id)}
                        >
                          {isActionLoading("delete", salarie.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Aucun salarié trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/modification de salarié */}
      <SalarieForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        salarie={currentSalarie}
        onSave={handleSaveSalarie}
      />

      {/* Détails du salarié */}
      <SalarieDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        salarie={currentSalarie}
        onEdit={(salarie) => {
          setIsDetailsOpen(false);
          setTimeout(() => handleEditSalarie(salarie), 100);
        }}
      />

      {/* Importation CSV */}
      <ImportCSV
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportSalaries}
        existingSalaries={salaries}
      />
    </div>
  );
}
