"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { Evenement, Collaborateur } from "@/lib/types"

interface ExportRecapExcelProps {
  events: Evenement[]
  collaborateurs: Collaborateur[]
  selectedCollaborateur: string | null
  selectedEnterprise: string | null
  month: number
  year: number
}

export default function ExportRecapExcel({
  events,
  collaborateurs,
  selectedCollaborateur,
  selectedEnterprise,
  month,
  year,
}: ExportRecapExcelProps) {
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

      // Filtrer les collaborateurs si nécessaire
      let filteredCollaborateurs = collaborateurs
      if (selectedCollaborateur) {
        filteredCollaborateurs = collaborateurs.filter((c) => c.id === selectedCollaborateur)
      } else if (selectedEnterprise) {
        filteredCollaborateurs = collaborateurs.filter((c) => c.entreprise === selectedEnterprise)
      }

      // Obtenir le nom du mois
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

      // Créer une feuille pour le récapitulatif
      const sheet = workbook.addWorksheet(`Récapitulatif ${monthNames[month]} ${year}`)

      // Définir les colonnes
      sheet.columns = [
        { header: "Collaborateur", key: "collaborateur", width: 25 },
        { header: "Entreprise", key: "entreprise", width: 20 },
        { header: "Heures Supp.", key: "heuresSupp", width: 15 },
        { header: "Paniers Repas", key: "panierRepas", width: 15 },
        { header: "Tickets Restaurant", key: "ticketRestaurant", width: 15 },
        { header: "Zone 1A", key: "zone1A", width: 10 },
        { header: "Zone 1B", key: "zone1B", width: 10 },
        { header: "Zone 2", key: "zone2", width: 10 },
        { header: "Zone 3", key: "zone3", width: 10 },
        { header: "Zone 4", key: "zone4", width: 10 },
        { header: "Zone 5", key: "zone5", width: 10 },
        { header: "GD", key: "gd", width: 10 },
        { header: "PRGD", key: "prgd", width: 10 },
        { header: "RTT", key: "rtt", width: 10 },
        { header: "CP", key: "cp", width: 10 },
        { header: "Arrêt Travail", key: "arretTravail", width: 15 },
        { header: "Autres absences", key: "autresAbsences", width: 15 },
      ]

      // Ajouter le style à l'en-tête
      sheet.getRow(1).font = { bold: true }
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      }

      // Pour chaque collaborateur, calculer les statistiques
      filteredCollaborateurs.forEach((collaborateur) => {
        // Filtrer les événements pour ce collaborateur
        const collaborateurEvents = events.filter((event) => event.collaborateurId === collaborateur.id)

        // Calculer les statistiques
        const heuresSupp = collaborateurEvents.reduce((sum, event) => sum + event.heuresSupplementaires, 0)
        const panierRepas = collaborateurEvents.filter((event) => event.panierRepas).length
        const ticketRestaurant = collaborateurEvents.filter((event) => event.ticketRestaurant).length

        // Compteurs pour chaque zone de trajet avec la nouvelle logique
        const zones = {
          "1A": 0,
          "1B": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
        }

        // Compter les zones directement déclarées
        collaborateurEvents.forEach((event) => {
          if (event.zoneTrajet && zones.hasOwnProperty(event.zoneTrajet)) {
            zones[event.zoneTrajet]++
          }
        })

        // Appliquer la logique de décomposition des zones
        collaborateurEvents.forEach((event) => {
          const zoneTrajet = event.zoneTrajet

          if (zoneTrajet === "6") {
            zones["5"]++
            zones["1A"]++
          } else if (zoneTrajet === "7") {
            zones["5"]++
            zones["1B"]++
          } else if (zoneTrajet === "8") {
            zones["5"]++
            zones["2"]++
          } else if (zoneTrajet === "9") {
            zones["5"]++
            zones["3"]++
          } else if (zoneTrajet === "10") {
            zones["5"]++
            zones["4"]++
          } else if (zoneTrajet === "11") {
            zones["5"] += 2
          } else if (zoneTrajet === "12") {
            zones["5"] += 2
            zones["1A"]++
          } else if (zoneTrajet === "13") {
            zones["5"] += 2
            zones["1B"]++
          } else if (zoneTrajet === "14") {
            zones["5"] += 2
            zones["2"]++
          } else if (zoneTrajet === "15") {
            zones["5"] += 2
            zones["3"]++
          }
        })

        // Compteurs pour GD et PRGD
        const grandDeplacement = collaborateurEvents.filter((event) => event.grandDeplacement).length
        const prgd = collaborateurEvents.filter((event) => event.prgd).length
        const nombrePRGD = collaborateurEvents.reduce((sum, event) => sum + (event.prgd ? event.nombrePRGD : 0), 0)

        // Compteur pour les absences
        const absences = collaborateurEvents.filter((event) => event.typeEvenement === "absence")
        const rtt = absences.filter((event) => event.typeAbsence === "RTT").length
        const cp = absences.filter((event) => event.typeAbsence === "CP").length
        const arretTravail = absences.filter(
          (event) => event.typeAbsence === "Arrêt Travail" || event.typeAbsence === "Accident Travail",
        ).length
        const autresAbsences = absences.filter(
          (event) =>
            event.typeAbsence !== "RTT" &&
            event.typeAbsence !== "CP" &&
            event.typeAbsence !== "Arrêt Travail" &&
            event.typeAbsence !== "Accident Travail",
        ).length

        // Ajouter une ligne au tableau
        sheet.addRow({
          collaborateur: collaborateur.nom,
          entreprise: collaborateur.entreprise,
          heuresSupp,
          panierRepas,
          ticketRestaurant,
          zone1A: zones["1A"],
          zone1B: zones["1B"],
          zone2: zones["2"],
          zone3: zones["3"],
          zone4: zones["4"],
          zone5: zones["5"],
          gd: grandDeplacement,
          prgd,
          rtt,
          cp,
          arretTravail,
          autresAbsences,
        })
      })

      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)

      // Télécharger le fichier
      const link = document.createElement("a")
      link.href = url
      link.download = `Recap_${monthNames[month]}_${year}.xlsx`
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
