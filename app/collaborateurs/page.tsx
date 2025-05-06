"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Collaborateur } from "@/lib/types";
import { entreprises } from "@/lib/types";
import { Pencil, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CollaborateursPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCollaborateur, setCurrentCollaborateur] =
    useState<Collaborateur | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState<
    Omit<Collaborateur, "id" | "created_at">
  >({
    nom: "",
    couleur: "#3174ad",
    entreprise: entreprises[0],
  });

  // Vérifier si l'utilisateur est admin ou manager

  // Charger les collaborateurs
  useEffect(() => {
    const fetchCollaborateurs = async () => {
      try {
        const response = await fetch("/api/collaborateurs");

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session expirée",
              description: "Veuillez vous reconnecter",
              variant: "destructive",
            });
            router.push("/login");
            return;
          }
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setCollaborateurs(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des collaborateurs:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les collaborateurs.",
          variant: "destructive",
        });
      }
    };

    if (user) {
      fetchCollaborateurs();
    }
  }, [user, toast, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCollaborateur = () => {
    setCurrentCollaborateur(null);
    setFormData({
      nom: "",
      couleur: "#3174ad",
      entreprise: entreprises[0],
    });
    setIsDialogOpen(true);
  };

  const handleEditCollaborateur = (collaborateur: Collaborateur) => {
    setCurrentCollaborateur(collaborateur);
    setFormData({
      nom: collaborateur.nom,
      couleur: collaborateur.couleur,
      entreprise: collaborateur.entreprise,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCollaborateur = async (id: string) => {
    try {
      const response = await fetch(`/api/collaborateurs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter",
            variant: "destructive",
          });
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      setCollaborateurs(collaborateurs.filter((c) => c.id !== id));
      toast({
        title: "Collaborateur supprimé",
        description: "Le collaborateur a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du collaborateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le collaborateur.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (currentCollaborateur) {
        // Mise à jour
        const response = await fetch(
          `/api/collaborateurs/${currentCollaborateur.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session expirée",
              description: "Veuillez vous reconnecter",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const updatedCollaborateur = await response.json();
        setCollaborateurs(
          collaborateurs.map((c) =>
            c.id === currentCollaborateur.id ? updatedCollaborateur : c
          )
        );
        toast({
          title: "Collaborateur mis à jour",
          description:
            "Les informations du collaborateur ont été mises à jour.",
        });
      } else {
        // Création
        const response = await fetch("/api/collaborateurs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Session expirée",
              description: "Veuillez vous reconnecter",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const newCollaborateur = await response.json();
        setCollaborateurs([...collaborateurs, newCollaborateur]);
        toast({
          title: "Collaborateur créé",
          description: "Le nouveau collaborateur a été créé avec succès.",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du collaborateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le collaborateur.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des collaborateurs</h1>
        <Button onClick={handleAddCollaborateur}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un collaborateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des collaborateurs</CardTitle>
          <CardDescription>
            Gérez les collaborateurs pour le planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborateurs.map((collaborateur) => (
                <TableRow key={collaborateur.id}>
                  <TableCell>{collaborateur.nom}</TableCell>
                  <TableCell>{collaborateur.entreprise}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: collaborateur.couleur }}
                      ></div>
                      {collaborateur.couleur}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCollaborateur(collaborateur)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDeleteCollaborateur(collaborateur.id)
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
              {currentCollaborateur
                ? "Modifier le collaborateur"
                : "Ajouter un collaborateur"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">
                  Nom
                </Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entreprise" className="text-right">
                  Entreprise
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.entreprise}
                    onValueChange={(value) =>
                      handleSelectChange("entreprise", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {entreprises.map((entreprise) => (
                        <SelectItem key={entreprise} value={entreprise}>
                          {entreprise}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="couleur" className="text-right">
                  Couleur
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="couleur"
                    name="couleur"
                    type="color"
                    value={formData.couleur}
                    onChange={handleChange}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    name="couleur"
                    value={formData.couleur}
                    onChange={handleChange}
                    className="flex-1"
                  />
                </div>
              </div>
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
