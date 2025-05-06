"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, X } from "lucide-react"
import { format, differenceInCalendarDays } from "date-fns"
import type { DemandeConge, StatutConge } from "@/lib/conges-types"

interface DetailsCongeModalProps {
  isOpen: boolean
  onClose: () => void
  demande: DemandeConge | null
  commentaireAdmin: string
  setCommentaireAdmin: (value: string) => void
  onUpdateStatut: (demandeId: string, statut: StatutConge) => void
  onModifier: () => void
  userRole?: string
  userId?: string
  getStatusBadgeColor: (statut: StatutConge) => string
}

export default function DetailsCongeModal({
  isOpen,
  onClose,
  demande,
  commentaireAdmin,
  setCommentaireAdmin,
  onUpdateStatut,
  onModifier,
  userRole,
  userId,
  getStatusBadgeColor,
}: DetailsCongeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Fermer le modal quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, onClose])

  // Empêcher le défilement du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen || !demande) return null

  // Formater la date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy")
  }

  // Calculer la durée en jours
  const calculateDuration = (dateDebut: Date, dateFin: Date) => {
    return differenceInCalendarDays(new Date(dateFin), new Date(dateDebut)) + 1
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Détails de la demande de congés</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Collaborateur</h3>
                <p className="text-base font-medium">{demande.collaborateurNom}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
                <Badge className={getStatusBadgeColor(demande.statut)}>{demande.statut}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Période</h3>
                <p className="text-base">
                  Du {formatDate(demande.dateDebut)} au {formatDate(demande.dateFin)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {calculateDuration(demande.dateDebut, demande.dateFin)} jour(s)
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Type de congés</h3>
                <p className="text-base">{demande.typeConge}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Motif</h3>
              <p className="text-base">{demande.motif}</p>
            </div>

            {demande.commentaireAdmin && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Commentaire administratif</h3>
                <div className="bg-muted p-3 rounded-md mt-1">
                  <p className="text-sm">{demande.commentaireAdmin}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span>Créée le: </span>
                <span>{format(new Date(demande.dateCreation), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div>
                <span>Dernière modification: </span>
                <span>{format(new Date(demande.dateModification), "dd/MM/yyyy HH:mm")}</span>
              </div>
            </div>

            {(userRole === "admin" || userRole === "manager") && demande.statut === "En attente" && (
              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-2">Traiter cette demande</h3>

                <div className="flex flex-col space-y-2">
                  <Textarea
                    placeholder="Ajouter un commentaire (optionnel)"
                    rows={2}
                    value={commentaireAdmin}
                    onChange={(e) => setCommentaireAdmin(e.target.value)}
                  />

                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => onUpdateStatut(demande.id, "Refusé")}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Refuser
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => onUpdateStatut(demande.id, "Approuvé")}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {demande && demande.statut === "En attente" && demande.utilisateurId === userId && (
            <Button onClick={onModifier}>Modifier</Button>
          )}
        </div>
      </div>
    </div>
  )
}
