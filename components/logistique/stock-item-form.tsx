"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import type { StockItem } from "@/lib/logistique-types"
import { cableTypes, typeMs, typeGs, typeEnroulements } from "@/lib/logistique-types"

interface StockItemFormProps {
  isOpen: boolean
  onClose: () => void
  stockItem: StockItem | null
  onSave: (stockItem: StockItem) => void
}

export default function StockItemForm({ isOpen, onClose, stockItem, onSave }: StockItemFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Omit<StockItem, "id">>({
    cableType: "6FO",
    typeM: "M6",
    typeG: "G657",
    enroulement: "Touret",
    longueur: 0,
  })

  useEffect(() => {
    if (stockItem) {
      setFormData({
        cableType: stockItem.cableType,
        typeM: stockItem.typeM,
        typeG: stockItem.typeG,
        enroulement: stockItem.enroulement,
        longueur: stockItem.longueur,
      })
    } else {
      // Réinitialiser le formulaire pour un nouvel élément
      setFormData({
        cableType: "6FO",
        typeM: "M6",
        typeG: "G657",
        enroulement: "Touret",
        longueur: 0,
      })
    }
  }, [stockItem])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation de base
    if (formData.longueur <= 0) {
      toast({
        title: "Erreur de validation",
        description: "La longueur doit être supérieure à 0.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Créer l'élément de stock
    const savedStockItem: StockItem = {
      id: stockItem?.id || String(Date.now()),
      ...formData,
    }

    onSave(savedStockItem)
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{stockItem ? "Modifier l'élément de stock" : "Ajouter un élément de stock"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cableType" className="text-right">
                Type de câble
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.cableType}
                  onValueChange={(value) => handleSelectChange("cableType", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de câble" />
                  </SelectTrigger>
                  <SelectContent>
                    {cableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type de module</Label>
              <div className="col-span-3">
                <RadioGroup
                  value={formData.typeM}
                  onValueChange={(value) => handleSelectChange("typeM", value)}
                  className="flex gap-4"
                >
                  {typeMs.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`typeM-${type}`} />
                      <Label htmlFor={`typeM-${type}`}>{type}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type de fibre</Label>
              <div className="col-span-3">
                <RadioGroup
                  value={formData.typeG}
                  onValueChange={(value) => handleSelectChange("typeG", value)}
                  className="flex gap-4"
                >
                  {typeGs.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`typeG-${type}`} />
                      <Label htmlFor={`typeG-${type}`}>{type}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type d'enroulement</Label>
              <div className="col-span-3">
                <RadioGroup
                  value={formData.enroulement}
                  onValueChange={(value) => handleSelectChange("enroulement", value)}
                  className="flex gap-4"
                >
                  {typeEnroulements.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`enroulement-${type}`} />
                      <Label htmlFor={`enroulement-${type}`}>{type}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longueur" className="text-right">
                Longueur (m)
              </Label>
              <Input
                id="longueur"
                name="longueur"
                type="number"
                min="1"
                value={formData.longueur}
                onChange={handleNumberChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
