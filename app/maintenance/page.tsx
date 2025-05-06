"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import ContratMaintenanceList from "@/components/maintenance/contrat-maintenance-list"
import type { ContratMaintenance } from "@/lib/maintenance-types"
import { contratsInitiaux } from "@/lib/maintenance-data"
import { isExpired } from "@/lib/maintenance-utils"

export default function MaintenancePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [contrats, setContrats] = useState<ContratMaintenance[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Charger les contrats
  useEffect(() => {
    // Simuler une requête API
    const loadedContrats = [...contratsInitiaux]

    // Mettre à jour les statuts des contrats expirés
    const updatedContrats = loadedContrats.map((contrat) => {
      if (contrat.statut === "Actif" && isExpired(contrat.dateEcheance)) {
        return {
          ...contrat,
          statut: "Expiré",
          dateDerniereModification: new Date().toISOString(),
        }
      }
      return contrat
    })

    setContrats(updatedContrats)
  }, [])

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">Veuillez patienter pendant le chargement du module de maintenance.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Contrats de Maintenance</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Suivi des contrats</CardTitle>
          <CardDescription>
            Gérez vos contrats de maintenance, suivez les échéances et les renouvellements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContratMaintenanceList contrats={contrats} onUpdateContrats={setContrats} />
        </CardContent>
      </Card>
    </div>
  )
}
