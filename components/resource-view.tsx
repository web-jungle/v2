"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Collaborateur, Evenement, Role } from "@/lib/types";
import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ResourceViewProps {
  events: Evenement[];
  collaborateurs: Collaborateur[];
  date: Date;
  onSelectEvent: (event: Evenement) => void;
  onSelectSlot: (slotInfo: {
    start: Date;
    end: Date;
    collaborateurId: string;
  }) => void;
  onDuplicateEvent: (
    event: Evenement,
    newDate: Date,
    newCollaborateurId?: string,
    isCollaborateurChange?: boolean
  ) => void;
  onToggleLock: (eventId: string, locked: boolean) => void;
  userRole?: Role;
  userCollaborateurId?: string;
}

export default function ResourceView({
  events,
  collaborateurs,
  date,
  onSelectEvent,
  onSelectSlot,
  onDuplicateEvent,
  onToggleLock,
  userRole = "admin",
  userCollaborateurId = "",
}: ResourceViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [draggedEvent, setDraggedEvent] = useState<Evenement | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{
    collaborateurId: string;
    dayIndex: number;
  } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Initialiser la semaine en cours
  useEffect(() => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Lundi de la semaine en cours
    startOfWeek.setHours(0, 0, 0, 0);
    setCurrentWeekStart(startOfWeek);

    // Générer les jours de la semaine
    const days = [];
    for (let i = 0; i < 6; i++) {
      // Lundi à samedi (6 jours)
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [date]);

  // Navigation entre les semaines
  const navigateToPreviousWeek = useCallback(() => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);

    const days = [];
    for (let i = 0; i < 6; i++) {
      const day = new Date(newStart);
      day.setDate(newStart.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [currentWeekStart]);

  const navigateToNextWeek = useCallback(() => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);

    const days = [];
    for (let i = 0; i < 6; i++) {
      const day = new Date(newStart);
      day.setDate(newStart.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [currentWeekStart]);

  // Formater la date pour l'affichage
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }, []);

  // Vérifier si un événement est pour un collaborateur et un jour spécifique
  const getEventsForCollaboratorAndDay = useCallback(
    (collaborateurId: string, day: Date) => {
      return events.filter((event) => {
        const eventDate = new Date(event.start);
        return (
          event.collaborateurId === collaborateurId &&
          eventDate.getDate() === day.getDate() &&
          eventDate.getMonth() === day.getMonth() &&
          eventDate.getFullYear() === day.getFullYear()
        );
      });
    },
    [events]
  );

  // Formater l'heure pour l'affichage
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Gérer le clic sur une cellule vide
  const handleCellClick = useCallback(
    (collaborateurId: string, day: Date) => {
      // Vérifier si l'utilisateur a le droit de créer un événement pour ce collaborateur
      const canCreate =
        userRole === "admin" ||
        userRole === "manager" ||
        (userRole === "collaborateur" &&
          collaborateurId === userCollaborateurId);

      if (canCreate) {
        const start = new Date(day);
        start.setHours(8, 0, 0, 0);
        const end = new Date(day);
        end.setHours(17, 0, 0, 0);
        onSelectSlot({ start, end, collaborateurId });
      }
    },
    [userRole, userCollaborateurId, onSelectSlot]
  );

  // Gérer le verrouillage/déverrouillage d'un événement
  const handleToggleLock = useCallback(
    (event: Evenement, e: React.MouseEvent) => {
      e.stopPropagation();
      // Seul l'administrateur peut verrouiller/déverrouiller un événement
      if (userRole === "admin") {
        onToggleLock(event.id, !event.verrouille);
      }
    },
    [userRole, onToggleLock]
  );

  // Obtenir la couleur de fond pour un type d'absence
  const getAbsenceBackgroundColor = useCallback((typeAbsence?: string) => {
    switch (typeAbsence) {
      case "RTT":
        return "bg-orange-500/20";
      case "CP":
        return "bg-green-500/20";
      case "Accident Travail":
      case "Arrêt Travail":
        return "bg-red-500/20";
      default:
        return "bg-purple-500/20";
    }
  }, []);

  // Obtenir la couleur de texte pour un type d'absence
  const getAbsenceTextColor = useCallback((typeAbsence?: string) => {
    switch (typeAbsence) {
      case "RTT":
        return "text-orange-800";
      case "CP":
        return "text-green-800";
      case "Accident Travail":
      case "Arrêt Travail":
        return "text-red-800";
      default:
        return "text-purple-800";
    }
  }, []);

  // Fonctions pour le glisser-déposer
  const handleDragStart = useCallback(
    (event: Evenement) => {
      // Ne pas permettre de glisser un événement verrouillé
      if (event.verrouille) return;

      // Vérifier si l'utilisateur a le droit de déplacer cet événement
      const canDrag =
        userRole === "admin" ||
        userRole === "manager" ||
        (userRole === "collaborateur" &&
          userCollaborateurId &&
          event.collaborateurId === userCollaborateurId);

      if (canDrag) {
        setDraggedEvent(event);
      }
    },
    [userRole, userCollaborateurId]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, collaborateurId: string, dayIndex: number) => {
      e.preventDefault();
      setDragOverCell({ collaborateurId, dayIndex });
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverCell(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, collaborateurId: string, day: Date) => {
      e.preventDefault();
      setDragOverCell(null);

      if (draggedEvent) {
        // Vérifier si l'utilisateur a le droit de déposer sur ce collaborateur
        const canDrop =
          userRole === "admin" ||
          userRole === "manager" ||
          (userRole === "collaborateur" &&
            collaborateurId === userCollaborateurId);

        if (canDrop) {
          // Vérifier si nous avons changé de collaborateur
          const isCollaborateurChange =
            draggedEvent.collaborateurId !== collaborateurId;

          // Créer une nouvelle date pour l'événement qui conserve l'heure originale
          const originalHours = draggedEvent.start.getHours();
          const originalMinutes = draggedEvent.start.getMinutes();
          const newStart = new Date(day);
          newStart.setHours(originalHours, originalMinutes, 0, 0);

          console.log("Drag & drop:", {
            event: draggedEvent.id,
            from: draggedEvent.collaborateurId,
            to: collaborateurId,
            isCollaborateurChange,
            originalDate: draggedEvent.start,
            newDate: newStart,
          });

          // Dupliquer l'événement avec la nouvelle date et éventuellement le nouveau collaborateur
          onDuplicateEvent(
            draggedEvent,
            newStart,
            collaborateurId,
            isCollaborateurChange
          );
        }
      }

      setDraggedEvent(null);
    },
    [draggedEvent, userRole, userCollaborateurId, onDuplicateEvent]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Semaine du{" "}
          {currentWeekStart.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={navigateToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToNextWeek}>
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table ref={tableRef} className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-2 w-40">Collaborateur</th>
                  {weekDays.map((day, index) => (
                    <th key={index} className="border p-2 text-center">
                      {formatDate(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {collaborateurs.map((collaborateur) => (
                  <tr key={collaborateur.id}>
                    <td
                      className="border p-2 font-medium"
                      style={{ color: collaborateur.couleur }}
                    >
                      {collaborateur.nom}
                    </td>
                    {weekDays.map((day, dayIndex) => {
                      const eventsForDay = getEventsForCollaboratorAndDay(
                        collaborateur.id,
                        day
                      );

                      // Vérifier si l'utilisateur peut interagir avec cette cellule
                      const canInteract =
                        userRole === "admin" ||
                        userRole === "manager" ||
                        (userRole === "collaborateur" &&
                          collaborateur.id === userCollaborateurId);

                      const isHighlighted =
                        dragOverCell?.collaborateurId === collaborateur.id &&
                        dragOverCell?.dayIndex === dayIndex;

                      return (
                        <td
                          key={dayIndex}
                          className={`border p-1 align-top h-24 relative ${
                            canInteract && eventsForDay.length === 0
                              ? "cursor-pointer hover:bg-muted/20"
                              : ""
                          } ${isHighlighted ? "bg-blue-100" : ""}`}
                          onClick={() =>
                            canInteract && eventsForDay.length === 0
                              ? handleCellClick(collaborateur.id, day)
                              : null
                          }
                          onDragOver={(e) =>
                            canInteract &&
                            handleDragOver(e, collaborateur.id, dayIndex)
                          }
                          onDragLeave={() => canInteract && handleDragLeave()}
                          onDrop={(e) =>
                            canInteract && handleDrop(e, collaborateur.id, day)
                          }
                        >
                          {eventsForDay.length > 0 ? (
                            <div className="space-y-1">
                              {eventsForDay.map((event) => {
                                // Vérifier si l'utilisateur peut modifier cet événement
                                const canEdit =
                                  (userRole === "admin" ||
                                    userRole === "manager" ||
                                    (userRole === "collaborateur" &&
                                      userCollaborateurId &&
                                      event.collaborateurId ===
                                        userCollaborateurId)) &&
                                  !event.verrouille;

                                return (
                                  <div
                                    key={event.id}
                                    className={`p-1 rounded text-xs group relative ${
                                      canEdit
                                        ? "cursor-pointer hover:bg-muted/50"
                                        : ""
                                    } transition-colors ${
                                      event.typeEvenement === "absence"
                                        ? getAbsenceBackgroundColor(
                                            event.typeAbsence
                                          )
                                        : `bg-[${collaborateur.couleur}20]`
                                    } ${
                                      event.verrouille
                                        ? "border border-gray-400"
                                        : ""
                                    }`}
                                    style={
                                      event.typeEvenement === "presence"
                                        ? {
                                            backgroundColor: `${collaborateur.couleur}20`,
                                          }
                                        : {}
                                    }
                                    onClick={(e) => {
                                      if (canInteract) {
                                        e.stopPropagation();
                                        onSelectEvent(event);
                                      }
                                    }}
                                    draggable={canEdit}
                                    onDragStart={() =>
                                      canEdit && handleDragStart(event)
                                    }
                                  >
                                    {/* Bouton de verrouillage (uniquement pour les admins) */}
                                    {userRole === "admin" && (
                                      <button
                                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) =>
                                          handleToggleLock(event, e)
                                        }
                                        title={
                                          event.verrouille
                                            ? "Déverrouiller l'événement"
                                            : "Verrouiller l'événement"
                                        }
                                      >
                                        {event.verrouille ? (
                                          <Lock className="h-3 w-3 text-red-500" />
                                        ) : (
                                          <Unlock className="h-3 w-3 text-gray-500" />
                                        )}
                                      </button>
                                    )}

                                    {event.typeEvenement === "presence" ? (
                                      <>
                                        <div className="font-medium">
                                          {event.lieuChantier}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {formatTime(event.start)} -{" "}
                                          {formatTime(event.end)}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {event.grandDeplacement && (
                                            <span className="bg-blue-100 text-blue-800 px-1 rounded">
                                              GD
                                            </span>
                                          )}
                                          {event.panierRepas && (
                                            <span className="bg-green-100 text-green-800 px-1 rounded">
                                              PR
                                            </span>
                                          )}
                                          {event.prgd && (
                                            <span className="bg-purple-100 text-purple-800 px-1 rounded">
                                              PRGD: {event.nombrePrgd || 0}
                                            </span>
                                          )}
                                          {(event.heuresSupplementaires || 0) >
                                            0 && (
                                            <span className="bg-orange-100 text-orange-800 px-1 rounded">
                                              HS:{" "}
                                              {event.heuresSupplementaires || 0}
                                              h
                                            </span>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div
                                          className={`font-medium ${
                                            event.typeAbsence
                                              ? getAbsenceTextColor(
                                                  event.typeAbsence
                                                )
                                              : ""
                                          }`}
                                        >
                                          {event.typeAbsence}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {formatTime(event.start)} -{" "}
                                          {formatTime(event.end)}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            canInteract && <div className="h-full w-full"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
