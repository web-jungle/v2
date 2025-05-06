"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { Vehicule } from "@/lib/logistique-types"
import { societes, etatsVehicule, typesProprietaire, typesVehicule } from "@/lib/logistique-types"
import { collaborateurs } from "@/lib/data"

interface VehiculeFormProps {
  isOpen: boolean
  onClose: () => void
  vehicule: Vehicule | null
  onSave: (vehicule: Vehicule) => void
}

export default function VehiculeForm({ isOpen, onClose, vehicule, onSave }: VehiculeFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Omit<Vehicule, "id">>({
    societe: "OT",
    marque: "",
    modele: "",
    immatriculation: "",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
  })

  useEffect(() => {
    if (vehicule) {
      setFormData({
        societe: vehicule.societe || "OT",
        marque: vehicule.marque || "",
        modele: vehicule.modele || "",
        immatriculation: vehicule.immatriculation || "",
        etat: vehicule.etat || "EN CIRCULATION",
        proprietaire: vehicule.proprietaire || "ACHAT",
        typeVehicule: vehicule.typeVehicule,
        dateMiseEnCirculation: vehicule.dateMiseEnCirculation,
        finContrat: vehicule.finContrat,
        kilometrage: vehicule.kilometrage,
        kmProchaineRevision: vehicule.kmProchaineRevision,
        dateLimiteControleTechnique: vehicule.dateLimiteControleTechnique,
        dateLimiteControlePollution: vehicule.dateLimiteControlePollution,
        dernierEntretien: vehicule.dernierEntretien,
        prochainEntretien: vehicule.prochainEntretien,
        conducteurPrincipal: vehicule.conducteurPrincipal,
        notes: vehicule.notes,
      })
    } else {
      // Réinitialiser le formulaire pour un nouveau véhicule
      setFormData({
        societe: "OT",
        marque: "",
        modele: "",
        immatriculation: "",
        etat: "EN CIRCULATION",
        proprietaire: "ACHAT",
        typeVehicule: "VOITURE",
      })
    }
  }, [vehicule])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value ? Number.parseInt(value, 10) : undefined }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation de base
    if (!formData.marque || !formData.modele || !formData.immatriculation) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Créer le véhicule
    const savedVehicule: Vehicule = {
      id: vehicule?.id || String(Date.now()),
      ...formData,
    }

    onSave(savedVehicule)
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicule ? "Modifier le véhicule" : "Ajouter un véhicule"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="societe">Société *</Label>
                <Select
                  value={formData.societe}
                  onValueChange={(value) => handleSelectChange("societe", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une société" />
                  </SelectTrigger>
                  <SelectContent>
                    {societes.map((societe) => (
                      <SelectItem key={societe} value={societe}>
                        {societe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="etat">État *</Label>
                <Select value={formData.etat} onValueChange={(value) => handleSelectChange("etat", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un état" />
                  </SelectTrigger>
                  <SelectContent>
                    {etatsVehicule.map((etat) => (
                      <SelectItem key={etat} value={etat}>
                        {etat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marque">Marque *</Label>
                <Input id="marque" name="marque" value={formData.marque} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modele">Modèle *</Label>
                <Input id="modele" name="modele" value={formData.modele} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="immatriculation">Immatriculation *</Label>
                <Input
                  id="immatriculation"
                  name="immatriculation"
                  value={formData.immatriculation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeVehicule">Type de véhicule</Label>
                <Select
                  value={formData.typeVehicule}
                  onValueChange={(value) => handleSelectChange("typeVehicule", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesVehicule.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proprietaire">Propriétaire *</Label>
                <Select
                  value={formData.proprietaire}
                  onValueChange={(value) => handleSelectChange("proprietaire", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de propriétaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesProprietaire.map((proprietaire) => (
                      <SelectItem key={proprietaire} value={proprietaire}>
                        {proprietaire}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateMiseEnCirculation">Date de mise en circulation</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateMiseEnCirculation && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateMiseEnCirculation ? (
                        format(formData.dateMiseEnCirculation, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateMiseEnCirculation}
                      onSelect={(date) => handleDateChange("dateMiseEnCirculation", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kilometrage">Kilométrage actuel</Label>
                <Input
                  id="kilometrage"
                  name="kilometrage"
                  type="number"
                  value={formData.kilometrage || ""}
                  onChange={handleNumberChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmProchaineRevision">Km prochaine révision</Label>
                <Input
                  id="kmProchaineRevision"
                  name="kmProchaineRevision"
                  type="number"
                  value={formData.kmProchaineRevision || ""}
                  onChange={handleNumberChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateLimiteControleTechnique">Date limite contrôle technique</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateLimiteControleTechnique && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateLimiteControleTechnique ? (
                        format(formData.dateLimiteControleTechnique, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateLimiteControleTechnique}
                      onSelect={(date) => handleDateChange("dateLimiteControleTechnique", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateLimiteControlePollution">Date limite contrôle pollution</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateLimiteControlePollution && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateLimiteControlePollution ? (
                        format(formData.dateLimiteControlePollution, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateLimiteControlePollution}
                      onSelect={(date) => handleDateChange("dateLimiteControlePollution", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="finContrat">Fin de contrat</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.finContrat && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.finContrat ? (
                        format(formData.finContrat, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.finContrat}
                      onSelect={(date) => handleDateChange("finContrat", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conducteurPrincipal">Conducteur principal</Label>
                <Select
                  value={formData.conducteurPrincipal || ""}
                  onValueChange={(value) => handleSelectChange("conducteurPrincipal", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un conducteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun conducteur attitré</SelectItem>
                    {collaborateurs.map((collaborateur) => (
                      <SelectItem key={collaborateur.id} value={collaborateur.id}>
                        {collaborateur.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dernierEntretien">Dernier entretien</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dernierEntretien && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dernierEntretien ? (
                        format(formData.dernierEntretien, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dernierEntretien}
                      onSelect={(date) => handleDateChange("dernierEntretien", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prochainEntretien">Prochain entretien</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.prochainEntretien && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.prochainEntretien ? (
                        format(formData.prochainEntretien, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.prochainEntretien}
                      onSelect={(date) => handleDateChange("prochainEntretien", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleChange} rows={3} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
