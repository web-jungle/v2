"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { usePlanningSync } from "@/lib/planning-sync-service"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export function PlanningSyncDiagnostic() {
  const {
    collaborateurs,
    planningEvents,
    isLoading,
    error,
    loadCollaborateurs,
    loadPlanningEvents,
    checkSynchronization,
    repairInvalidEvents,
  } = usePlanningSync()

  const [syncStatus, setSyncStatus] = useState<ReturnType<typeof checkSynchronization> | null>(null)
  const [isRepairing, setIsRepairing] = useState(false)

  useEffect(() => {
    if (collaborateurs.length > 0 && planningEvents.length > 0) {
      setSyncStatus(checkSynchronization())
    }
  }, [collaborateurs, planningEvents])

  const handleRefresh = async () => {
    await loadCollaborateurs()
    await loadPlanningEvents()
    setSyncStatus(checkSynchronization())
  }

  const handleRepair = async () => {
    setIsRepairing(true)
    await repairInvalidEvents()
    await handleRefresh()
    setIsRepairing(false)
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center">
          <LoadingSpinner />
          <span className="ml-2">Chargement des données...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnostic de synchronisation du planning</CardTitle>
        <CardDescription>
          Vérification de la synchronisation entre les collaborateurs et les événements du planning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium">Collaborateurs</h3>
              <p className="text-2xl font-bold">{collaborateurs.length}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium">Événements du planning</h3>
              <p className="text-2xl font-bold">{planningEvents.length}</p>
            </div>
          </div>

          {syncStatus && (
            <Alert variant={syncStatus.isSynchronized ? "default" : "destructive"}>
              {syncStatus.isSynchronized ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>
                {syncStatus.isSynchronized ? "Synchronisation correcte" : "Problème de synchronisation détecté"}
              </AlertTitle>
              <AlertDescription>
                {syncStatus.isSynchronized
                  ? "Tous les événements du planning sont correctement liés à des collaborateurs existants."
                  : `${syncStatus.invalidEvents.length} événements sont liés à des collaborateurs qui n'existent pas dans la base de données.`}
              </AlertDescription>
            </Alert>
          )}

          {syncStatus && !syncStatus.isSynchronized && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Événements problématiques :</h3>
              <div className="bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
                <ul className="list-disc pl-5 space-y-1">
                  {syncStatus.invalidEvents.map((event) => (
                    <li key={event.id} className="text-sm">
                      <span className="font-medium">{event.title}</span> - ID Collaborateur invalide:{" "}
                      {event.collaborateurId}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading || isRepairing}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>

        {syncStatus && !syncStatus.isSynchronized && (
          <Button onClick={handleRepair} disabled={isLoading || isRepairing}>
            {isRepairing ? (
              <>
                <LoadingSpinner className="h-4 w-4 mr-2" />
                Réparation en cours...
              </>
            ) : (
              "Réparer les problèmes"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
