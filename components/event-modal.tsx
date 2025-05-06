"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateDistance, determineZoneTrajet, SIEGE_SOCIAL } from "@/lib/geo-utils"
import type { Collaborateur, Evenement, GeocodingResult, Role, TypeAbsence } from "@/lib/types"
import { AlertCircle, Info, Lock, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import AddressSearch from "./address-search"

// Définir une interface pour le formulaire qui utilise uniquement les propriétés camelCase
interface FormData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  collaborateurId: string;
  typeEvenement: string;
  lieuChantier: string;
  zoneTrajet: string;
  panierRepas: boolean;
  ticketRestaurant: boolean;
  heuresSupplementaires: number;
  grandDeplacement: boolean;
  prgd: boolean;
  nombrePrgd: number;
  typeAbsence?: string;
  verrouille: boolean;
  latitude?: number;
  longitude?: number;
  adresseComplete?: string;
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event: Evenement | null
  onSave: (event: Evenement) => void
  onDelete: (eventId: string) => void
  collaborateurs: Collaborateur[]
  userRole?: Role
  userCollaborateurId?: string
}

export default function EventModal({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  collaborateurs,
  userRole = "admin",
  userCollaborateurId,
}: EventModalProps) {
  // Utiliser FormData pour le formulaire
  const [formData, setFormData] = useState<FormData>({
    id: "",
    title: "",
    start: new Date(),
    end: new Date(),
    collaborateurId: "",
    typeEvenement: "presence",
    lieuChantier: "",
    zoneTrajet: "",
    panierRepas: false,
    heuresSupplementaires: 0,
    grandDeplacement: false,
    prgd: false,
    nombrePrgd: 0,
    ticketRestaurant: false,
    verrouille: false,
  })

  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null)
  const [calculatedZone, setCalculatedZone] = useState<string | null>(null)
  const [showMutuallyExclusiveWarning, setShowMutuallyExclusiveWarning] = useState(false)

  // Vérifier si l'événement est verrouillé
  const isLocked = formData.verrouille

  // Vérifier si l'utilisateur peut modifier cet événement
  const canEdit =
    (userRole === "admin" ||
      userRole === "manager" ||
      (userRole === "collaborateur" && formData.collaborateurId === userCollaborateurId)) &&
    !isLocked

  // Vérifier si l'utilisateur peut choisir le collaborateur
  const canSelectCollaborateur = (userRole === "admin" || userRole === "manager") && !isLocked

  useEffect(() => {
    if (event) {
      // Si c'est un événement existant, utiliser ses valeurs
      // Déterminer le type d'événement (présence ou absence)
      const eventType = (event.typeEvenement === "absence") ? "absence" : "presence";
      
      // Convertir les données au format camelCase
      const formDataWithEvent: FormData = {
        id: event.id,
        title: event.title || "",
        start: new Date(event.start),
        end: new Date(event.end),
        collaborateurId: event.collaborateurId || (userRole === "collaborateur" && userCollaborateurId ? userCollaborateurId : ""),
        typeEvenement: eventType,
        lieuChantier: event.lieuChantier || "",
        zoneTrajet: event.zoneTrajet || "",
        panierRepas: Boolean(event.panierRepas),
        heuresSupplementaires: Number(event.heuresSupplementaires || 0),
        grandDeplacement: Boolean(event.grandDeplacement),
        prgd: Boolean(event.prgd),
        nombrePrgd: Number(event.nombrePrgd || 0),
        ticketRestaurant: Boolean(event.ticketRestaurant),
        typeAbsence: event.typeAbsence,
        verrouille: Boolean(event.verrouille),
        latitude: event.latitude,
        longitude: event.longitude,
        adresseComplete: event.adresseComplete,
      };
      
      setFormData(formDataWithEvent);

      // Calculer la distance et la zone si les coordonnées sont disponibles
      if (event.latitude && event.longitude) {
        const distance = calculateDistance(
          SIEGE_SOCIAL.latitude,
          SIEGE_SOCIAL.longitude,
          event.latitude,
          event.longitude,
        )
        setCalculatedDistance(distance)
        setCalculatedZone(determineZoneTrajet(distance))
      } else {
        setCalculatedDistance(null)
        setCalculatedZone(null)
      }
    } else {
      // Pour un nouvel événement
      const initialCollaborateurId = userRole === "collaborateur" && userCollaborateurId ? userCollaborateurId : ""

      // Créer un nouvel événement avec les valeurs par défaut
      const newEvent: FormData = {
        id: String(new Date().getTime()),
        title: "",
        start: new Date(),
        end: new Date(),
        collaborateurId: initialCollaborateurId,
        typeEvenement: "presence",
        lieuChantier: "",
        zoneTrajet: "",
        panierRepas: false,
        heuresSupplementaires: 0,
        grandDeplacement: false,
        prgd: false,
        nombrePrgd: 0,
        ticketRestaurant: false,
        verrouille: false,
      }

      // Appliquer les heures par défaut si un collaborateur est sélectionné
      if (initialCollaborateurId) {
        const collaborateur = collaborateurs.find((c) => c.id === initialCollaborateurId)
        if (collaborateur) {
          const entreprise = collaborateur.entreprise
          const today = new Date()
          const isFriday = today.getDay() === 5 // 5 = vendredi

          let startHour = 8,
            startMinute = 0,
            endHour = 17,
            endMinute = 0

          if (entreprise === "ORIZON TELECOM" || entreprise === "ORIZON GROUP") {
            startHour = 8
            startMinute = 30

            if (isFriday) {
              endHour = 16
              endMinute = 30
            } else {
              endHour = 17
              endMinute = 0
            }
          } else if (entreprise === "ORIZON INSTALLATION") {
            startHour = 7
            startMinute = 30
            endHour = 15
            endMinute = 30
          } else if (entreprise === "YELLEEN") {
            startHour = 7
            startMinute = 30

            if (isFriday) {
              endHour = 15
              endMinute = 30
            } else {
              endHour = 16
              endMinute = 30
            }
          }

          const newStart = new Date()
          newStart.setHours(startHour, startMinute, 0, 0)

          const newEnd = new Date()
          newEnd.setHours(endHour, endMinute, 0, 0)

          newEvent.start = newStart
          newEvent.end = newEnd
        }
      }

      setFormData(newEvent)
    }
  }, [event, userRole, userCollaborateurId, collaborateurs])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    // Convertir les noms snake_case en camelCase pour le formulaire
    const camelName = name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    setFormData({
      ...formData,
      [camelName]: type === "checkbox" ? checked : value,
    })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Convertir les noms snake_case en camelCase pour le formulaire
    const camelName = name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    setFormData({
      ...formData,
      [camelName]: Number.parseInt(value) || 0,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    // Convertir les noms snake_case en camelCase pour le formulaire
    const camelName = name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    if (camelName === "collaborateurId" && value) {
      // Si le collaborateur change, mettre à jour les heures par défaut
      const collaborateur = collaborateurs.find((c) => c.id === value)
      if (collaborateur) {
        const entreprise = collaborateur.entreprise
        const today = new Date()
        const isFriday = today.getDay() === 5 // 5 = vendredi

        let startHour = 8,
          startMinute = 0,
          endHour = 17,
          endMinute = 0

        if (entreprise === "ORIZON TELECOM" || entreprise === "ORIZON GROUP") {
          startHour = 8
          startMinute = 30

          if (isFriday) {
            endHour = 16
            endMinute = 30
          } else {
            endHour = 17
            endMinute = 0
          }
        } else if (entreprise === "ORIZON INSTALLATION") {
          startHour = 7
          startMinute = 30
          endHour = 15
          endMinute = 30
        } else if (entreprise === "YELLEEN") {
          startHour = 7
          startMinute = 30

          if (isFriday) {
            endHour = 15
            endMinute = 30
          } else {
            endHour = 16
            endMinute = 30
          }
        }

        const newStart = new Date()
        newStart.setHours(startHour, startMinute, 0, 0)

        const newEnd = new Date()
        newEnd.setHours(endHour, endMinute, 0, 0)

        setFormData((prev) => ({
          ...prev,
          [camelName]: value,
          start: newStart,
          end: newEnd,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [camelName]: value,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [camelName]: value,
      }))
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    // Convertir les noms snake_case en camelCase pour le formulaire
    const camelName = name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    if (camelName === "grandDeplacement" && checked) {
      // Si on coche "Grand déplacement", on désactive le panier repas
      setFormData({
        ...formData,
        [camelName]: checked,
        panierRepas: false,
      })
    } else if (camelName === "prgd" && !checked) {
      // Si on décoche "PRGD", on réinitialise le nombre de PRGD
      setFormData({
        ...formData,
        [camelName]: checked,
        nombrePrgd: 0,
      })
    } else if (camelName === "prgd" && checked) {
      // Si on coche "PRGD", on initialise le nombre de PRGD à 1
      setFormData({
        ...formData,
        [camelName]: checked,
        nombrePrgd: 1,
      })
    } else if (camelName === "panierRepas" && checked) {
      // Si on coche "Panier repas", on décoche "Ticket restaurant"
      setFormData({
        ...formData,
        [camelName]: checked,
        ticketRestaurant: false,
      })
      // Afficher l'avertissement d'exclusion mutuelle
      setShowMutuallyExclusiveWarning(true)
      setTimeout(() => setShowMutuallyExclusiveWarning(false), 3000)
    } else if (camelName === "ticketRestaurant" && checked) {
      // Si on coche "Ticket restaurant", on décoche "Panier repas"
      setFormData({
        ...formData,
        [camelName]: checked,
        panierRepas: false,
      })
      // Afficher l'avertissement d'exclusion mutuelle
      setShowMutuallyExclusiveWarning(true)
      setTimeout(() => setShowMutuallyExclusiveWarning(false), 3000)
    } else {
      setFormData({
        ...formData,
        [camelName]: checked,
      })
    }
  }

  const handleTimeChange = (name: string, value: string) => {
    const [hours, minutes] = value.split(":").map(Number)
    const newDate = new Date(name === "startTime" ? formData.start : formData.end)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)

    setFormData({
      ...formData,
      [name === "startTime" ? "start" : "end"]: newDate,
    })
  }

  const formatTimeForInput = (date: Date) => {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
  }

  // Gérer la sélection d'une adresse géolocalisée
  const handleSelectAddress = (result: GeocodingResult) => {
    // Calculer la distance entre le siège social et l'adresse sélectionnée
    const distance = calculateDistance(SIEGE_SOCIAL.latitude, SIEGE_SOCIAL.longitude, result.latitude, result.longitude)

    // Déterminer la zone de trajet en fonction de la distance
    const zone = determineZoneTrajet(distance)

    setCalculatedDistance(distance)
    setCalculatedZone(zone)

    setFormData({
      ...formData,
      lieuChantier: result.address.split(",")[0], // Prendre la première partie de l'adresse comme nom du lieu
      adresseComplete: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
      zoneTrajet: zone, // Définir automatiquement la zone de trajet
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!canEdit && userRole !== "admin") return

    // Générer un titre automatique si vide
    let title = formData.title
    if (!title) {
      const collaborateur = collaborateurs.find((c) => c.id === formData.collaborateurId)
      if (formData.typeEvenement === "presence") {
        title = collaborateur ? `${collaborateur.nom} - ${formData.lieuChantier}` : formData.lieuChantier
      } else {
        title = collaborateur ? `${collaborateur.nom} - ${formData.typeAbsence}` : `${formData.typeAbsence}`
      }
    }

    // S'assurer que le type d'événement est bien "presence" ou "absence"
    const eventType = formData.typeEvenement === "absence" ? "absence" : "presence";

    // Créer un objet au format camelCase pour le schéma Prisma
    const eventToSave = {
      ...formData,
      title,
      typeEvenement: eventType,
    };

    onSave(eventToSave as Evenement)
  }

  // Liste des zones de trajet
  const zonesTrajet = ["1A", "1B", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]

  // Liste des types d'absence
  const typesAbsence: TypeAbsence[] = [
    "RTT",
    "CP",
    "CSS",
    "Abs Inj",
    "Accident Travail",
    "Arrêt Travail",
    "CFA",
    "Congé Pater",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {event && event.id
              ? "Modifier l'événement"
              : formData.typeEvenement === "presence"
                ? "Ajouter une présence"
                : "Ajouter une absence"}
            {isLocked && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                <Lock className="mr-1 h-3 w-3" />
                Verrouillé
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {showMutuallyExclusiveWarning && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous ne pouvez pas sélectionner à la fois Panier repas et Ticket restaurant.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collaborateurId" className="text-right">
                Collaborateur
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.collaborateurId}
                  onValueChange={(value) => handleSelectChange("collaborateurId", value)}
                  disabled={!canSelectCollaborateur || (userRole === "collaborateur" && !!userCollaborateurId)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un collaborateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {collaborateurs.map((collaborateur) => (
                      <SelectItem key={collaborateur.id} value={collaborateur.id}>
                        {collaborateur.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Plage horaire</Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime" className="text-xs text-muted-foreground">
                    Début
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formatTimeForInput(formData.start)}
                    onChange={(e) => handleTimeChange("startTime", e.target.value)}
                    disabled={!canEdit && userRole !== "admin"}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-xs text-muted-foreground">
                    Fin
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formatTimeForInput(formData.end)}
                    onChange={(e) => handleTimeChange("endTime", e.target.value)}
                    disabled={!canEdit && userRole !== "admin"}
                  />
                </div>
              </div>
            </div>

            {/* Afficher les champs spécifiques en fonction du type d'événement */}
            {formData.typeEvenement === "presence" ? (
              // Champs pour les événements de type "présence"
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lieuChantier" className="text-right">
                    Lieu de chantier
                  </Label>
                  <Input
                    id="lieuChantier"
                    name="lieuChantier"
                    value={formData.lieuChantier || ""}
                    onChange={handleChange}
                    className="col-span-3"
                    disabled={!canEdit && userRole !== "admin"}
                    required
                  />
                </div>

                {/* Ajout du champ de recherche d'adresse */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Adresse complète
                    <div className="text-xs font-normal text-muted-foreground mt-1">Géolocalisation</div>
                  </Label>
                  <div className="col-span-3">
                    <AddressSearch
                      onSelectAddress={handleSelectAddress}
                      initialAddress={formData.adresseComplete || ""}
                      disabled={!canEdit && userRole !== "admin"}
                    />
                    {formData.latitude && formData.longitude && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Coordonnées: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </div>
                    )}

                    {/* Afficher la distance calculée et la zone suggérée */}
                    {calculatedDistance !== null && (
                      <div className="mt-2 flex items-center">
                        <Info className="h-3 w-3 mr-1 text-blue-500" />
                        <span className="text-xs">
                          Distance: {calculatedDistance.toFixed(2)} km
                          {calculatedZone && (
                            <>
                              {" - "}
                              Zone suggérée:{" "}
                              <Badge variant="outline" className="text-xs ml-1">
                                {calculatedZone}
                              </Badge>
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zoneTrajet" className="text-right">
                    Zone de trajet
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.zoneTrajet || ""}
                      onValueChange={(value) => handleSelectChange("zoneTrajet", value)}
                      disabled={!canEdit && userRole !== "admin"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zonesTrajet.map((zone) => (
                          <SelectItem
                            key={zone}
                            value={zone}
                            className={calculatedZone === zone ? "font-bold bg-blue-50" : ""}
                          >
                            Zone {zone} {calculatedZone === zone ? "(suggérée)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="heuresSupplementaires" className="text-right">
                    Heures supp.
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.heuresSupplementaires.toString()}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          heuresSupplementaires: Number.parseFloat(value),
                        })
                      }}
                      disabled={!canEdit && userRole !== "admin"}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Aucune</SelectItem>
                        <SelectItem value="0.5">0.5 heure</SelectItem>
                        <SelectItem value="1">1 heure</SelectItem>
                        <SelectItem value="1.5">1.5 heures</SelectItem>
                        <SelectItem value="2">2 heures</SelectItem>
                        <SelectItem value="2.5">2.5 heures</SelectItem>
                        <SelectItem value="3">3 heures</SelectItem>
                        <SelectItem value="3.5">3.5 heures</SelectItem>
                        <SelectItem value="4">4 heures</SelectItem>
                        <SelectItem value="4.5">4.5 heures</SelectItem>
                        <SelectItem value="5">5 heures</SelectItem>
                        <SelectItem value="5.5">5.5 heures</SelectItem>
                        <SelectItem value="6">6 heures</SelectItem>
                        <SelectItem value="6.5">6.5 heures</SelectItem>
                        <SelectItem value="7">7 heures</SelectItem>
                        <SelectItem value="7.5">7.5 heures</SelectItem>
                        <SelectItem value="8">8 heures</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.heuresSupplementaires > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.heuresSupplementaires} {formData.heuresSupplementaires > 1 ? "heures" : "heure"}{" "}
                        supplémentaire{formData.heuresSupplementaires > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">Options</div>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="grandDeplacement"
                        checked={formData.grandDeplacement}
                        onCheckedChange={(checked) => handleCheckboxChange("grandDeplacement", checked as boolean)}
                        disabled={!canEdit && userRole !== "admin"}
                      />
                      <Label htmlFor="grandDeplacement">Grand déplacement</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="panierRepas"
                        checked={formData.panierRepas}
                        onCheckedChange={(checked) => handleCheckboxChange("panierRepas", checked as boolean)}
                        disabled={(!canEdit && userRole !== "admin") || formData.grandDeplacement}
                      />
                      <Label
                        htmlFor="panierRepas"
                        className={formData.grandDeplacement ? "text-muted-foreground" : ""}
                      >
                        Panier repas {formData.grandDeplacement && "(Non disponible avec grand déplacement)"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ticketRestaurant"
                        checked={formData.ticketRestaurant}
                        onCheckedChange={(checked) => handleCheckboxChange("ticketRestaurant", checked as boolean)}
                        disabled={!canEdit && userRole !== "admin"}
                      />
                      <Label htmlFor="ticketRestaurant">Ticket Restaurant</Label>
                    </div>

                    {/* Section PRGD toujours visible */}
                    <div className="mt-4 border-t pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="prgd"
                          checked={formData.prgd}
                          onCheckedChange={(checked) => handleCheckboxChange("prgd", checked as boolean)}
                          disabled={!canEdit && userRole !== "admin"}
                        />
                        <Label htmlFor="prgd">PRGD</Label>
                      </div>

                      {/* Compteur PRGD qui apparaît uniquement si PRGD est coché */}
                      {formData.prgd && (
                        <div className="ml-6 mt-2">
                          <Label htmlFor="nombrePrgd" className="text-sm mb-1 block">
                            Nombre de PRGD (max 2)
                          </Label>
                          <Input
                            id="nombrePrgd"
                            name="nombrePrgd"
                            type="number"
                            min="1"
                            max="2"
                            value={formData.nombrePrgd || 1}
                            onChange={handleNumberChange}
                            className="w-20"
                            disabled={!canEdit && userRole !== "admin"}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Champs pour les événements de type "absence"
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="typeAbsence" className="text-right">
                  Type d'absence
                </Label>
                <div className="col-span-3">
                  <RadioGroup
                    value={formData.typeAbsence || ""}
                    onValueChange={(value) => handleSelectChange("typeAbsence", value)}
                    className="grid grid-cols-2 gap-2"
                    required
                    disabled={!canEdit && userRole !== "admin"}
                  >
                    {typesAbsence.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type} id={`absence-${type}`} />
                        <Label htmlFor={`absence-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            {event && event.id && (canEdit || userRole === "admin") && (
              <Button type="button" variant="destructive" onClick={() => onDelete(event.id)}>
                Supprimer
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={!canEdit && userRole !== "admin"}>
                Enregistrer
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
