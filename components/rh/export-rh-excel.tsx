"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { Salarie } from "@/lib/rh-types"

interface ExportRHExcelProps {
  salaries: Salarie[]
}

export default function ExportRHExcel({ salaries }: ExportRHExcelProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Préparer les données pour l'export
      const data = salaries.map((salarie) => {
        return {
          ID: salarie.id,
          Nom: salarie.nom,
          Prénom: salarie.prenom,
          Classification: salarie.classification,
          "Date d'entrée": new Date(salarie.dateEntree).toLocaleDateString("fr-FR"),
          "Type de contrat": salarie.typeContrat,
          "Durée du contrat": salarie.dureeContrat || "",
          Certifications: salarie.certifications.join(", "),
          Habilitations: salarie.habilitations.join(", "),
          Entreprise: salarie.entreprise,
          Poste: salarie.poste,
          Email: salarie.email,
          Téléphone: salarie.telephone,
          Adresse: salarie.adresse || "",
          "Code postal": salarie.codePostal || "",
          Ville: salarie.ville || "",
          "Date de naissance": salarie.dateNaissance ? new Date(salarie.dateNaissance).toLocaleDateString("fr-FR") : "",
          "Numéro de sécurité sociale": salarie.numeroSecu || "",
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
      link.setAttribute("download", `Liste_Salaries_${formattedDate}.csv`)

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
