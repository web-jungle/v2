"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2 } from "lucide-react"
import type { Evenement, Collaborateur } from "@/lib/types"
import { SIEGE_SOCIAL } from "@/lib/geo-utils"

interface MapViewProps {
  events: Evenement[]
  collaborateurs: Collaborateur[]
  onSelectEvent: (event: Evenement) => void
}

export default function MapView({ events, collaborateurs, onSelectEvent }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef.current) return

    // Importer Leaflet dynamiquement (côté client uniquement)
    import("leaflet").then((L) => {
      // Créer une carte si elle n'existe pas déjà
      if (!mapInstance) {
        // Initialiser la carte
        const map = L.map(mapRef.current).setView([SIEGE_SOCIAL.latitude, SIEGE_SOCIAL.longitude], 9)

        // Ajouter la couche de tuiles OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        // Ajouter un marqueur pour le siège social
        L.marker([SIEGE_SOCIAL.latitude, SIEGE_SOCIAL.longitude], {
          icon: L.divIcon({
            className: "bg-primary rounded-full border-2 border-white shadow-lg",
            iconSize: [20, 20],
            html: '<div class="w-full h-full bg-primary rounded-full"></div>',
          }),
        })
          .addTo(map)
          .bindPopup(`<b>Siège Social</b><br>${SIEGE_SOCIAL.address}`)

        setMapInstance(map)
      }
    })

    // Nettoyer la carte lors du démontage du composant
    return () => {
      if (mapInstance) {
        mapInstance.remove()
        setMapInstance(null)
      }
    }
  }, [mapRef, mapInstance])

  // Ajouter les marqueurs pour les événements
  useEffect(() => {
    if (!mapInstance) return

    // Supprimer les marqueurs existants
    markers.forEach((marker) => marker.remove())

    // Filtrer les événements avec des coordonnées
    const geoEvents = events.filter((event) => event.latitude && event.longitude && event.typeEvenement === "presence")

    if (geoEvents.length === 0) return

    // Créer les nouveaux marqueurs
    import("leaflet").then((L) => {
      const newMarkers = geoEvents.map((event) => {
        const collaborateur = collaborateurs.find((c) => c.id === event.collaborateurId)
        const color = collaborateur?.couleur || "#3174ad"

        const marker = L.marker([event.latitude!, event.longitude!], {
          icon: L.divIcon({
            className: "border-2 border-white shadow-lg rounded-full",
            iconSize: [24, 24],
            html: `<div class="w-full h-full rounded-full" style="background-color: ${color}"></div>`,
          }),
        }).addTo(mapInstance)

        // Ajouter un popup avec les informations de l'événement
        marker.bindPopup(`
          <div class="p-1">
            <div class="font-bold">${event.lieuChantier}</div>
            <div>${event.adresseComplete?.split(",")[0] || ""}</div>
            <div class="text-xs text-gray-500">
              ${new Date(event.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - 
              ${new Date(event.end).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div class="text-xs mt-1">Zone: ${event.zoneTrajet}</div>
          </div>
        `)

        // Ajouter un gestionnaire d'événements pour ouvrir le modal d'édition
        marker.on("click", () => {
          onSelectEvent(event)
        })

        return marker
      })

      setMarkers(newMarkers)

      // Ajuster la vue pour montrer tous les marqueurs
      if (newMarkers.length > 0) {
        const group = L.featureGroup(newMarkers)
        mapInstance.fitBounds(group.getBounds(), { padding: [50, 50] })
      }
    })

    // Nettoyer les marqueurs lors du démontage
    return () => {
      markers.forEach((marker) => marker.remove())
    }
  }, [events, collaborateurs, mapInstance, onSelectEvent])

  // Gérer le mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)

    // Redimensionner la carte après le changement de taille du conteneur
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.invalidateSize()
      }
    }, 100)
  }

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}>
      <CardContent className={`p-0 relative ${isFullscreen ? "h-screen" : "h-[600px]"}`}>
        <div ref={mapRef} className="w-full h-full" />
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 bg-white shadow-md z-[1000]"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </CardContent>
    </Card>
  )
}
