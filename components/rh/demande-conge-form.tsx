"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, differenceInCalendarDays } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { DemandeConge, TypeConge } from "@/lib/conges-types"
import { collaborateurs } from "@/lib/data"

interface DemandeCongeFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (demande: DemandeConge) => void
  demande?: DemandeConge | null
}

export default function DemandeCongeForm({ isOpen, onClose, onSave, demande }: DemandeCongeFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const [dateDebut, setDateDebut] = useState<Date | undefined>(undefined)
  const [dateFin, setDateFin] = useState<Date | undefined>(undefined)
  const [typeConge, setTypeConge] = useState<TypeConge>("Congés payés")
  const [motif, setMotif] = useState("")

  // Fermer le modal quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Vérifier si l'élément cliqué est le modal lui-même ou un de ses enfants
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Vérifier si l'élément cliqué est un élément de popover (calendrier, select, etc.)
        const isPopoverElement = (event.target as Element)?.closest("[data-radix-popper-content-wrapper]")

        // Ne fermer que si ce n'est pas un élément de popover
        if (!isPopoverElement) {
          onClose()
        }
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

  // Réinitialiser le formulaire quand il s'ouvre ou quand la demande change
  useEffect(() => {
    if (demande) {
      setDateDebut(new Date(demande.dateDebut))
      setDateFin(new Date(demande.dateFin))
      setTypeConge(demande.typeConge)
      setMotif(demande.motif)
    } else {
      setDateDebut(undefined)
      setDateFin(undefined)
      setTypeConge("Congés payés")
      setMotif("")
    }
  }, [demande, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (!dateDebut || !dateFin) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner les dates de début et de fin.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (dateDebut > dateFin) {
      toast({
        title: "Erreur de validation",
        description: "La date de début doit être antérieure à la date de fin.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!motif.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez indiquer un motif pour votre demande.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!user || !user.collaborateurId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté et associé à un collaborateur pour faire une demande.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Trouver le nom du collaborateur
    const collaborateur = collaborateurs.find((c) => c.id === user.collaborateurId)
    if (!collaborateur) {
      toast({
        title: "Erreur",
        description: "Collaborateur non trouvé.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Créer la demande
    const nouvelleDemande: DemandeConge = {
      id: demande?.id || String(Date.now()),
      utilisateurId: user.id,
      collaborateurId: user.collaborateurId,
      collaborateurNom: collaborateur.nom,
      dateDebut: dateDebut,
      dateFin: dateFin,
      typeConge: typeConge,
      motif: motif,
      statut: demande?.statut || "En attente",
      commentaireAdmin: demande?.commentaireAdmin,
      dateCreation: demande?.dateCreation || new Date(),
      dateModification: new Date(),
      notificationLue: false,
    }

    // Envoyer la demande
    onSave(nouvelleDemande)
    setIsLoading(false)
    onClose()
  }

  // Calculer le nombre de jours de congés
  const joursDemandes = dateDebut && dateFin ? differenceInCalendarDays(dateFin, dateDebut) + 1 : 0

  // Types de congés disponibles
  const typesConges: TypeConge[] = ["Congés payés", "RTT", "Congé sans solde", "Maladie", "Autre"]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {demande ? "Modifier la demande de congés" : "Nouvelle demande de congés"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Période de congés</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dateDebut" className="text-xs text-muted-foreground">
                    Date de début
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateDebut && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateDebut ? format(dateDebut, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateDebut}
                        onSelect={(date) => {
                          setDateDebut(date)
                          // Si la date de fin n'est pas définie ou est avant la date de début,
                          // définir la date de fin à la date de début
                          if (!dateFin || (date && dateFin < date)) {
                            setDateFin(date)
                          }
                        }}
                        initialFocus
                        locale={fr}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="dateFin" className="text-xs text-muted-foreground">
                    Date de fin
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFin && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFin ? format(dateFin, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFin}
                        onSelect={setDateFin}
                        initialFocus
                        locale={fr}
                        disabled={(date) =>
                          dateDebut ? date < dateDebut : date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
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
              <Select value={typeConge} onValueChange={(value) => setTypeConge(value as TypeConge)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de congés" />
                </SelectTrigger>
                <SelectContent>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
              {isLoading ? "Envoi en cours..." : demande ? "Modifier" : "Envoyer la demande"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
