"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { ContratMaintenance } from "@/lib/maintenance-types"

interface ContratMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  contrat: ContratMaintenance | null
  isCreating: boolean
  onSave: (contrat: ContratMaintenance) => void
}

export default function ContratMaintenanceModal({
  isOpen,
  onClose,
  contrat,
  isCreating,
  onSave,
}: ContratMaintenanceModalProps) {
  const [formData, setFormData] = useState<Partial<ContratMaintenance>>({
    client: "",
    reference: "",
    type: "Annuel",
    montant: 0,
    dateDebut: new Date().toISOString(),
    dateEcheance: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    statut: "En attente",
    description: "",
    contactClient: "",
    emailContact: "",
    telephoneContact: "",
    notes: "",
  })

  useEffect(() => {
    if (contrat && !isCreating) {
      setFormData(contrat)
    }
  }, [contrat, isCreating])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    // Vérifier que les champs obligatoires sont remplis
    if (!formData.client || !formData.reference || !formData.montant) {
      return
    }

    onSave(formData as ContratMaintenance)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Nouveau contrat de maintenance" : "Modifier le contrat de maintenance"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Input
                id="client"
                value={formData.client || ""}
                onChange={(e) => handleChange("client", e.target.value)}
                placeholder="Nom du client"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Référence *</Label>
              <Input
                id="reference"
                value={formData.reference || ""}
                onChange={(e) => handleChange("reference", e.target.value)}
                placeholder="Référence du contrat"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de contrat</Label>
              <Select value={formData.type || "Annuel"} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de contrat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annuel">Annuel</SelectItem>
                  <SelectItem value="Semestriel">Semestriel</SelectItem>
                  <SelectItem value="Trimestriel">Trimestriel</SelectItem>
                  <SelectItem value="Mensuel">Mensuel</SelectItem>
                  <SelectItem value="Ponctuel">Ponctuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant">Montant (€) *</Label>
              <Input
                id="montant"
                type="number"
                value={formData.montant || ""}
                onChange={(e) => handleChange("montant", Number.parseFloat(e.target.value))}
                placeholder="Montant du contrat"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateDebut
                      ? format(new Date(formData.dateDebut), "dd MMMM yyyy", { locale: fr })
                      : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateDebut ? new Date(formData.dateDebut) : undefined}
                    onSelect={(date) => handleChange("dateDebut", date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date d'échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateEcheance
                      ? format(new Date(formData.dateEcheance), "dd MMMM yyyy", { locale: fr })
                      : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateEcheance ? new Date(formData.dateEcheance) : undefined}
                    onSelect={(date) => handleChange("dateEcheance", date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut || "En attente"} onValueChange={(value) => handleChange("statut", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut du contrat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Expiré">Expiré</SelectItem>
                  <SelectItem value="Résilié">Résilié</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactClient">Contact client</Label>
              <Input
                id="contactClient"
                value={formData.contactClient || ""}
                onChange={(e) => handleChange("contactClient", e.target.value)}
                placeholder="Nom du contact"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailContact">Email du contact</Label>
              <Input
                id="emailContact"
                type="email"
                value={formData.emailContact || ""}
                onChange={(e) => handleChange("emailContact", e.target.value)}
                placeholder="Email du contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephoneContact">Téléphone du contact</Label>
              <Input
                id="telephoneContact"
                value={formData.telephoneContact || ""}
                onChange={(e) => handleChange("telephoneContact", e.target.value)}
                placeholder="Téléphone du contact"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description du contrat de maintenance"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Notes supplémentaires"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>{isCreating ? "Créer le contrat" : "Mettre à jour"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
