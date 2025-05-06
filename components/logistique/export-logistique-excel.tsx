"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { Vehicule } from "@/lib/logistique-types"

interface ExportLogistiqueExcelProps {
  vehicules: Vehicule[]
}

export default function ExportLogistiqueExcel({ vehicules }: ExportLogistiqueExcelProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Préparer les données pour l'export
      const data = vehicules.map((vehicule) => {
        return {
          ID: vehicule.id,
          Société: vehicule.societe,
          Marque: vehicule.marque,
          Modèle: vehicule.modele,
          Immatriculation: vehicule.immatriculation,
          État: vehicule.etat,
          Propriétaire: vehicule.proprietaire,
          "Type de véhicule": vehicule.typeVehicule || "",
          "Date de mise en circulation": vehicule.dateMiseEnCirculation
            ? new Date(vehicule.dateMiseEnCirculation).toLocaleDateString("fr-FR")
            : "",
          "Fin de contrat": vehicule.finContrat ? new Date(vehicule.finContrat).toLocaleDateString("fr-FR") : "",
          Kilométrage: vehicule.kilometrage || "",
          "Km prochaine révision": vehicule.kmProchaineRevision || "",
          "Date limite contrôle technique": vehicule.dateLimiteControleTechnique
            ? new Date(vehicule.dateLimiteControleTechnique).toLocaleDateString("fr-FR")
            : "",
          "Date limite contrôle pollution": vehicule.dateLimiteControlePollution
            ? new Date(vehicule.dateLimiteControlePollution).toLocaleDateString("fr-FR")
            : "",
          "Dernier entretien": vehicule.dernierEntretien
            ? new Date(vehicule.dernierEntretien).toLocaleDateString("fr-FR")
            : "",
          "Prochain entretien": vehicule.prochainEntretien
            ? new Date(vehicule.prochainEntretien).toLocaleDateString("fr-FR")
            : "",
          "Conducteur principal": vehicule.conducteurPrincipal || "",
          Notes: vehicule.notes || "",
        }
      })

      // Convertir les données en CSV
      const headers = Object.keys(data[0] || {}).join(",")
      const rows = data.map((row) =>
        Object.values(row)
          .map(
            (value) =>
              // Entourer les valeurs de guillemets pour gérer les virgules dans les valeurs
              `"${String(value).replace(/"/g, '""')}"`,
          )
          .join(","),
      )
      const csv = [headers, ...rows].join("\n")

      // Créer un blob et télécharger le fichier
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)

      const today = new Date()
      const formattedDate = today.toLocaleDateString("fr-FR").replace(/\//g, "-")
      link.setAttribute("download", `Parc_Automobile_${formattedDate}.csv`)

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2">
      <FileDown className="h-4 w-4" />
      {isExporting ? "Export en cours..." : "Exporter en Excel"}
    </Button>
  )
}
