"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { entreprises } from "@/lib/data";
import type { Salarie } from "@/lib/rh-types";
import { typeContrats } from "@/lib/rh-types";
import type { Collaborateur } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Extension du type Salarie pour inclure la propriété collaborateur
interface SalarieWithCollaborateur extends Salarie {
  collaborateur?: Collaborateur;
}

interface SalarieFormProps {
  isOpen: boolean;
  onClose: () => void;
  salarie: SalarieWithCollaborateur | null;
  onSave: (salarie: SalarieWithCollaborateur) => void;
}

export default function SalarieForm({
  isOpen,
  onClose,
  salarie,
  onSave,
}: SalarieFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [formData, setFormData] = useState<
    Omit<SalarieWithCollaborateur, "id"> & { collaborateurId?: string | null }
  >({
    nom: "",
    prenom: "",
    classification: "",
    dateEntree: new Date(),
    typeContrat: "CDI",
    dureeContrat: "",
    certifications: [],
    habilitations: [],
    entreprise: entreprises[0],
    poste: "",
    email: "",
    telephone: "",
    adresse: "",
    codePostal: "",
    ville: "",
    collaborateurId: null,
  });

  // Liste des certifications et habilitations possibles
  const certificationsList = [
    "Habilitation électrique",
    "CACES",
    "SST",
    "Travail en hauteur",
    "Amiante",
    "Fibre optique",
    "Permis B",
    "Permis C",
    "Permis CE",
  ];

  const habilitationsList = [
    "B1",
    "B2",
    "BR",
    "BC",
    "H0",
    "H1",
    "H2",
    "BE Mesurage",
    "BE Vérification",
    "BE Essai",
  ];

  // Classifications possibles
  const classifications = [
    "Employé",
    "Agent de maîtrise",
    "Cadre",
    "Cadre supérieur",
  ];

  // Récupérer la liste des collaborateurs
  useEffect(() => {
    const fetchCollaborateurs = async () => {
      try {
        const response = await fetch("/api/collaborateurs");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des collaborateurs");
        }
        const data = await response.json();
        setCollaborateurs(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des collaborateurs:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des collaborateurs.",
          variant: "destructive",
        });
      }
    };

    fetchCollaborateurs();
  }, [toast]);

  useEffect(() => {
    if (salarie) {
      setFormData({
        nom: salarie.nom || "",
        prenom: salarie.prenom || "",
        classification: salarie.classification || "",
        dateEntree: salarie.dateEntree || new Date(),
        typeContrat: salarie.typeContrat || "CDI",
        dureeContrat: salarie.dureeContrat || "",
        certifications: salarie.certifications || [],
        habilitations: salarie.habilitations || [],
        entreprise: salarie.entreprise || entreprises[0],
        poste: salarie.poste || "",
        email: salarie.email || "",
        telephone: salarie.telephone || "",
        adresse: salarie.adresse || "",
        codePostal: salarie.codePostal || "",
        ville: salarie.ville || "",
        dateNaissance: salarie.dateNaissance,
        numeroSecu: salarie.numeroSecu || "",
        collaborateurId: salarie.collaborateur?.id || null,
      });
    } else {
      // Réinitialiser le formulaire pour un nouveau salarié
      setFormData({
        nom: "",
        prenom: "",
        classification: "Employé",
        dateEntree: new Date(),
        typeContrat: "CDI",
        dureeContrat: "",
        certifications: [],
        habilitations: [],
        entreprise: entreprises[0],
        poste: "",
        email: "",
        telephone: "",
        adresse: "",
        codePostal: "",
        ville: "",
        collaborateurId: null,
      });
    }
  }, [salarie]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    if (name === "collaborateurId") {
      if (value && value !== "aucun") {
        // Rechercher le collaborateur correspondant
        const selectedCollaborateur = collaborateurs.find(
          (c) => c.id === value
        );
        if (selectedCollaborateur) {
          // Extraire le nom et prénom du collaborateur (format: "NOM Prénom")
          const fullName = selectedCollaborateur.nom;
          let prenom = "";
          let nom = fullName;

          // Essayer de séparer le nom et prénom
          const nameParts = fullName.split(" ");
          if (nameParts.length > 1) {
            // On suppose que le dernier mot est le prénom
            prenom = nameParts[nameParts.length - 1];
            // Les mots restants forment le nom
            nom = nameParts.slice(0, nameParts.length - 1).join(" ");
          }

          // Mettre à jour le formulaire avec le nom, prénom et entreprise du collaborateur
          setFormData((prev) => ({
            ...prev,
            collaborateurId: value,
            nom,
            prenom,
            entreprise: selectedCollaborateur.entreprise,
          }));
        }
      } else {
        // Réinitialiser juste le champ collaborateurId si "aucun" est sélectionné
        setFormData((prev) => ({
          ...prev,
          collaborateurId: null,
        }));
      }
    } else {
      // Comportement normal pour les autres champs
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: date }));
    }
  };

  const handleCertificationChange = (
    certification: string,
    checked: boolean
  ) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, certification],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        certifications: prev.certifications.filter((c) => c !== certification),
      }));
    }
  };

  const handleHabilitationChange = (habilitation: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        habilitations: [...prev.habilitations, habilitation],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        habilitations: prev.habilitations.filter((h) => h !== habilitation),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation de base
    if (!formData.nom || !formData.prenom || !formData.poste) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Générer un email si vide
    if (!formData.email) {
      const email = `${formData.prenom.toLowerCase()}.${formData.nom.toLowerCase()}@orizon-group.fr`;
      setFormData((prev) => ({ ...prev, email }));
    }

    // Créer le salarié
    const savedSalarie: SalarieWithCollaborateur = {
      id: salarie?.id || String(Date.now()),
      ...formData,
    };

    // Appel de l'API pour sauvegarder
    onSave(savedSalarie);
    setIsLoading(false);
  };

  // Afficher un feedback quand un collaborateur est sélectionné
  const renderCollaborateurInfo = () => {
    if (formData.collaborateurId && formData.collaborateurId !== "aucun") {
      const selectedCollaborateur = collaborateurs.find(
        (c) => c.id === formData.collaborateurId
      );
      if (selectedCollaborateur) {
        return (
          <div className="mt-1 text-sm text-blue-600">
            Associé à {selectedCollaborateur.nom} (
            {selectedCollaborateur.entreprise})
          </div>
        );
      }
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {salarie ? "Modifier le salarié" : "Ajouter un salarié"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  disabled={!!formData.collaborateurId}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  disabled={!!formData.collaborateurId}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collaborateurId">
                Associer à un collaborateur
              </Label>
              <Select
                value={formData.collaborateurId || "aucun"}
                onValueChange={(value) =>
                  handleSelectChange(
                    "collaborateurId",
                    value === "aucun" ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un collaborateur (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucun">Aucun collaborateur</SelectItem>
                  {collaborateurs.map((collaborateur) => (
                    <SelectItem key={collaborateur.id} value={collaborateur.id}>
                      {collaborateur.nom} - {collaborateur.entreprise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {renderCollaborateurInfo()}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entreprise">Entreprise *</Label>
                <Select
                  value={formData.entreprise}
                  onValueChange={(value) =>
                    handleSelectChange("entreprise", value)
                  }
                  required
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
              <div className="space-y-2">
                <Label htmlFor="poste">Poste *</Label>
                <Input
                  id="poste"
                  name="poste"
                  value={formData.poste}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classification">Classification *</Label>
                <Select
                  value={formData.classification}
                  onValueChange={(value) =>
                    handleSelectChange("classification", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {classifications.map((classification) => (
                      <SelectItem key={classification} value={classification}>
                        {classification}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEntree">Date d'entrée *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateEntree && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateEntree ? (
                        format(formData.dateEntree, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateEntree}
                      onSelect={(date) => handleDateChange("dateEntree", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeContrat">Type de contrat *</Label>
                <Select
                  value={formData.typeContrat}
                  onValueChange={(value) =>
                    handleSelectChange("typeContrat", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeContrats.map((contrat) => (
                      <SelectItem key={contrat} value={contrat}>
                        {contrat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.typeContrat !== "CDI" && (
                <div className="space-y-2">
                  <Label htmlFor="dureeContrat">Durée du contrat</Label>
                  <Input
                    id="dureeContrat"
                    name="dureeContrat"
                    value={formData.dureeContrat}
                    onChange={handleChange}
                    placeholder="Ex: 12 mois"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {certificationsList.map((certification) => (
                  <div
                    key={certification}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`certification-${certification}`}
                      checked={formData.certifications.includes(certification)}
                      onCheckedChange={(checked) =>
                        handleCertificationChange(
                          certification,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`certification-${certification}`}
                      className="font-normal"
                    >
                      {certification}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Habilitations</Label>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {habilitationsList.map((habilitation) => (
                  <div
                    key={habilitation}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`habilitation-${habilitation}`}
                      checked={formData.habilitations.includes(habilitation)}
                      onCheckedChange={(checked) =>
                        handleHabilitationChange(
                          habilitation,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`habilitation-${habilitation}`}
                      className="font-normal"
                    >
                      {habilitation}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codePostal">Code postal</Label>
                <Input
                  id="codePostal"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateNaissance">Date de naissance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateNaissance && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateNaissance ? (
                        format(formData.dateNaissance, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateNaissance}
                      onSelect={(date) =>
                        handleDateChange("dateNaissance", date)
                      }
                      initialFocus
                      fromYear={1950}
                      toYear={2005}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroSecu">Numéro de sécurité sociale</Label>
                <Input
                  id="numeroSecu"
                  name="numeroSecu"
                  value={formData.numeroSecu}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
