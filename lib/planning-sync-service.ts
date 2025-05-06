"use client";

import { toast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export interface CollaborateurData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  date_embauche: string;
  statut: string;
  // Autres champs nécessaires
}

export interface PlanningEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  collaborateurId: string;
  // Autres champs nécessaires
}

export function usePlanningSync() {
  const [collaborateurs, setCollaborateurs] = useState<CollaborateurData[]>([]);
  const [planningEvents, setPlanningEvents] = useState<PlanningEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Charger les collaborateurs depuis Supabase
  const loadCollaborateurs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("collaborateurs").select("*");

      if (error) {
        throw new Error(
          `Erreur lors du chargement des collaborateurs: ${error.message}`
        );
      }

      setCollaborateurs(data || []);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      toast({
        title: "Erreur de synchronisation",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les événements du planning depuis Supabase
  const loadPlanningEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("planning_events")
        .select("*");

      if (error) {
        throw new Error(
          `Erreur lors du chargement des événements: ${error.message}`
        );
      }

      // Convertir les dates string en objets Date
      const formattedEvents = (data || []).map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setPlanningEvents(formattedEvents);
      return formattedEvents;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      toast({
        title: "Erreur de synchronisation",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un événement au planning
  const addPlanningEvent = async (event: Omit<PlanningEvent, "id">) => {
    try {
      setIsLoading(true);

      // Vérifier si le collaborateur existe
      const collaborateurExists = collaborateurs.some(
        (c) => c.id === event.collaborateurId
      );
      if (!collaborateurExists) {
        throw new Error(
          `Le collaborateur avec l'ID ${event.collaborateurId} n'existe pas`
        );
      }

      const { data, error } = await supabase
        .from("planning_events")
        .insert([
          {
            title: event.title,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            collaborateur_id: event.collaborateurId,
          },
        ])
        .select();

      if (error) {
        throw new Error(
          `Erreur lors de l'ajout de l'événement: ${error.message}`
        );
      }

      // Recharger les événements pour avoir les données à jour
      await loadPlanningEvents();

      toast({
        title: "Événement ajouté",
        description: "L'événement a été ajouté avec succès au planning",
      });

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      toast({
        title: "Erreur d'ajout",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour un événement du planning
  const updatePlanningEvent = async (
    id: string,
    updates: Partial<PlanningEvent>
  ) => {
    try {
      setIsLoading(true);

      const updateData: any = { ...updates };

      // Convertir les dates en ISO string pour Supabase
      if (updates.start) updateData.start = updates.start.toISOString();
      if (updates.end) updateData.end = updates.end.toISOString();
      if (updates.collaborateurId)
        updateData.collaborateur_id = updates.collaborateurId;

      const { data, error } = await supabase
        .from("planning_events")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(
          `Erreur lors de la mise à jour de l'événement: ${error.message}`
        );
      }

      // Recharger les événements pour avoir les données à jour
      await loadPlanningEvents();

      toast({
        title: "Événement mis à jour",
        description: "L'événement a été mis à jour avec succès",
      });

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un événement du planning
  const deletePlanningEvent = async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("planning_events")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(
          `Erreur lors de la suppression de l'événement: ${error.message}`
        );
      }

      // Mettre à jour l'état local
      setPlanningEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== id)
      );

      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      toast({
        title: "Erreur de suppression",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier la synchronisation entre les collaborateurs et les événements
  const checkSynchronization = () => {
    const eventsWithInvalidCollaborateurs = planningEvents.filter(
      (event) =>
        !collaborateurs.some((collab) => collab.id === event.collaborateurId)
    );

    return {
      isSynchronized: eventsWithInvalidCollaborateurs.length === 0,
      invalidEvents: eventsWithInvalidCollaborateurs,
      totalEvents: planningEvents.length,
      totalCollaborateurs: collaborateurs.length,
    };
  };

  // Réparer les événements avec des collaborateurs invalides
  const repairInvalidEvents = async () => {
    const { invalidEvents } = checkSynchronization();

    if (invalidEvents.length === 0) {
      toast({
        title: "Synchronisation",
        description: "Tous les événements sont correctement synchronisés",
      });
      return true;
    }

    try {
      setIsLoading(true);

      // Option 1: Supprimer les événements invalides
      for (const event of invalidEvents) {
        await supabase.from("planning_events").delete().eq("id", event.id);
      }

      // Recharger les événements
      await loadPlanningEvents();

      toast({
        title: "Réparation terminée",
        description: `${invalidEvents.length} événements invalides ont été supprimés`,
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      toast({
        title: "Erreur de réparation",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      await loadCollaborateurs();
      await loadPlanningEvents();
    };

    loadData();
  }, []);

  return {
    collaborateurs,
    planningEvents,
    isLoading,
    error,
    loadCollaborateurs,
    loadPlanningEvents,
    addPlanningEvent,
    updatePlanningEvent,
    deletePlanningEvent,
    checkSynchronization,
    repairInvalidEvents,
  };
}
