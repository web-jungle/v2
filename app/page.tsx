"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/home")
      } else {
        router.push("/login")
      }
    }
  }, [user, isLoading, router])

  // Page de chargement pendant la vérification de l'authentification
  return (
    <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
        <p className="text-muted-foreground">Veuillez patienter pendant la vérification de votre session.</p>
      </div>
    </div>
  )
}
