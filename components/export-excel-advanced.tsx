"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { Evenement, Collaborateur } from "@/lib/types"

interface ExportExcelProps {
  events: Evenement[]
  collaborateurs: Collaborateur[]
}

export default function ExportExcelAdvanced({ events, collaborateurs }: ExportExcelProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Importer ExcelJS dynamiquement (côté client uniquement)
      const ExcelJS = (await import("exceljs")).default

      // Créer un nouveau classeur Excel
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "Planning Interactif"
      workbook.lastModifiedBy = "Planning Interactif"
      workbook.created = new Date()
      workbook.modified = new Date()

      // Filtrer les événements du mois en cours
      const today = new Date()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
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

      const eventsOfMonth = events.filter((event) => {
        const eventDate = new Date(event.start)
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
      })

      // Créer une feuille pour le récapitulatif mensuel
      const sheet = workbook.addWorksheet(`Récapitulatif ${monthNames[currentMonth]} ${currentYear}`)

      // Définir les colonnes
      sheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Collaborateur", key: "collaborateur", width: 20 },
        { header: "Lieu de chantier", key: "lieuChantier", width: 25 },
        { header: "Zone de trajet", key: "zoneTrajet", width: 15 },
        { header: "Heure de début", key: "heureDebut", width: 15 },
        { header: "Heure de fin", key: "heureFin", width: 15 },
        { header: "Heures supp.", key: "heuresSupp", width: 15 },
        { header: "Grand déplacement", key: "grandDeplacement", width: 18 },
        { header: "Panier repas", key: "panierRepas", width: 15 },
        { header: "PRGD", key: "prgd", width: 10 },
        { header: "Nombre PRGD", key: "nombrePRGD", width: 15 },
      ]

      // Ajouter le style à l'en-tête
      sheet.getRow(1).font = { bold: true }
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      }

      // Ajouter les données
      eventsOfMonth.forEach((event) => {
        const collaborateur = collaborateurs.find((c) => c.id === event.collaborateurId)
        const startDate = new Date(event.start)
        const endDate = new Date(event.end)

        sheet.addRow({
          date: startDate.toLocaleDateString("fr-FR"),
          collaborateur: collaborateur ? collaborateur.nom : "Non assigné",
          lieuChantier: event.lieuChantier,
          zoneTrajet: event.zoneTrajet,
          heureDebut: startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          heureFin: endDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          heuresSupp: event.heuresSupplementaires,
          grandDeplacement: event.grandDeplacement ? "Oui" : "Non",
          panierRepas: event.panierRepas ? "Oui" : "Non",
          prgd: event.prgd ? "Oui" : "Non",
          nombrePRGD: event.prgd ? event.nombrePRGD : 0,
        })
      })

      // Créer une feuille pour le récapitulatif par collaborateur
      const sheetByCollaborateur = workbook.addWorksheet("Récapitulatif par collaborateur")

      // Définir les colonnes
      sheetByCollaborateur.columns = [
        { header: "Collaborateur", key: "collaborateur", width: 20 },
        { header: "Total jours travaillés", key: "totalJours", width: 20 },
        { header: "Total heures supp.", key: "totalHeuresSupp", width: 20 },
        { header: "Total grands déplacements", key: "totalGD", width: 25 },
        { header: "Total paniers repas", key: "totalPR", width: 20 },
        { header: "Total PRGD", key: "totalPRGD", width: 15 },
      ]

      // Ajouter le style à l'en-tête
      sheetByCollaborateur.getRow(1).font = { bold: true }
      sheetByCollaborateur.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      }

      // Calculer les totaux par collaborateur
      const collaborateurStats = collaborateurs.map((collaborateur) => {
        const collaborateurEvents = eventsOfMonth.filter((event) => event.collaborateurId === collaborateur.id)

        // Calculer les totaux
        const totalJours = collaborateurEvents.length
        const totalHeuresSupp = collaborateurEvents.reduce((sum, event) => sum + event.heuresSupplementaires, 0)
        const totalGD = collaborateurEvents.filter((event) => event.grandDeplacement).length
        const totalPR = collaborateurEvents.filter((event) => event.panierRepas).length
        const totalPRGD = collaborateurEvents.reduce((sum, event) => sum + (event.prgd ? event.nombrePRGD : 0), 0)

        return {
          collaborateur: collaborateur.nom,
          totalJours,
          totalHeuresSupp,
          totalGD,
          totalPR,
          totalPRGD,
        }
      })

      // Ajouter les données
      collaborateurStats.forEach((stat) => {
        sheetByCollaborateur.addRow(stat)
      })

      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)

      // Télécharger le fichier
      const link = document.createElement("a")
      link.href = url
      link.download = `Planning_${monthNames[currentMonth]}_${currentYear}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error)
      alert("Une erreur est survenue lors de l'export. Veuillez réessayer.")
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
