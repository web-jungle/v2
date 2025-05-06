"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share } from "lucide-react"
import type { Evenement, Collaborateur } from "@/lib/types"

interface ExportPDFProps {
  events: Evenement[]
  collaborateurs: Collaborateur[]
  selectedCollaborateurs: string[]
  currentWeekStart: Date
}

export default function ExportPDF({
  events,
  collaborateurs,
  selectedCollaborateurs,
  currentWeekStart,
}: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Importer dynamiquement les bibliothèques nécessaires
      const [jsPDF, html2canvas] = await Promise.all([import("jspdf"), import("html2canvas")])

      // Créer un élément temporaire pour le rendu du planning
      const tempElement = document.createElement("div")
      tempElement.className = "pdf-export"
      tempElement.style.position = "absolute"
      tempElement.style.left = "-9999px"
      tempElement.style.top = "-9999px"
      tempElement.style.width = "1000px"
      document.body.appendChild(tempElement)

      // Générer les jours de la semaine
      const weekDays = []
      for (let i = 0; i < 5; i++) {
        // Lundi à vendredi (5 jours)
        const day = new Date(currentWeekStart)
        day.setDate(currentWeekStart.getDate() + i)
        weekDays.push(day)
      }

      // Formater la date pour l'affichage
      const formatDate = (date: Date) => {
        return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
      }

      // Filtrer les collaborateurs sélectionnés
      const filteredCollaborateurs = collaborateurs.filter((c) => selectedCollaborateurs.includes(c.id))

      // Créer le HTML pour le PDF
      tempElement.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="text-align: center; margin-bottom: 20px;">Planning - Semaine du ${currentWeekStart.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</h1>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; width: 20%;">Collaborateur</th>
                ${weekDays.map((day) => `<th style="border: 1px solid #ddd; padding: 8px; width: 16%;">${formatDate(day)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredCollaborateurs
                .map(
                  (collaborateur) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; color: ${collaborateur.couleur};">${collaborateur.nom}</td>
                  ${weekDays
                    .map((day) => {
                      const eventsForDay = events.filter((event) => {
                        const eventDate = new Date(event.start)
                        return (
                          event.collaborateurId === collaborateur.id &&
                          eventDate.getDate() === day.getDate() &&
                          eventDate.getMonth() === day.getMonth() &&
                          eventDate.getFullYear() === day.getFullYear()
                        )
                      })

                      if (eventsForDay.length > 0) {
                        return `<td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">
                        ${eventsForDay
                          .map((event) => {
                            if (event.typeEvenement === "presence") {
                              return `<div style="margin-bottom: 4px; padding: 4px; border-radius: 4px; background-color: ${collaborateur.couleur}20;">
                              <div style="font-weight: bold;">${event.lieuChantier}</div>
                            </div>`
                            } else {
                              return `<div style="margin-bottom: 4px; padding: 4px; border-radius: 4px; background-color: #f9731620;">
                              <div style="font-weight: bold;">${event.typeAbsence}</div>
                            </div>`
                            }
                          })
                          .join("")}
                      </td>`
                      } else {
                        return `<td style="border: 1px solid #ddd; padding: 8px;"></td>`
                      }
                    })
                    .join("")}
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `

      // Convertir le HTML en canvas
      const canvas = await html2canvas.default(tempElement, {
        scale: 1.5, // Meilleure qualité
        useCORS: true,
        logging: false,
      })

      // Créer un nouveau document PDF
      const pdf = new jsPDF.default({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Ajouter l'image du canvas au PDF
      const imgData = canvas.toDataURL("image/png")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const ratio = canvas.width / canvas.height
      const width = pdfWidth
      const height = width / ratio

      pdf.addImage(imgData, "PNG", 0, 0, width, height)

      // Télécharger le PDF
      pdf.save(
        `Planning_Semaine_${currentWeekStart.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric", year: "numeric" })}.pdf`,
      )

      // Nettoyer
      document.body.removeChild(tempElement)
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error)
      alert("Une erreur est survenue lors de l'export. Veuillez réessayer.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2">
      <Share className="h-4 w-4" />
      {isExporting ? "Export en cours..." : "Partager le planning"}
    </Button>
  )
}
