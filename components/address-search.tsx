"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { GeocodingResult } from "@/lib/types"

interface AddressSearchProps {
  onSelectAddress: (result: GeocodingResult) => void
  initialAddress?: string
  disabled?: boolean
}

export default function AddressSearch({ onSelectAddress, initialAddress = "", disabled = false }: AddressSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialAddress)
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fermer les résultats si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Rechercher une adresse avec l'API Nominatim (OpenStreetMap)
  const searchAddress = async () => {
    if (!searchTerm.trim() || searchTerm.length < 3) return

    setIsLoading(true)
    setError(null)
    setIsOpen(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5`,
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche d'adresse")
      }

      const data = await response.json()

      if (data.length === 0) {
        setResults([])
        setError("Aucune adresse trouvée")
      } else {
        const formattedResults: GeocodingResult[] = data.map((item: any) => ({
          address: item.display_name,
          latitude: Number.parseFloat(item.lat),
          longitude: Number.parseFloat(item.lon),
          placeId: item.place_id,
        }))
        setResults(formattedResults)
      }
    } catch (err) {
      console.error("Erreur de géocodage:", err)
      setError("Erreur lors de la recherche d'adresse")
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectResult = (result: GeocodingResult) => {
    setSearchTerm(result.address)
    onSelectAddress(result)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Rechercher une adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                searchAddress()
              }
            }}
            className="pr-8"
            disabled={disabled}
          />
          {isLoading && <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={searchAddress}
          disabled={isLoading || disabled || searchTerm.length < 3}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (results.length > 0 || error) && (
        <Card className="absolute z-10 mt-1 w-full max-h-60 overflow-auto shadow-lg">
          <div className="p-2">
            {error ? (
              <p className="text-sm text-destructive p-2">{error}</p>
            ) : (
              results.map((result) => (
                <div
                  key={result.placeId}
                  className="p-2 hover:bg-muted cursor-pointer text-sm rounded-md"
                  onClick={() => handleSelectResult(result)}
                >
                  {result.address}
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
