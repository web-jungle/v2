"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useAuthToken } from "@/hooks/useAuthToken";
import type { Collaborateur, Evenement, Role } from "@/lib/types";
import { entreprises } from "@/lib/types";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Building, CalendarIcon, FileText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EnterpriseSelector from "./enterprise-selector";
import EventModal from "./event-modal";
import EventTypeSelector from "./event-type-selector";
import ExportExcel from "./export-excel";
import ExportPDF from "./export-pdf";
import Legend from "./legend";
import MultiSelectCollaborateurs from "./multi-select-collaborateurs";
import ResourceView from "./resource-view";

// Configuration du localisateur pour date-fns
const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: any) => startOfWeek(date, { locale: fr }),
  getDay,
  locales,
});

// Fonction utilitaire pour formater une date pour l'URL
const formatDateForUrl = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export default function Planning() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [view, setView] = useState("ressources");
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(
    null
  );
  const [selectedCollaborateurs, setSelectedCollaborateurs] = useState<
    string[]
  >([]);
  const [tempSlotInfo, setTempSlotInfo] = useState<{
    start: Date;
    end: Date;
    collaborateurId?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  // Récupérer les informations d'authentification
  const { user } = useAuth();
  const { isAuthenticated, userId, role } = useAuthToken();

  // Définir userRole et userCollaborateurId
  const userRole = role as Role | undefined;
  const userCollaborateurId = user?.collaborateur_id || "";

  useEffect(() => {
    const fetchCollaborateurs = async () => {
      try {
        setIsLoading(true);
        // Utiliser une seule API endpoint qui filtrera les données côté serveur selon le rôle
        const apiEndpoint = "/api/collaborateurs";

        console.log("Appel API collaborateurs:", apiEndpoint);

        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        console.log("Données des collaborateurs chargées:", data.length);

        setCollaborateurs(data);

        // Sélectionner tous les collaborateurs par défaut
        setSelectedCollaborateurs(data.map((c: any) => c.id));
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des collaborateurs",
          error
        );
        toast({
          title: "Erreur",
          description: "Impossible de charger les collaborateurs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCollaborateurs();
    }
  }, [refreshTrigger, isAuthenticated, toast]);

  const currentWeekStart = useMemo(() => {
    return startOfWeek(date, { locale: fr });
  }, [date]);

  // Fonction pour forcer le rafraîchissement des données
  const refreshData = useCallback(() => {
    // Incrémenter refreshTrigger pour déclencher le re-fetch des données
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Fonction pour charger les événements
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Chargement des événements...");

      // Utiliser l'API simplifiée qui filtre déjà selon le rôle de l'utilisateur
      const url = "/api/evenements";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${data.length} événements chargés`);

      // Convertir les dates string en objets Date
      const formattedEvents = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Charger les événements au chargement du composant et après un rafraîchissement
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [fetchEvents, isAuthenticated, refreshTrigger]);

  // On désactive temporairement le filtrage par rôle
  const canFilterCollaborateurs = true;

  // Filtrer les collaborateurs par entreprise
  const filteredCollaborateurs = useMemo(() => {
    console.log(
      "Collaborateurs actuels:",
      collaborateurs.length,
      "Entreprise sélectionnée:",
      selectedEnterprise
    );
    return selectedEnterprise
      ? collaborateurs.filter((c) => c.entreprise === selectedEnterprise)
      : collaborateurs;
  }, [selectedEnterprise, collaborateurs]);

  // Mettre à jour les collaborateurs sélectionnés lorsque l'entreprise change
  const handleEnterpriseChange = useCallback(
    (enterprise: string | null) => {
      console.log("Changement d'entreprise:", enterprise);
      setSelectedEnterprise(enterprise);

      if (enterprise) {
        // Sélectionner tous les collaborateurs de l'entreprise choisie
        const collaborateursIds = collaborateurs
          .filter((c) => c.entreprise === enterprise)
          .map((c) => c.id);
        console.log("IDs filtrés par entreprise:", collaborateursIds.length);
        setSelectedCollaborateurs(collaborateursIds);
      } else {
        // Sélectionner tous les collaborateurs si aucune entreprise n'est choisie
        setSelectedCollaborateurs(collaborateurs.map((c) => c.id));
      }
    },
    [collaborateurs]
  );

  const handleSelectEvent = useCallback((event: Evenement) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; collaborateurId?: string }) => {
      // Vérifier si l'utilisateur a les droits pour créer un événement
      if (userRole !== "admin" && userRole !== "manager") {
        toast({
          title: "Accès refusé",
          description:
            "Seuls les administrateurs et managers peuvent créer des événements.",
          variant: "destructive",
        });
        return;
      }

      setTempSlotInfo(slotInfo);
      setIsTypeSelectorOpen(true);
    },
    [userRole, toast]
  );

  const handleSelectEventType = useCallback(
    (type: "presence" | "absence") => {
      if (!tempSlotInfo) return;

      // Déterminer les heures par défaut
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

          // Utiliser la fonction applyDefaultHours du composant EventModal
          // qui contient la logique des horaires par défaut selon l'entreprise
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

      // Forcer le type à être "absence" ou "presence"
      const eventType = type === "absence" ? "absence" : "presence";

      // Générer un ID temporaire sous format compatible avec UUID
      const tempId = `temp_${
        crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15)
      }`;

      // Créer un nouvel événement avec le type sélectionné
      const newEvent = {
        id: tempId,
        title: "",
        start: startTime,
        end: endTime,
        collaborateurId: tempSlotInfo.collaborateurId || "",
        typeEvenement: eventType,
        lieuChantier: "",
        zoneTrajet: "",
        panierRepas: false,
        heuresSupplementaires: 0,
        grandDeplacement: false,
        prgd: false,
        nombrePrgd: 0,
        typeAbsence: eventType === "absence" ? "RTT" : undefined,
        verrouille: false,
        ticketRestaurant: false,
      };

      setSelectedEvent(newEvent as unknown as Evenement);

      // Fermer le sélecteur de type et ouvrir le modal d'événement
      setIsTypeSelectorOpen(false);
      setIsModalOpen(true);
    },
    [tempSlotInfo, collaborateurs]
  );

  const handleSaveEvent = useCallback(
    async (event: Evenement) => {
      // Vérifier si l'utilisateur a les droits pour sauvegarder un événement
      if (userRole !== "admin" && userRole !== "manager") {
        toast({
          title: "Accès refusé",
          description:
            "Seuls les administrateurs et managers peuvent gérer les événements.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);

        // Obtenir le token d'authentification
        const token = localStorage.getItem("auth_token");

        if (!token) {
          toast({
            title: "Erreur d'authentification",
            description:
              "Vous devez être connecté pour effectuer cette action.",
            variant: "destructive",
          });
          return;
        }

        // Déterminer si c'est une création ou une mise à jour
        const isNewEvent =
          !event.id ||
          event.id.startsWith("temp_") ||
          /^\d{13,}$/.test(event.id);
        const url = isNewEvent
          ? "/api/evenements"
          : `/api/evenements/${event.id}`;
        const method = isNewEvent ? "POST" : "PATCH";

        console.log("Sauvegarde événement:", {
          id: event.id,
          isNewEvent,
          method,
          url,
          eventData: JSON.stringify(event),
        });

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de l'enregistrement de l'événement"
          );
        }

        // Rafraîchir les données après la sauvegarde
        refreshData();

        setIsModalOpen(false);
        setSelectedEvent(null);
        toast({
          title: isNewEvent ? "Événement créé" : "Événement mis à jour",
          description: `L'événement a été ${
            isNewEvent ? "créé" : "mis à jour"
          } avec succès.`,
        });
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'événement:", error);
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de l'enregistrement.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast, userRole, refreshData]
  );

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      // Vérifier si l'utilisateur a les droits pour supprimer un événement
      if (userRole !== "admin" && userRole !== "manager") {
        toast({
          title: "Accès refusé",
          description:
            "Seuls les administrateurs et managers peuvent supprimer des événements.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);

        // Obtenir le token d'authentification
        const token = localStorage.getItem("auth_token");

        if (!token) {
          toast({
            title: "Erreur d'authentification",
            description:
              "Vous devez être connecté pour effectuer cette action.",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch(`/api/evenements/${eventId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la suppression de l'événement"
          );
        }

        // Rafraîchir les données après la suppression
        refreshData();

        setIsModalOpen(false);
        setSelectedEvent(null);
        toast({
          title: "Événement supprimé",
          description: "L'événement a été supprimé avec succès.",
        });
      } catch (error) {
        console.error("Erreur lors de la suppression de l'événement:", error);
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la suppression.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast, userRole, refreshData]
  );

  const handleDuplicateEvent = useCallback(
    async (
      event: Evenement,
      newDate: Date,
      newCollaborateurId?: string,
      isCollaborateurChange: boolean = false
    ) => {
      // Vérifier que l'utilisateur a les droits
      if (userRole !== "admin" && userRole !== "manager") {
        toast({
          title: "Accès refusé",
          description:
            "Seuls les administrateurs et managers peuvent dupliquer des événements.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);

        // Obtenir le token d'authentification
        const token = localStorage.getItem("auth_token");

        if (!token) {
          toast({
            title: "Erreur d'authentification",
            description:
              "Vous devez être connecté pour effectuer cette action.",
            variant: "destructive",
          });
          return;
        }

        // Créer une nouvelle instance de l'événement
        const newEvent: Omit<Evenement, "id"> = {
          ...event,
          collaborateurId: newCollaborateurId || event.collaborateurId,
          start: newDate || event.start,
          end: new Date(
            newDate.getTime() + (event.end.getTime() - event.start.getTime())
          ),
        };

        // Supprimer l'ID pour forcer la création d'un nouvel événement
        delete (newEvent as any).id;

        // Mettre à jour l'interface utilisateur immédiatement sans attendre l'API
        const tempId = `temp_${
          crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15)
        }`;
        const tempEvent = {
          ...newEvent,
          id: tempId,
        } as Evenement;

        // Ajouter l'événement temporaire à la liste des événements
        setEvents((prevEvents) => [...prevEvents, tempEvent]);

        console.log("Duplication d'événement:", {
          eventData: JSON.stringify(newEvent),
          originalId: event.id,
          newCollaborateurId,
        });

        // Appeler l'API pour créer le nouvel événement
        const response = await fetch("/api/evenements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newEvent),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la duplication de l'événement"
          );
        }

        // Récupérer l'événement créé avec son ID permanent
        const createdEvent = await response.json();

        // Remplacer l'événement temporaire par l'événement permanent
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === tempId
              ? {
                  ...createdEvent,
                  start: new Date(createdEvent.start),
                  end: new Date(createdEvent.end),
                }
              : e
          )
        );

        toast({
          title: "Événement dupliqué",
          description: isCollaborateurChange
            ? "L'événement a été dupliqué pour un autre collaborateur."
            : "L'événement a été dupliqué avec succès.",
        });
      } catch (error) {
        console.error("Erreur lors de la duplication de l'événement:", error);
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la duplication.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast, userRole]
  );

  const handleToggleLock = useCallback(
    async (eventId: string, locked: boolean) => {
      // Simulation de verrouillage/déverrouillage
      toast({
        title: locked ? "Événement verrouillé" : "Événement déverrouillé",
        description: "Simulation de modification du verrouillage.",
      });
    },
    [toast]
  );

  // Filtrer les événements selon les collaborateurs sélectionnés
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) {
      console.log("Aucun événement à filtrer");
      return [];
    }

    console.log(
      `Filtrage de ${events.length} événements pour ${selectedCollaborateurs.length} collaborateurs sélectionnés`
    );

    // Filtrer par collaborateur sélectionné
    const filtered = events.filter(
      (event) =>
        event.collaborateurId &&
        selectedCollaborateurs.includes(event.collaborateurId)
    );

    console.log(`${filtered.length} événements après filtrage`);
    return filtered;
  }, [events, selectedCollaborateurs]);

  // Filtrer les collaborateurs visibles
  const visibleCollaborateurs = useMemo(() => {
    return filteredCollaborateurs;
  }, [filteredCollaborateurs]);

  const eventStyleGetter = useCallback((event: Evenement) => {
    const style = {
      backgroundColor: "#3174ad",
      borderRadius: "4px",
      opacity: 0.8,
      color: "white",
      border: event.verrouille ? "2px solid #6b7280" : "0px",
      display: "block",
    };

    return { style };
  }, []);

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
          {userRole === "admin" && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push("/admin/recap")}
            >
              <FileText className="h-4 w-4" />
              Récapitulatif administratif
            </Button>
          )}
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
            userCollaborateurId={userCollaborateurId || ""}
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
                selectable={userRole === "admin" || userRole === "manager"}
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
