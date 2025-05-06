"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import type { Collaborateur, Evenement, Role } from "@/lib/types"
import { entreprises } from "@/lib/types"
import { endOfWeek, format, getDay, parse, startOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import { Building, CalendarIcon, Loader2, Users } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import EnterpriseSelector from "./enterprise-selector"
import EventModal from "./event-modal"
import EventTypeSelector from "./event-type-selector"
import ExportExcel from "./export-excel"
import ExportPDF from "./export-pdf"
import Legend from "./legend"
import MultiSelectCollaborateurs from "./multi-select-collaborateurs"
import ResourceView from "./resource-view"

// Configuration du localisateur pour date-fns
const locales = {
  fr: fr,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: any) => startOfWeek(date, { locale: fr }),
  getDay,
  locales,
})

interface PlanningProps {
  userRole: Role
  userCollaborateurId?: string
  user?: any
}

// Fonction utilitaire pour formater une date pour l'URL
const formatDateForUrl = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export default function Planning({ userRole, userCollaborateurId, user }: PlanningProps) {
  const [events, setEvents] = useState<Evenement[]>([])
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([])
  const [view, setView] = useState("ressources") // Par défaut, on utilise la vue ressources
  const [date, setDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null)
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(null)
  const [selectedCollaborateurs, setSelectedCollaborateurs] = useState<string[]>(
    userRole === "collaborateur" && userCollaborateurId ? [userCollaborateurId] : [],
  )
  const [tempSlotInfo, setTempSlotInfo] = useState<{ start: Date; end: Date; collaborateurId?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Nouveau state pour déclencher le rafraîchissement
  const { toast } = useToast()

  // Charger les collaborateurs depuis l'API
  useEffect(() => {
    const fetchCollaborateurs = async () => {
      try {
        const response = await fetch('/api/collaborateurs');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des collaborateurs');
        }
        
        const data = await response.json();
        setCollaborateurs(data);
        
        // Initialiser les collaborateurs sélectionnés
        if (selectedCollaborateurs.length === 0) {
          setSelectedCollaborateurs(
            userRole === "collaborateur" && userCollaborateurId 
              ? [userCollaborateurId] 
              : data.map((c: Collaborateur) => c.id)
          );
        }
      } catch (error) {
        console.error("Erreur lors du chargement des collaborateurs:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les collaborateurs.",
          variant: "destructive",
        });
      }
    };
    
    fetchCollaborateurs();
  }, [userRole, userCollaborateurId, selectedCollaborateurs.length, toast]);

  // Charger les événements depuis l'API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Calculer la plage de dates pour le filtre
        const startDateObj = startOfWeek(date, { locale: fr });
        const endDateObj = endOfWeek(date, { locale: fr });
        
        // Construire l'URL avec les filtres
        let url = `/api/evenements?startDate=${formatDateForUrl(startDateObj)}&endDate=${formatDateForUrl(endDateObj)}`;
        
        // Ajouter le filtre par collaborateur si nécessaire
        if (userRole === "collaborateur" && userCollaborateurId) {
          url += `&collaborateurId=${userCollaborateurId}`;
        }
        
        console.log("Requête URL événements:", url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des événements');
        }
        
        const data = await response.json();
        console.log("Événements récupérés:", data.length, data);
        
        // Formater les dates et harmoniser les propriétés
        const formattedEvents = data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          // Assurer la compatibilité en ajoutant collaborateur_id s'il n'existe pas
          collaborateur_id: event.collaborateurId
        }));
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Erreur lors du chargement des événements:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les événements.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [date, userRole, userCollaborateurId, toast, refreshTrigger]);

  // Calculer le début de la semaine en cours
  const currentWeekStart = useMemo(() => {
    const startOfWeekk = startOfWeek(date, { locale: fr })
    return startOfWeekk
  }, [date])

  // Fonction pour forcer le rafraîchissement des données
  const refreshData = useCallback(() => {
    // Incrémenter refreshTrigger pour déclencher le re-fetch des données
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Si l'utilisateur est un collaborateur, il ne peut voir que son propre planning
  const canFilterCollaborateurs = userRole === "admin" || userRole === "manager"

  // Filtrer les collaborateurs par entreprise
  const filteredCollaborateurs = useMemo(() => {
    return selectedEnterprise ? collaborateurs.filter((c) => c.entreprise === selectedEnterprise) : collaborateurs
  }, [selectedEnterprise, collaborateurs])

  // Mettre à jour les collaborateurs sélectionnés lorsque l'entreprise change
  const handleEnterpriseChange = useCallback(
    (enterprise: string | null) => {
      setSelectedEnterprise(enterprise)

      if (userRole === "collaborateur" && userCollaborateurId) {
        // Si l'utilisateur est un collaborateur, il ne peut voir que son propre planning
        setSelectedCollaborateurs([userCollaborateurId])
      } else if (enterprise) {
        // Sélectionner tous les collaborateurs de l'entreprise choisie
        const collaborateursIds = collaborateurs.filter((c) => c.entreprise === enterprise).map((c) => c.id)
        setSelectedCollaborateurs(collaborateursIds)
      } else {
        // Sélectionner tous les collaborateurs si aucune entreprise n'est choisie
        setSelectedCollaborateurs(collaborateurs.map((c) => c.id))
      }
    },
    [userRole, userCollaborateurId, collaborateurs],
  )

  const handleSelectEvent = useCallback(
    (event: Evenement) => {
      // Vérifier les droits d'accès pour la modification
      const canEdit =
        (userRole === "admin" ||
          userRole === "manager" ||
          (userRole === "collaborateur" && (event.collaborateur_id) === userCollaborateurId)) &&
        !event.verrouille

      // Si l'événement est verrouillé, seul l'admin peut le voir en détail
      if (event.verrouille && userRole !== "admin") {
        toast({
          title: "Événement verrouillé",
          description: "Cet événement a été verrouillé par un administrateur et ne peut pas être modifié.",
          variant: "destructive",
        })
        return
      }

      setSelectedEvent(event)
      setIsModalOpen(true)
    },
    [userRole, userCollaborateurId, toast],
  )

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; collaborateurId?: string }) => {
      // Si l'utilisateur est un collaborateur, il ne peut ajouter que pour lui-même
      if (userRole === "collaborateur" && userCollaborateurId) {
        if (slotInfo.collaborateurId && slotInfo.collaborateurId !== userCollaborateurId) {
          return // Ne pas permettre la création pour un autre collaborateur
        }
        slotInfo.collaborateurId = userCollaborateurId
      }

      // Stocker temporairement les informations du créneau
      setTempSlotInfo(slotInfo)
      // Ouvrir le sélecteur de type d'événement
      setIsTypeSelectorOpen(true)
    },
    [userRole, userCollaborateurId],
  )

  const handleSelectEventType = useCallback(
    (type: "presence" | "absence") => {
      if (!tempSlotInfo) return

      // Déterminer les heures par défaut en fonction du collaborateur
      let startTime = tempSlotInfo.start
      let endTime = tempSlotInfo.end

      // Si un collaborateur est spécifié, appliquer les heures par défaut selon l'entreprise
      if (tempSlotInfo.collaborateurId) {
        const collaborateur = collaborateurs.find((c) => c.id === tempSlotInfo.collaborateurId)
        if (collaborateur) {
          const entreprise = collaborateur.entreprise
          const isFriday = tempSlotInfo.start.getDay() === 5 // 5 = vendredi

          // Définir les heures par défaut selon l'entreprise
          if (entreprise === "ORIZON TELECOM" || entreprise === "ORIZON GROUP") {
            startTime = new Date(tempSlotInfo.start)
            startTime.setHours(8, 30, 0, 0)

            endTime = new Date(tempSlotInfo.start)
            if (isFriday) {
              endTime.setHours(16, 30, 0, 0)
            } else {
              endTime.setHours(17, 0, 0, 0)
            }
          } else if (entreprise === "ORIZON INSTALLATION") {
            startTime = new Date(tempSlotInfo.start)
            startTime.setHours(7, 30, 0, 0)

            endTime = new Date(tempSlotInfo.start)
            endTime.setHours(15, 30, 0, 0)
          } else if (entreprise === "YELLEEN") {
            startTime = new Date(tempSlotInfo.start)
            startTime.setHours(7, 30, 0, 0)

            endTime = new Date(tempSlotInfo.start)
            if (isFriday) {
              endTime.setHours(15, 30, 0, 0)
            } else {
              endTime.setHours(16, 30, 0, 0)
            }
          }
        }
      }

      // Forcer le type à être "absence" ou "presence"
      const eventType = type === "absence" ? "absence" : "presence";
      
      // Créer un nouvel événement avec le type sélectionné
      const newEvent = {
        id: String(new Date().getTime()),
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
      setIsTypeSelectorOpen(false)
      setIsModalOpen(true)
    },
    [tempSlotInfo, collaborateurs],
  )

  const handleSaveEvent = useCallback(
    async (event: Evenement) => {
      // Vérifier si l'événement est verrouillé
      if (event.verrouille && userRole !== "admin") {
        toast({
          title: "Événement verrouillé",
          description: "Cet événement a été verrouillé par un administrateur et ne peut pas être modifié.",
          variant: "destructive",
        })
        return
      }

      // Vérifier les droits d'accès pour la sauvegarde
      const canSave =
        userRole === "admin" ||
        userRole === "manager" ||
        (userRole === "collaborateur" && event.collaborateur_id === userCollaborateurId)

      if (!canSave) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits pour modifier cet événement.",
          variant: "destructive",
        })
        return
      }

      try {
        if (selectedEvent && events.find((e) => e.id === event.id)) {
          // Mise à jour d'un événement existant
          
          // Mettre à jour l'état local immédiatement pour une UI réactive
          setEvents(events.map((e) => (e.id === event.id ? {
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          } : e)));
          
          // Envoyer les modifications à l'API
          const response = await fetch(`/api/evenements/${event.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour de l\'événement');
          }

          const updatedEvent = await response.json();
          
          // Mettre à jour à nouveau l'état avec les données du serveur (au cas où)
          setEvents(prevEvents => prevEvents.map((e) => (e.id === event.id ? {
            ...updatedEvent,
            start: new Date(updatedEvent.start),
            end: new Date(updatedEvent.end),
            collaborateur_id: updatedEvent.collaborateurId || updatedEvent.collaborateur_id
          } : e)));
          
          toast({
            title: "Événement mis à jour",
            description: "L'événement a été mis à jour avec succès.",
          });
        } else {
          // Création d'un nouvel événement
          
          // Créer un ID temporaire pour l'affichage immédiat
          const tempEvent = {
            ...event,
            id: event.id || String(new Date().getTime()),
            start: new Date(event.start),
            end: new Date(event.end),
          };
          
          // Ajouter immédiatement l'événement à l'état local pour une UI réactive
          setEvents(prevEvents => [...prevEvents, tempEvent]);
          
          // Envoyer les données à l'API
          const response = await fetch('/api/evenements', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          });

          if (!response.ok) {
            // En cas d'erreur, retirer l'événement temporaire de l'état
            setEvents(prevEvents => prevEvents.filter(e => e.id !== tempEvent.id));
            throw new Error('Erreur lors de la création de l\'événement');
          }

          const newEvent = await response.json();
          
          // Remplacer l'événement temporaire par celui retourné par l'API
          setEvents(prevEvents => prevEvents.map(e => 
            e.id === tempEvent.id 
              ? {
                  ...newEvent,
                  start: new Date(newEvent.start),
                  end: new Date(newEvent.end),
                  collaborateur_id: newEvent.collaborateurId || newEvent.collaborateur_id
                }
              : e
          ));
          
          toast({
            title: "Événement créé",
            description: "L'événement a été créé avec succès.",
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'événement:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer l'événement.",
          variant: "destructive",
        });
      }

      setIsModalOpen(false)
      setSelectedEvent(null)
    },
    [events, selectedEvent, userRole, userCollaborateurId, toast],
  )

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      const eventToDelete = events.find((e) => e.id === eventId)

      // Vérifier si l'événement est verrouillé
      if (eventToDelete?.verrouille && userRole !== "admin") {
        toast({
          title: "Événement verrouillé",
          description: "Cet événement a été verrouillé par un administrateur et ne peut pas être supprimé.",
          variant: "destructive",
        })
        return
      }

      // Vérifier les droits d'accès pour la suppression
      const canDelete =
        userRole === "admin" ||
        userRole === "manager" ||
        (userRole === "collaborateur" && eventToDelete?.collaborateur_id === userCollaborateurId)

      if (!canDelete) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits pour supprimer cet événement.",
          variant: "destructive",
        })
        return
      }

      // Supprimer localement pour une UI réactive
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));

      try {
        const response = await fetch(`/api/evenements/${eventId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // En cas d'erreur, restaurer l'événement
          if (eventToDelete) {
            setEvents(prevEvents => [...prevEvents, eventToDelete]);
          }
          throw new Error('Erreur lors de la suppression de l\'événement');
        }
        
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

      setIsModalOpen(false)
      setSelectedEvent(null)
    },
    [events, userRole, userCollaborateurId, toast],
  )

  // Fonction pour dupliquer un événement
  const handleDuplicateEvent = useCallback(
    (event: Evenement, newDate: Date, newCollaborateurId?: string, isCollaborateurChange: boolean = false) => {
      // Vérifier si l'événement est verrouillé
      if (event.verrouille) {
        toast({
          title: "Événement verrouillé",
          description: "Cet événement a été verrouillé par un administrateur et ne peut pas être dupliqué.",
          variant: "destructive",
        })
        return
      }

      // Vérifier les droits d'accès pour la duplication
      const canDuplicate =
        userRole === "admin" ||
        userRole === "manager" ||
        (userRole === "collaborateur" && event.collaborateur_id === userCollaborateurId)

      if (!canDuplicate) return

      // Vérifier si un événement existe déjà pour ce collaborateur et cette date
      const existingEvent = events.find((e) => {
        const eDate = e.start
        const targetDate = newDate
        return (
          (e.collaborateurId === (newCollaborateurId || event.collaborateur_id)) &&
          eDate.getDate() === targetDate.getDate() &&
          eDate.getMonth() === targetDate.getMonth() &&
          eDate.getFullYear() === targetDate.getFullYear()
        )
      })

      if (existingEvent) {
        toast({
          title: "Événement existant",
          description: "Un événement existe déjà pour ce collaborateur à cette date.",
          variant: "destructive",
        })
        return
      }

      // Créer une copie de l'événement avec un nouvel ID
      const startTime = event.start.getHours() * 60 + event.start.getMinutes()
      const endTime = event.end.getHours() * 60 + event.end.getMinutes()

      const newStart = new Date(newDate)
      newStart.setHours(Math.floor(startTime / 60), startTime % 60)

      const newEnd = new Date(newDate)
      newEnd.setHours(Math.floor(endTime / 60), endTime % 60)

      // Cas normal: duplication d'événement
      const duplicatedEvent: Evenement = {
        ...event,
        id: String(new Date().getTime()),
        start: newStart,
        end: newEnd,
        collaborateur_id: newCollaborateurId || event.collaborateur_id,
        collaborateurId: newCollaborateurId || event.collaborateur_id, // Pour compatibilité
        verrouille: false, // L'événement dupliqué n'est pas verrouillé par défaut
      }

      // Mettre à jour le titre si nécessaire
      if (duplicatedEvent.title && duplicatedEvent.collaborateur_id !== event.collaborateur_id) {
        const collaborateur = collaborateurs.find((c) => c.id === duplicatedEvent.collaborateur_id)
        if (collaborateur) {
          if (duplicatedEvent.type_evenement === "presence") {
            duplicatedEvent.title = `${collaborateur.nom} - ${duplicatedEvent.lieu_chantier}`
          } else if (duplicatedEvent.typeEvenement === "presence") {
            duplicatedEvent.title = `${collaborateur.nom} - ${duplicatedEvent.lieuChantier}`
          } else if (duplicatedEvent.type_evenement === "absence") {
            duplicatedEvent.title = `${collaborateur.nom} - ${duplicatedEvent.type_absence}`
          } else if (duplicatedEvent.typeEvenement === "absence") {
            duplicatedEvent.title = `${collaborateur.nom} - ${duplicatedEvent.typeAbsence}`
          }
        }
      }

      // Ajouter immédiatement l'événement dupliqué à l'état local
      setEvents(prevEvents => [...prevEvents, duplicatedEvent]);

      // Envoyer les données à l'API
      const createDuplicatedEvent = async () => {
        try {
          const response = await fetch('/api/evenements', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(duplicatedEvent),
          });

          if (!response.ok) {
            // En cas d'erreur, retirer l'événement dupliqué de l'état
            setEvents(prevEvents => prevEvents.filter(e => e.id !== duplicatedEvent.id));
            throw new Error('Erreur lors de la duplication de l\'événement');
          }

          const savedEvent = await response.json();
          
          // Mettre à jour l'événement local avec les données du serveur
          setEvents(prevEvents => prevEvents.map(e => 
            e.id === duplicatedEvent.id 
              ? {
                  ...savedEvent,
                  start: new Date(savedEvent.start),
                  end: new Date(savedEvent.end),
                  collaborateur_id: savedEvent.collaborateurId || savedEvent.collaborateur_id
                }
              : e
          ));
          
          const message = isCollaborateurChange 
            ? "Événement dupliqué pour le collaborateur" 
            : "Événement dupliqué";
            
          toast({
            title: message,
            description: isCollaborateurChange 
              ? "L'événement a été dupliqué pour le nouveau collaborateur." 
              : "L'événement a été dupliqué avec succès.",
          });
        } catch (error) {
          console.error("Erreur lors de la duplication de l'événement:", error);
          toast({
            title: "Erreur",
            description: "Impossible de dupliquer l'événement.",
            variant: "destructive",
          });
        }
      };

      createDuplicatedEvent();
    },
    [events, userRole, userCollaborateurId, collaborateurs, toast],
  )

  // Fonction pour verrouiller/déverrouiller un événement
  const handleToggleLock = useCallback(
    async (eventId: string, locked: boolean) => {
      // Seul l'administrateur peut verrouiller/déverrouiller un événement
      if (userRole !== "admin") {
        toast({
          title: "Action non autorisée",
          description: "Seul un administrateur peut verrouiller ou déverrouiller un événement.",
          variant: "destructive",
        })
        return
      }

      const eventToUpdate = events.find(e => e.id === eventId);
      if (!eventToUpdate) return;

      // Mettre à jour l'état local immédiatement
      setEvents(prevEvents => prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, verrouille: locked } 
          : event
      ));

      try {
        // Mettre à jour l'événement via l'API
        const response = await fetch(`/api/evenements/${eventId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...eventToUpdate,
            verrouille: locked
          }),
        });

        if (!response.ok) {
          // Restaurer l'état précédent en cas d'erreur
          setEvents(prevEvents => prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, verrouille: !locked } 
              : event
          ));
          throw new Error('Erreur lors de la mise à jour du verrouillage');
        }
        
        toast({
          title: locked ? "Événement verrouillé" : "Événement déverrouillé",
          description: locked
            ? "L'événement a été verrouillé et ne peut plus être modifié."
            : "L'événement a été déverrouillé et peut maintenant être modifié.",
        });
      } catch (error) {
        console.error("Erreur lors du verrouillage/déverrouillage:", error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier le verrouillage.",
          variant: "destructive",
        });
      }
    },
    [events, userRole, toast],
  )

  // Filtrer les événements selon les collaborateurs sélectionnés
  const filteredEvents = useMemo(() => {
    // Ajout d'une vérification pour comprendre la structure des événements
    if (events.length > 0) {
      console.log("Propriétés d'un événement:", Object.keys(events[0]));
    }
    
    // Utiliser la propriété collaborateur_id qui est définie dans le type Evenement
    return events.filter((event) => selectedCollaborateurs.includes(event.collaborateur_id));
  }, [events, selectedCollaborateurs])

  // Ajouter un log pour vérifier les événements filtrés
  useEffect(() => {
    console.log("Événements filtrés:", filteredEvents.length, selectedCollaborateurs);
  }, [filteredEvents, selectedCollaborateurs]);

  // Filtrer les collaborateurs visibles pour un utilisateur de type "collaborateur"
  const visibleCollaborateurs = useMemo(() => {
    if (userRole === "collaborateur" && userCollaborateurId) {
      return collaborateurs.filter((c) => c.id === userCollaborateurId)
    } else if (userRole === "manager" && user?.collaborateursGeres?.length) {
      // Si c'est un manager, il ne voit que les collaborateurs qu'il gère
      return collaborateurs.filter((c) => user.collaborateursGeres?.includes(c.id))
    } else {
      // Admin voit tout
      return filteredCollaborateurs
    }
  }, [userRole, userCollaborateurId, filteredCollaborateurs, user?.collaborateursGeres])

  const eventStyleGetter = useCallback((event: Evenement) => {
    const collaborateur = collaborateurs.find((c) => c.id === event.collaborateur_id)
    let backgroundColor = collaborateur?.couleur || "#3174ad"

    // Couleurs différentes pour les absences
    if (event.typeEvenement === "absence") {
      switch (event.typeAbsence) {
        case "RTT":
          backgroundColor = "#f97316" // orange
          break
        case "CP":
          backgroundColor = "#22c55e" // green
          break
        case "Accident Travail":
        case "Arrêt Travail":
          backgroundColor = "#ef4444" // red
          break
        default:
          backgroundColor = "#a855f7" // purple
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
    }

    return { style }
  }, [])

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
  ]
  const currentMonth = monthNames[new Date().getMonth()]
  const currentYear = new Date().getFullYear()

  // Afficher un état de chargement si les données ne sont pas encore chargées
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du planning...</p>
        </div>
      </div>
    )
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
            setView(value)
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
          {selectedEnterprise && <span className="ml-2 text-muted-foreground">({selectedEnterprise})</span>}
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
            collaborateurs={visibleCollaborateurs.filter((c) => selectedCollaborateurs.includes(c.id))}
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
                onView={(newView) => setView(newView === Views.WEEK ? "semaine" : "mois")}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable={userRole !== "collaborateur" || !!userCollaborateurId}
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
            setIsModalOpen(false)
            setSelectedEvent(null)
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
  )
}
