"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Planning from "@/components/planning-alternative"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function PlanningPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (!authLoading && user) {
      // Ajouter un petit délai pour permettre au navigateur de respirer
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, router])

  // État de chargement amélioré
  if (authLoading || !isReady) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement du planning...</h2>
          <p className="text-muted-foreground">Veuillez patienter pendant le chargement des données.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Planning des Collaborateurs</h1>
      <Planning userRole={user.role} userCollaborateurId={user.collaborateurId} />
    </div>
  )
}
