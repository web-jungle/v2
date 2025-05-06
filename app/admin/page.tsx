"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Pencil, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const { user } = useAuth();

  const router = useRouter();
  const { toast } = useToast();
  const [comptes, setComptes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCompte, setCurrentCompte] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allCollaborateurs, setAllCollaborateurs] = useState([]);

  // Formulaire
  const [formData, setFormData] = useState({
    identifiant: "",
    mot_de_passe: "",
    role: "collaborateur",
    collaborateur_id: null,
    collaborateursGeres: [],
  });

  const fetchCollaborateurs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/collaborateurs");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des collaborateurs");
      }
      const data = await response.json();
      setAllCollaborateurs(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les collaborateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComptes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/comptes");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des comptes");
      }
      const data = await response.json();
      setComptes(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les comptes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborateurs();
    fetchComptes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    const finalValue = value === "" ? null : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleAddCompte = () => {
    setCurrentCompte(null);
    setFormData({
      identifiant: "",
      mot_de_passe: "",
      role: "collaborateur",
      collaborateur_id: null,
      collaborateursGeres: [],
    });
    setIsDialogOpen(true);
  };

  const handleEditCompte = (compte: any) => {
    setCurrentCompte(compte);

    // S'assurer que collaborateursGeres est un tableau d'IDs simples
    const collaborateursGeresIds = compte.collaborateursGeres
      ? compte.collaborateursGeres.map((collab) => collab.id)
      : [];

    setFormData({
      identifiant: compte.identifiant,
      mot_de_passe: "", // Ne pas pré-remplir le mot de passe
      role: compte.role,
      collaborateur_id: compte.collaborateurId,
      collaborateursGeres: collaborateursGeresIds,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCompte = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/comptes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }

      await fetchComptes(); // Recharger les comptes
      toast({
        title: "Compte supprimé",
        description: "Le compte a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur de suppression",
        description: error.message || "Impossible de supprimer le compte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollaborateurGereChange = (
    collaborateurId: string,
    checked: boolean
  ) => {
    setFormData((prev: any) => {
      // S'assurer que collaborateursGeres est un tableau
      const currentCollaborateursGeres = Array.isArray(prev.collaborateursGeres)
        ? [...prev.collaborateursGeres]
        : [];

      if (checked) {
        // Ajouter l'ID s'il n'existe pas déjà
        if (!currentCollaborateursGeres.includes(collaborateurId)) {
          return {
            ...prev,
            collaborateursGeres: [
              ...currentCollaborateursGeres,
              collaborateurId,
            ],
          };
        }
      } else {
        // Supprimer l'ID
        return {
          ...prev,
          collaborateursGeres: currentCollaborateursGeres.filter(
            (id) => id !== collaborateurId
          ),
        };
      }

      // Retourner le même état si aucun changement
      return prev;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSend = { ...formData };
    if (currentCompte && !formData.mot_de_passe) {
      delete dataToSend.mot_de_passe;
    }

    try {
      let response;
      let resultData;

      if (currentCompte) {
        // Mise à jour
        response = await fetch(`/api/admin/comptes/${currentCompte.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
      } else {
        // Création
        if (!formData.mot_de_passe) {
          toast({
            title: "Erreur",
            description: "Le mot de passe est requis pour créer un compte.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!formData.collaborateur_id) {
          toast({
            title: "Erreur",
            description:
              "Veuillez sélectionner un collaborateur pour ce compte.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        response = await fetch("/api/admin/comptes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
      }

      resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.message || "Erreur lors de l'opération");
      }

      toast({
        title: currentCompte ? "Compte mis à jour" : "Compte créé",
        description: currentCompte
          ? "Les informations du compte ont été mises à jour."
          : "Le nouveau compte a été créé avec succès.",
      });

      setIsDialogOpen(false);
      await fetchComptes();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        title: "Erreur de soumission",
        description:
          error.message || "Impossible de soumettre les informations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  // Filtrer pour n'obtenir que les collaborateurs sans compte
  const collaborateursSansCompte = allCollaborateurs.filter(
    (collab) => !collab.aCompte
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administration</h1>
        <Button onClick={handleAddCompte}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un compte
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des comptes utilisateurs</CardTitle>
          <CardDescription>
            Gérez les comptes et leurs droits d'accès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identifiant</TableHead>
                <TableHead>Collaborateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Collaborateurs gérés</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comptes.map((compte) => (
                <TableRow key={compte.id}>
                  <TableCell>{compte.identifiant}</TableCell>
                  <TableCell>
                    {compte.collaborateur?.nom || "-"}
                    {compte.collaborateur && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({compte.collaborateur.entreprise})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {compte.role === "admin"
                      ? "Administrateur"
                      : compte.role === "manager"
                      ? "Manager"
                      : "Collaborateur"}
                  </TableCell>
                  <TableCell>
                    {compte.role === "manager" &&
                    compte.collaborateursGeres &&
                    compte.collaborateursGeres.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {compte.collaborateursGeres.map((collab) => (
                          <Badge
                            key={collab.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {collab.nom}
                          </Badge>
                        ))}
                      </div>
                    ) : compte.role === "manager" ? (
                      "Aucun collaborateur géré"
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCompte(compte)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCompte(compte.id)}
                      disabled={
                        compte.role === "admin" &&
                        comptes.filter((c) => c.role === "admin").length <= 1
                      }
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentCompte ? "Modifier le compte" : "Ajouter un compte"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="collaborateur_id" className="text-right">
                  Collaborateur
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.collaborateur_id || ""}
                    onValueChange={(value) =>
                      handleSelectChange("collaborateur_id", value)
                    }
                    disabled={currentCompte !== null} // Désactiver si on modifie un compte existant
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un collaborateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborateursSansCompte.map((collaborateur) => (
                        <SelectItem
                          key={collaborateur.id}
                          value={collaborateur.id}
                        >
                          {collaborateur.nom} ({collaborateur.entreprise})
                        </SelectItem>
                      ))}
                      {currentCompte && (
                        <SelectItem value={currentCompte.collaborateurId}>
                          {currentCompte.collaborateur?.nom ||
                            "Collaborateur actuel"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="identifiant" className="text-right">
                  Identifiant
                </Label>
                <Input
                  id="identifiant"
                  name="identifiant"
                  value={formData.identifiant}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mot_de_passe" className="text-right">
                  Mot de passe
                </Label>
                <Input
                  id="mot_de_passe"
                  name="mot_de_passe"
                  type="password"
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  className="col-span-3"
                  required={!currentCompte}
                  placeholder={
                    currentCompte ? "Laisser vide pour ne pas modifier" : ""
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Rôle
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="collaborateur">
                        Collaborateur
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.role === "manager" && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label
                    htmlFor="collaborateursGeres"
                    className="text-right pt-2"
                  >
                    Collaborateurs gérés
                  </Label>
                  <div className="col-span-3 border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                    {allCollaborateurs.map((collaborateur) => (
                      <div
                        key={collaborateur.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`collab-${collaborateur.id}`}
                          checked={(
                            formData.collaborateursGeres || []
                          ).includes(collaborateur.id)}
                          onCheckedChange={(checked) =>
                            handleCollaborateurGereChange(
                              collaborateur.id,
                              checked
                            )
                          }
                        />
                        <Label
                          htmlFor={`collab-${collaborateur.id}`}
                          className="font-normal"
                        >
                          {collaborateur.nom} ({collaborateur.entreprise})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
