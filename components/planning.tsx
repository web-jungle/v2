"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getSupabaseClient } from "@/lib/supabase";
import type { Collaborateur, Evenement, Role } from "@/lib/types";
import { entreprises } from "@/lib/types";
import { AlertCircle, Building, CalendarIcon, Users } from "lucide-react";
import "moment/locale/fr";
import moment from "moment/moment";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EnterpriseSelector from "./enterprise-selector";
import EventModal from "./event-modal";
import EventTypeSelector from "./event-type-selector";
import ExportExcel from "./export-excel";
import ExportPDF from "./export-pdf";
import Legend from "./legend";
import MultiSelectCollaborateurs from "./multi-select-collaborateurs";
import ResourceView from "./resource-view";

moment.locale("fr");
const localizer = momentLocalizer(moment);

interface PlanningProps {
  userRole: Role;
  userCollaborateurId?: string;
  user?: any; // TODO: Type user
}

export default function Planning({
  userRole,
  userCollaborateurId,
  user,
}: PlanningProps) {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [view, setView] = useState("ressources"); // Par défaut, on utilise la vue ressources
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(
    null
  );
  const [selectedCollaborateurs, setSelectedCollaborateurs] = useState<
    string[]
  >(
    userRole === "collaborateur" && userCollaborateurId
      ? [userCollaborateurId]
      : []
  );
  const [tempSlotInfo, setTempSlotInfo] = useState<{
    start: Date;
    end: Date;
    collaborateurId?: string;
  } | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = getSupabaseClient();

  // Charger les données de manière asynchrone
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingError(null);

        // Charger les collaborateurs
        const { data: collabData, error: collabError } = await supabase
          .from("collaborateurs")
          .select("*")
          .order("nom");

        if (collabError) {
          throw new Error(
            `Erreur lors du chargement des collaborateurs: ${collabError.message}`
          );
        }

        if (!collabData || collabData.length === 0) {
          throw new Error("Aucun collaborateur trouvé dans la base de données");
        }

        // Transformer les données pour correspondre à notre structure
        const formattedCollabs: Collaborateur[] = collabData.map((collab) => ({
          id: collab.id,
          nom: collab.nom,
          couleur: collab.couleur,
          entreprise: collab.entreprise,
          created_at: collab.created_at,
        }));

        setCollaborateurs(formattedCollabs);
        console.log("Collaborateurs chargés:", formattedCollabs.length);

        // Charger les événements
        const { data: eventData, error: eventError } = await supabase.from(
          "evenements"
        ).select(`
            *,
            collaborateur:collaborateur_id (
              id,
              nom,
              couleur,
              entreprise
            )
          `);

        if (eventError) {
          throw new Error(
            `Erreur lors du chargement des événements: ${eventError.message}`
          );
        }

        // Convertir les dates string en objets Date
        const formattedEvents: Evenement[] = (eventData || []).map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          collaborateur_id: event.collaborateur_id,
          collaborateur: event.collaborateur,
        }));

        setEvents(formattedEvents);
        console.log("Événements chargés:", formattedEvents.length);

        // Initialiser les collaborateurs sélectionnés
        if (selectedCollaborateurs.length === 0) {
          const initialSelectedCollabs =
            userRole === "collaborateur" && userCollaborateurId
              ? [userCollaborateurId]
              : formattedCollabs.map((c) => c.id);

          setSelectedCollaborateurs(initialSelectedCollabs);
          console.log(
            "Collaborateurs sélectionnés initialisés:",
            initialSelectedCollabs.length
          );
        }

        setIsDataLoaded(true);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setLoadingError(
          error instanceof Error ? error.message : "Erreur inconnue"
        );
        toast({
          title: "Erreur de chargement",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de charger les données du planning.",
          variant: "destructive",
        });
        setIsDataLoaded(true); // Pour éviter un écran de chargement infini
      }
    };

    loadData();
  }, [userRole, userCollaborateurId, toast, supabase]);

  // Calculer le début de la semaine en cours
  const currentWeekStart = useMemo(() => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Lundi de la semaine en cours
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }, [date]);

  // Si l'utilisateur est un collaborateur, il ne peut voir que son propre planning
  const canFilterCollaborateurs =
    userRole === "admin" || userRole === "manager";

  // Filtrer les collaborateurs par entreprise
  const filteredCollaborateurs = useMemo(() => {
    return selectedEnterprise
      ? collaborateurs.filter((c) => c.entreprise === selectedEnterprise)
      : collaborateurs;
  }, [selectedEnterprise, collaborateurs]);

  // Mettre à jour les collaborateurs sélectionnés lorsque l'entreprise change
  const handleEnterpriseChange = useCallback(
    (enterprise: string | null) => {
      setSelectedEnterprise(enterprise);

      if (userRole === "collaborateur" && userCollaborateurId) {
        // Si l'utilisateur est un collaborateur, il ne peut voir que son propre planning
        setSelectedCollaborateurs([userCollaborateurId]);
      } else if (enterprise) {
        // Sélectionner tous les collaborateurs de l'entreprise choisie
        const collaborateursIds = collaborateurs
          .filter((c) => c.entreprise === enterprise)
          .map((c) => c.id);
        setSelectedCollaborateurs(collaborateursIds);
      } else {
        // Sélectionner tous les collaborateurs si aucune entreprise n'est choisie
        setSelectedCollaborateurs(collaborateurs.map((c) => c.id));
      }
    },
    [userRole, userCollaborateurId, collaborateurs]
  );

  const handleSelectEvent = useCallback(
    (event: Evenement) => {
      // Vérifier les droits d'accès pour la modification
      const canEdit =
        (userRole === "admin" ||
          userRole === "manager" ||
          (userRole === "collaborateur" &&
            event.collaborateur_id === userCollaborateurId)) &&
        !event.verrouille;

      // Si l'événement est verrouillé, seul l'admin peut le voir en détail
      if (event.verrouille && userRole !== "admin") {
        toast({
          title: "Événement verrouillé",
          description:
            "Cet événement a été verrouillé par un administrateur et ne peut pas être modifié.",
          variant: "destructive",
        });
        return;
      }

      setSelectedEvent(event);
      setIsModalOpen(true);
    },
    [userRole, userCollaborateurId, toast]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; collaborateurId?: string }) => {
      // Si l'utilisateur est un collaborateur, il ne peut ajouter que pour lui-même
      if (userRole === "collaborateur" && userCollaborateurId) {
        if (
          slotInfo.collaborateurId &&
          slotInfo.collaborateurId !== userCollaborateurId
        ) {
          return; // Ne pas permettre la création pour un autre collaborateur
        }
        slotInfo.collaborateurId = userCollaborateurId;
      }

      // Stocker temporairement les informations du créneau
      setTempSlotInfo(slotInfo);
      // Ouvrir le sélecteur de type d'événement
      setIsTypeSelectorOpen(true);
    },
    [userRole, userCollaborateurId]
  );

  const handleSelectEventType = useCallback(
    (type: "presence" | "absence") => {
      if (!tempSlotInfo) return;

      // Déterminer les heures par défaut en fonction du collaborateur
      let startTime = tempSlotInfo.start;
      let endTime = tempSlotInfo.end;

      // Si un collaborateur est spécifié, appliquer les heures par défaut selon l'entreprise
      if (tempSlotInfo.collaborateurId) {
        const collaborateur = collaborateurs.find(
          (c) => c.id === tempSlotInfo.collaborateurId
        );
        if (collaborateur) {
          const entreprise = collaborateur.entreprise;
          const isFriday = tempSlotInfo.start.getDay() === 5; // 5 = vendredi

          // Utiliser la même logique que dans les autres composants
          const DEFAULT_HOURS: Record<
            string,
            {
              normal: {
                startHour: number;
                startMinute: number;
                endHour: number;
                endMinute: number;
              };
              friday: {
                startHour: number;
                startMinute: number;
                endHour: number;
                endMinute: number;
              };
            }
          > = {
            "ORIZON TELECOM": {
              normal: {
                startHour: 8,
                startMinute: 30,
                endHour: 17,
                endMinute: 0,
              },
              friday: {
                startHour: 8,
                startMinute: 30,
                endHour: 16,
                endMinute: 30,
              },
            },
            "ORIZON GROUP": {
              normal: {
                startHour: 8,
                startMinute: 30,
                endHour: 17,
                endMinute: 0,
              },
              friday: {
                startHour: 8,
                startMinute: 30,
                endHour: 16,
                endMinute: 30,
              },
            },
            "ORIZON INSTALLATION": {
              normal: {
                startHour: 7,
                startMinute: 30,
                endHour: 15,
                endMinute: 30,
              },
              friday: {
                startHour: 7,
                startMinute: 30,
                endHour: 15,
                endMinute: 30,
              },
            },
            YELLEEN: {
              normal: {
                startHour: 7,
                startMinute: 30,
                endHour: 16,
                endMinute: 30,
              },
              friday: {
                startHour: 7,
                startMinute: 30,
                endHour: 15,
                endMinute: 30,
              },
            },
            // Valeurs par défaut pour les autres entreprises
            DEFAULT: {
              normal: {
                startHour: 8,
                startMinute: 0,
                endHour: 17,
                endMinute: 0,
              },
              friday: {
                startHour: 8,
                startMinute: 0,
                endHour: 16,
                endMinute: 0,
              },
            },
          };

          // Rechercher dans les clés de DEFAULT_HOURS de manière insensible à la casse
          let hoursKey = "DEFAULT";

          // Vérifier si l'entreprise correspond à une des clés (insensible à la casse)
          const upperEntreprise = entreprise.toUpperCase().trim();
          for (const key of Object.keys(DEFAULT_HOURS)) {
            if (key.toUpperCase() === upperEntreprise) {
              hoursKey = key;
              break;
            }
          }

          console.log(
            "Entreprise détectée:",
            entreprise,
            "Clé utilisée:",
            hoursKey
          );

          const hours = DEFAULT_HOURS[hoursKey];
          const timeSettings = isFriday ? hours.friday : hours.normal;

          startTime = new Date(tempSlotInfo.start);
          startTime.setHours(
            timeSettings.startHour,
            timeSettings.startMinute,
            0,
            0
          );

          endTime = new Date(tempSlotInfo.start);
          endTime.setHours(timeSettings.endHour, timeSettings.endMinute, 0, 0);

          console.log(
            "Horaires appliqués:",
            `${startTime.getHours()}:${startTime.getMinutes()}`,
            `${endTime.getHours()}:${endTime.getMinutes()}`
          );
        }
      }

      // Créer un nouvel événement avec le type sélectionné
      setSelectedEvent({
        id: String(new Date().getTime()),
        title: "",
        start: startTime,
        end: endTime,
        collaborateur_id: tempSlotInfo.collaborateurId || "",
        type_evenement: type,
        lieu_chantier: "",
        zone_trajet: "",
        panier_repas: false,
        ticket_restaurant: false,
        heures_supplementaires: 0,
        grand_deplacement: false,
        prgd: false,
        nombre_prgd: 0,
        type_absence: type === "absence" ? "RTT" : undefined, // Valeur par défaut pour le type d'absence
        verrouille: false, // Par défaut, l'événement n'est pas verrouillé
      });

      // Fermer le sélecteur de type et ouvrir le modal d'événement
      setIsTypeSelectorOpen(false);
      setIsModalOpen(true);
    },
    [tempSlotInfo, collaborateurs]
  );

  const handleSaveEvent = useCallback(
    async (event: Evenement) => {
      // Vérifier si l'événement est verrouillé
      if (event.verrouille && userRole !== "admin") {
        toast({
          title: "Événement verrouillé",
          description:
            "Cet événement a été verrouillé par un administrateur et ne peut pas être modifié.",
          variant: "destructive",
        });
        return;
      }

      // Vérifier les droits d'accès pour la sauvegarde
      const canSave =
        userRole === "admin" ||
        userRole === "manager" ||
        (userRole === "collaborateur" &&
          event.collaborateur_id === userCollaborateurId);

      if (canSave) {
        try {
          // Vérifier que le collaborateur existe
          const collaborateur = collaborateurs.find(
            (c) => c.id === event.collaborateur_id
          );
          if (!collaborateur) {
            throw new Error(
              `Collaborateur avec ID ${event.collaborateur_id} non trouvé`
            );
          }

          // Préparer les données pour Supabase
          const eventData = {
            title: event.title,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            collaborateur_id: event.collaborateur_id,
            type_evenement: event.type_evenement,
            lieu_chantier: event.lieu_chantier,
            zone_trajet: event.zone_trajet,
            panier_repas: event.panier_repas,
            ticket_restaurant: event.ticket_restaurant,
            heures_supplementaires: event.heures_supplementaires,
            grand_deplacement: event.grand_deplacement,
            prgd: event.prgd,
            nombre_prgd: event.nombre_prgd,
            type_absence: event.type_absence,
            verrouille: event.verrouille,
            latitude: event.latitude,
            longitude: event.longitude,
            adresse_complete: event.adresse_complete,
          };

          if (selectedEvent && events.find((e) => e.id === event.id)) {
            // Mise à jour d'un événement existant
            const { error } = await supabase
              .from("evenements")
              .update(eventData)
              .eq("id", event.id);

            if (error) {
              throw error;
            }

            // Mettre à jour l'état local
            setEvents(
              events.map((e) =>
                e.id === event.id ? { ...event, collaborateur } : e
              )
            );

            toast({
              title: "Événement mis à jour",
              description: "L'événement a été mis à jour avec succès.",
            });
          } else {
            // Création d'un nouvel événement
            const { data, error } = await supabase
              .from("evenements")
              .insert(eventData).select(`
                *,
                collaborateur:collaborateur_id (
                  id,
                  nom,
                  couleur,
                  entreprise
                )
              `);

            if (error) {
              throw error;
            }

            if (data && data.length > 0) {
              // Convertir les dates string en objets Date
              const newEvent: Evenement = {
                ...data[0],
                start: new Date(data[0].start),
                end: new Date(data[0].end),
              };

              // Ajouter le nouvel événement à l'état local
              setEvents([...events, newEvent]);

              toast({
                title: "Événement créé",
                description: "Le nouvel événement a été créé avec succès.",
              });
            }
          }
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de l'événement:", error);
          toast({
            title: "Erreur",
            description:
              error instanceof Error
                ? error.message
                : "Impossible de sauvegarder l'événement.",
            variant: "destructive",
          });
        }
      }

      setIsModalOpen(false);
      setSelectedEvent(null);
    },
    [
      events,
      selectedEvent,
      userRole,
      userCollaborateurId,
      toast,
      supabase,
      collaborateurs,
    ]
  );

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      const eventToDelete = events.find((e) => e.id === eventId);

      // Vérifier si l'événement est verrouillé
      if (eventToDelete?.verrouille && userRole !== "admin") {
        toast({
          title: "Événement verrouillé",
          description:
            "Cet événement a été verrouillé par un administrateur et ne peut pas être supprimé.",
          variant: "destructive",
        });
        return;
      }

      // Vérifier les droits d'accès pour la suppression
      const canDelete =
        userRole === "admin" ||
        userRole === "manager" ||
        (userRole === "collaborateur" &&
          eventToDelete?.collaborateur_id === userCollaborateurId);

      if (canDelete) {
        try {
          const { error } = await supabase
            .from("evenements")
            .delete()
            .eq("id", eventId);

          if (error) {
            throw error;
          }

          // Mettre à jour l'état local
          setEvents(events.filter((e) => e.id !== eventId));

          toast({
            title: "Événement supprimé",
            description: "L'événement a été supprimé avec succès.",
          });
        } catch (error) {
          console.error("Erreur lors de la suppression de l'événement:", error);
          toast({
            title: "Erreur",
            description: "Impossible de supprimer l'événement.",
            variant: "destructive",
          });
        }
      }

      setIsModalOpen(false);
      setSelectedEvent(null);
    },
    [events, userRole, userCollaborateurId, toast, supabase]
  );

  // Fonction pour dupliquer un événement
  const handleDuplicateEvent = useCallback(
    async (event: Evenement, newDate: Date, newCollaborateurId?: string) => {
      // Vérifier si l'événement est verrouillé
      if (event.verrouille) {
        toast({
          title: "Événement verrouillé",
          description:
            "Cet événement a été verrouillé par un administrateur et ne peut pas être dupliqué.",
          variant: "destructive",
        });
        return;
      }

      // Vérifier les droits d'accès pour la duplication
      const canDuplicate =
        userRole === "admin" ||
        userRole === "manager" ||
        (userRole === "collaborateur" &&
          event.collaborateur_id === userCollaborateurId);

      if (!canDuplicate) return;

      // Vérifier si un événement existe déjà pour ce collaborateur et cette date
      const existingEvent = events.find((e) => {
        const eDate = new Date(e.start);
        const targetDate = new Date(newDate);
        return (
          e.collaborateur_id ===
            (newCollaborateurId || event.collaborateur_id) &&
          eDate.getDate() === targetDate.getDate() &&
          eDate.getMonth() === targetDate.getMonth() &&
          eDate.getFullYear() === targetDate.getFullYear()
        );
      });

      if (existingEvent) {
        toast({
          title: "Événement existant",
          description:
            "Un événement existe déjà pour ce collaborateur à cette date.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Vérifier que le collaborateur existe
        const targetCollabId = newCollaborateurId || event.collaborateur_id;
        const collaborateur = collaborateurs.find(
          (c) => c.id === targetCollabId
        );
        if (!collaborateur) {
          throw new Error(`Collaborateur avec ID ${targetCollabId} non trouvé`);
        }

        // Créer une copie de l'événement avec un nouvel ID
        const startTime =
          new Date(event.start).getHours() * 60 +
          new Date(event.start).getMinutes();
        const endTime =
          new Date(event.end).getHours() * 60 +
          new Date(event.end).getMinutes();

        const newStart = new Date(newDate);
        newStart.setHours(Math.floor(startTime / 60), startTime % 60);

        const newEnd = new Date(newDate);
        newEnd.setHours(Math.floor(endTime / 60), endTime % 60);

        // Préparer les données pour Supabase
        const eventData = {
          title: event.title,
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
          collaborateur_id: targetCollabId,
          type_evenement: event.type_evenement,
          lieu_chantier: event.lieu_chantier,
          zone_trajet: event.zone_trajet,
          panier_repas: event.panier_repas,
          ticket_restaurant: event.ticket_restaurant,
          heures_supplementaires: event.heures_supplementaires,
          grand_deplacement: event.grand_deplacement,
          prgd: event.prgd,
          nombre_prgd: event.nombre_prgd,
          type_absence: event.type_absence,
          verrouille: false, // L'événement dupliqué n'est pas verrouillé par défaut
          latitude: event.latitude,
          longitude: event.longitude,
          adresse_complete: event.adresse_complete,
        };

        // Insérer le nouvel événement dans Supabase
        const { data, error } = await supabase
          .from("evenements")
          .insert(eventData).select(`
            *,
            collaborateur:collaborateur_id (
              id,
              nom,
              couleur,
              entreprise
            )
          `);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          // Convertir les dates string en objets Date
          const newEvent: Evenement = {
            ...data[0],
            start: new Date(data[0].start),
            end: new Date(data[0].end),
          };

          // Ajouter le nouvel événement à l'état local
          setEvents([...events, newEvent]);

          toast({
            title: "Événement dupliqué",
            description: "L'événement a été dupliqué avec succès.",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la duplication de l'événement:", error);
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de dupliquer l'événement.",
          variant: "destructive",
        });
      }
    },
    [events, userRole, userCollaborateurId, toast, supabase, collaborateurs]
  );

  // Fonction pour verrouiller/déverrouiller un événement
  const handleToggleLock = useCallback(
    async (eventId: string, locked: boolean) => {
      // Seul l'administrateur peut verrouiller/déverrouiller un événement
      if (userRole !== "admin") {
        toast({
          title: "Action non autorisée",
          description:
            "Seul un administrateur peut verrouiller ou déverrouiller un événement.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Mettre à jour l'événement dans Supabase
        const { error } = await supabase
          .from("evenements")
          .update({ verrouille: locked })
          .eq("id", eventId);

        if (error) {
          throw error;
        }

        // Mettre à jour l'état local
        setEvents(
          events.map((event) => {
            if (event.id === eventId) {
              return { ...event, verrouille: locked };
            }
            return event;
          })
        );

        toast({
          title: locked ? "Événement verrouillé" : "Événement déverrouillé",
          description: locked
            ? "L'événement a été verrouillé et ne peut plus être modifié."
            : "L'événement a été déverrouillé et peut maintenant être modifié.",
        });
      } catch (error) {
        console.error(
          "Erreur lors du verrouillage/déverrouillage de l'événement:",
          error
        );
        toast({
          title: "Erreur",
          description: "Impossible de modifier le verrouillage de l'événement.",
          variant: "destructive",
        });
      }
    },
    [events, userRole, toast, supabase]
  );

  // Filtrer les événements selon les collaborateurs sélectionnés
  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      selectedCollaborateurs.includes(event.collaborateur_id)
    );
  }, [events, selectedCollaborateurs]);

  // Filtrer les collaborateurs visibles pour un utilisateur de type "collaborateur"
  const visibleCollaborateurs = useMemo(() => {
    if (userRole === "collaborateur" && userCollaborateurId) {
      return collaborateurs.filter((c) => c.id === userCollaborateurId);
    } else if (userRole === "manager" && user?.collaborateursGeres?.length) {
      // Si c'est un manager, il ne voit que les collaborateurs qu'il gère
      return collaborateurs.filter((c) =>
        user.collaborateursGeres?.includes(c.id)
      );
    } else {
      // Admin voit tout
      return filteredCollaborateurs;
    }
  }, [
    userRole,
    userCollaborateurId,
    filteredCollaborateurs,
    user?.collaborateursGeres,
    collaborateurs,
  ]);

  const eventStyleGetter = useCallback(
    (event: Evenement) => {
      const collaborateur = collaborateurs.find(
        (c) => c.id === event.collaborateur_id
      );
      let backgroundColor = collaborateur?.couleur || "#3174ad";

      // Couleurs différentes pour les absences
      if (event.type_evenement === "absence") {
        switch (event.type_absence) {
          case "RTT":
            backgroundColor = "#f97316"; // orange
            break;
          case "CP":
            backgroundColor = "#22c55e"; // green
            break;
          case "Accident Travail":
          case "Arrêt Travail":
            backgroundColor = "#ef4444"; // red
            break;
          default:
            backgroundColor = "#a855f7"; // purple
        }
      }

      // Ajouter une bordure pour les événements verrouillés
      const style: React.CSSProperties = {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: event.verrouille ? "2px solid #6b7280" : "0px",
        display: "block",
      };

      return { style };
    },
    [collaborateurs]
  );

  // Obtenir le nom du mois en cours
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const currentMonth = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  // Afficher un état de chargement si les données ne sont pas encore chargées
  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (loadingError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de chargement</AlertTitle>
        <AlertDescription>
          {loadingError}
          <div className="mt-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mr-2"
            >
              Réessayer
            </Button>
            <Button
              variant="default"
              onClick={() => (window.location.href = "/diagnostic")}
            >
              Diagnostic
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Afficher un avertissement si aucun collaborateur n'est trouvé
  if (collaborateurs.length === 0) {
    return (
      <Alert variant="warning" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Aucun collaborateur</AlertTitle>
        <AlertDescription>
          Aucun collaborateur n'a été trouvé dans la base de données. Veuillez
          ajouter des collaborateurs avant d'utiliser le planning.
          <div className="mt-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/test-supabase")}
              className="mr-2"
            >
              Initialiser la base de données
            </Button>
            <Button
              variant="default"
              onClick={() => (window.location.href = "/diagnostic")}
            >
              Diagnostic
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur d'entreprise */}
          {canFilterCollaborateurs && (
            <EnterpriseSelector
              enterprises={entreprises}
              selectedEnterprise={selectedEnterprise}
              onChange={handleEnterpriseChange}
            />
          )}
          {/* Sélecteur de collaborateurs */}
          {canFilterCollaborateurs && (
            <MultiSelectCollaborateurs
              collaborateurs={visibleCollaborateurs}
              selectedCollaborateurs={selectedCollaborateurs}
              onChange={setSelectedCollaborateurs}
              disabled={!canFilterCollaborateurs}
            />
          )}
          <Button onClick={() => setDate(new Date())}>Aujourd'hui</Button>
        </div>
        <Tabs
          defaultValue="ressources"
          value={view}
          className="w-[400px]"
          onValueChange={(value) => {
            setView(value);
          }}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ressources">Par collaborateur</TabsTrigger>
            <TabsTrigger value="semaine">Semaine</TabsTrigger>
            <TabsTrigger value="mois">Mois</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-semibold">
          Planning {currentMonth} {currentYear}
          {selectedEnterprise && (
            <span className="ml-2 text-muted-foreground">
              ({selectedEnterprise})
            </span>
          )}
        </h2>
        <div className="flex flex-wrap gap-2">
          <ExportPDF
            events={filteredEvents}
            collaborateurs={collaborateurs}
            selectedCollaborateurs={selectedCollaborateurs}
            currentWeekStart={currentWeekStart}
          />
          {(userRole === "admin" || userRole === "manager") && (
            <ExportExcel events={events} collaborateurs={collaborateurs} />
          )}
        </div>
      </div>

      {view === "ressources" ? (
        <>
          <ResourceView
            events={filteredEvents}
            collaborateurs={visibleCollaborateurs.filter((c) =>
              selectedCollaborateurs.includes(c.id)
            )}
            date={date}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onDuplicateEvent={handleDuplicateEvent}
            onToggleLock={handleToggleLock}
            userRole={userRole}
            userCollaborateurId={userCollaborateurId}
          />
          <Legend />
        </>
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-6">
            <div className="h-[600px]">
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                views={[Views.WEEK, Views.MONTH]}
                view={view === "semaine" ? Views.WEEK : Views.MONTH}
                date={date}
                onNavigate={setDate}
                onView={(newView) =>
                  setView(newView === Views.WEEK ? "semaine" : "mois")
                }
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable={
                  userRole !== "collaborateur" || !!userCollaborateurId
                }
                popup
                eventPropGetter={eventStyleGetter}
                messages={{
                  week: "Semaine",
                  month: "Mois",
                  today: "Aujourd'hui",
                  previous: "Précédent",
                  next: "Suivant",
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>Collaborateurs actifs</span>
            </div>
            <Badge variant="outline" className="text-lg">
              {selectedCollaborateurs.length}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <span>Événements planifiés</span>
            </div>
            <Badge variant="outline" className="text-lg">
              {filteredEvents.length}
            </Badge>
          </CardContent>
        </Card>
        {selectedEnterprise && (
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span>Entreprise</span>
              </div>
              <Badge variant="outline" className="text-lg">
                {selectedEnterprise}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de sélection du type d'événement */}
      {isTypeSelectorOpen && tempSlotInfo && (
        <EventTypeSelector
          isOpen={isTypeSelectorOpen}
          onClose={() => setIsTypeSelectorOpen(false)}
          onSelectType={handleSelectEventType}
          date={tempSlotInfo.start}
        />
      )}

      {/* Modal d'édition d'événement */}
      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          collaborateurs={visibleCollaborateurs}
          userRole={userRole}
          userCollaborateurId={userCollaborateurId}
        />
      )}
    </div>
  );
}
