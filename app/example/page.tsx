"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ExampleCongeAlexia from "@/components/example-conge-alexia"

export default function ExamplePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">Veuillez patienter pendant le chargement de votre espace.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Exemple: Congés d'Alexia BLOT</h1>
      <p className="text-muted-foreground">
        Cet exemple montre comment une demande de congés approuvée est automatiquement ajoutée au planning.
      </p>

      <ExampleCongeAlexia />

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
        <h3 className="font-medium text-blue-800 mb-2">Comment ça fonctionne</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Un collaborateur (Alexia BLOT) soumet une demande de congés du 21/04/2025 au 26/04/2025</li>
          <li>Un administrateur ou manager examine et approuve la demande</li>
          <li>Le système crée automatiquement un événement d'absence dans le planning</li>
          <li>L'événement est verrouillé pour éviter les modifications directes</li>
          <li>Les congés apparaissent immédiatement dans le planning sans action supplémentaire</li>
        </ol>
      </div>
    </div>
  )
}
