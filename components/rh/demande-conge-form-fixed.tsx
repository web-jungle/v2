"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type { DemandeConge, TypeConge } from "@/lib/conges-types";
import { differenceInCalendarDays, format } from "date-fns";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DemandeCongeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (demande: DemandeConge) => void;
  demande?: DemandeConge | null;
}

export default function DemandeCongeFormFixed({
  isOpen,
  onClose,
  onSave,
  demande,
}: DemandeCongeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const [dateDebut, setDateDebut] = useState<Date | undefined>(undefined);
  const [dateFin, setDateFin] = useState<Date | undefined>(undefined);
  const [typeConge, setTypeConge] = useState<TypeConge>("Congés payés");
  const [motif, setMotif] = useState("");

  // Désactiver complètement la détection de clic en dehors
  // Nous utiliserons uniquement le bouton X et le bouton Annuler pour fermer le modal

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  // Empêcher le défilement du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Réinitialiser le formulaire quand il s'ouvre ou quand la demande change
  useEffect(() => {
    if (demande) {
      setDateDebut(new Date(demande.dateDebut));
      setDateFin(new Date(demande.dateFin));
      setTypeConge(demande.typeConge);
      setMotif(demande.motif);
    } else {
      setDateDebut(undefined);
      setDateFin(undefined);
      setTypeConge("Congés payés");
      setMotif("");
    }
    setIsClosing(false);
  }, [demande, isOpen]);

  // Vérifier les informations de l'utilisateur au chargement du composant
  useEffect(() => {
    if (isOpen && user) {
      console.log("Formulaire ouvert avec l'utilisateur:", user);
      console.log("Valeur collaborateur_id:", user?.collaborateur_id);
    }
  }, [isOpen, user]);

  const handleClose = () => {
    setIsClosing(true);
    // Ajouter un petit délai avant de fermer réellement pour éviter les problèmes d'animation
    setTimeout(() => {
      onClose();
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Début du handleSubmit");
    setIsLoading(true);

    // Récupérer les infos utilisateur depuis le localStorage
    const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
    const collaborateurId = userInfo.collaborateur_id || "";

    console.log("Infos utilisateur depuis localStorage:", userInfo);
    console.log("ID collaborateur récupéré:", collaborateurId);
    console.log("ID utilisateur:", user?.id);

    // Validation
    if (!dateDebut || !dateFin) {
      console.log("Erreur: dates manquantes");
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner les dates de début et de fin.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (dateDebut > dateFin) {
      console.log("Erreur: date de début postérieure à la date de fin");
      toast({
        title: "Erreur de validation",
        description: "La date de début doit être antérieure à la date de fin.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!motif.trim()) {
      console.log("Erreur: motif manquant");
      toast({
        title: "Erreur de validation",
        description: "Veuillez indiquer un motif pour votre demande.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!user) {
      console.log("Erreur: utilisateur non connecté");
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour faire une demande.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Créer la demande
    const nouvelleDemande: DemandeConge = {
      id: demande?.id || String(Date.now()),
      utilisateurId: user.id,
      collaborateurId: collaborateurId,
      collaborateurNom: "", // Ce champ sera rempli par l'API
      dateDebut: dateDebut,
      dateFin: dateFin,
      typeConge: typeConge,
      motif: motif,
      statut: demande?.statut || "En attente",
      commentaireAdmin: demande?.commentaireAdmin,
      dateCreation: demande?.dateCreation || new Date(),
      dateModification: new Date(),
      notificationLue: false,
    };

    console.log("Demande à envoyer:", nouvelleDemande);

    try {
      // Envoyer la demande
      onSave(nouvelleDemande);
      console.log("Demande envoyée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande:", error);
    }

    setIsLoading(false);
    handleClose();
  };

  // Calculer le nombre de jours de congés
  const joursDemandes =
    dateDebut && dateFin ? differenceInCalendarDays(dateFin, dateDebut) + 1 : 0;

  // Types de congés disponibles
  const typesConges: TypeConge[] = [
    "Congés payés",
    "RTT",
    "Congé sans solde",
    "Maladie",
    "Autre",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto transition-opacity duration-200 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()} // Empêcher la propagation des clics
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {demande
              ? "Modifier la demande de congés"
              : "Nouvelle demande de congés"}
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Période de congés</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="dateDebut"
                    className="text-xs text-muted-foreground"
                  >
                    Date de début
                  </Label>
                  <input
                    type="date"
                    id="dateDebut"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={dateDebut ? format(dateDebut, "yyyy-MM-dd") : ""}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value);
                        setDateDebut(newDate);
                        // Si la date de fin n'est pas définie ou est avant la date de début,
                        // définir la date de fin à la date de début
                        if (!dateFin || dateFin < newDate) {
                          setDateFin(newDate);
                        }
                      } else {
                        setDateDebut(undefined);
                      }
                    }}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="dateFin"
                    className="text-xs text-muted-foreground"
                  >
                    Date de fin
                  </Label>
                  <input
                    type="date"
                    id="dateFin"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={dateFin ? format(dateFin, "yyyy-MM-dd") : ""}
                    min={
                      dateDebut
                        ? format(dateDebut, "yyyy-MM-dd")
                        : format(new Date(), "yyyy-MM-dd")
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        setDateFin(new Date(e.target.value));
                      } else {
                        setDateFin(undefined);
                      }
                    }}
                    required
                  />
                </div>
              </div>

              {dateDebut && dateFin && (
                <div className="text-sm text-muted-foreground mt-2">
                  Durée:{" "}
                  <span className="font-medium">
                    {joursDemandes} jour{joursDemandes > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeConge">Type de congés</Label>
              <Select
                value={typeConge}
                onValueChange={(value) => setTypeConge(value as TypeConge)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de congés" />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  {typesConges.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motif">Motif</Label>
              <Textarea
                id="motif"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Précisez le motif de votre demande"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading
                ? "Envoi en cours..."
                : demande
                ? "Modifier"
                : "Envoyer la demande"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
