"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { Evenement, Collaborateur } from "@/lib/types"

interface ExportExcelProps {
  events: Evenement[]
  collaborateurs: Collaborateur[]
}

export default function ExportExcel({ events, collaborateurs }: ExportExcelProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Filtrer les événements du mois en cours
      const today = new Date()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const eventsOfMonth = events.filter((event) => {
        const eventDate = new Date(event.start)
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
      })

      // Préparer les données pour l'export
      const data = eventsOfMonth.map((event) => {
        const collaborateur = collaborateurs.find((c) => c.id === event.collaborateurId)
        const startDate = new Date(event.start)
        const endDate = new Date(event.end)

        return {
          Date: startDate.toLocaleDateString("fr-FR"),
          Collaborateur: collaborateur ? collaborateur.nom : "Non assigné",
          "Lieu de chantier": event.lieuChantier,
          "Zone de trajet": event.zoneTrajet,
          "Heure de début": startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          "Heure de fin": endDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          "Heures supplémentaires": event.heuresSupplementaires,
          "Grand déplacement": event.grandDeplacement ? "Oui" : "Non",
          "Panier repas": event.panierRepas ? "Oui" : "Non",
          PRGD: event.prgd ? "Oui" : "Non",
          "Nombre de PRGD": event.prgd ? event.nombrePRGD : 0,
        }
      })

      // Convertir les données en CSV
      const headers = Object.keys(data[0] || {}).join(",")
      const rows = data.map((row) => Object.values(row).join(","))
      const csv = [headers, ...rows].join("\n")

      // Créer un blob et télécharger le fichier
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)

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
      link.setAttribute("download", `Planning_${monthNames[currentMonth]}_${currentYear}.csv`)

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
      {isExporting ? "Export en cours..." : "Exporter pour comptabilité"}
    </Button>
  )
}
