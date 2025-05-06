"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { UserCog, Calendar } from "lucide-react"
import { useEffect } from "react"

export default function RHHomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [router, user])

  if (!user) {
    return null
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Ressources Humaines</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <UserCog className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-xl">Gestion des Ressources Humaines</CardTitle>
            <CardDescription>Gérer les dossiers du personnel</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm mb-6">
              Accédez aux dossiers des salariés, gérez les contrats, certifications et habilitations.
            </p>
            <Button onClick={() => router.push("/rh/personnel")} className="bg-green-500 hover:bg-green-600">
              Accéder à la gestion RH
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle className="text-xl">Gestion des Congés</CardTitle>
            <CardDescription>Demandes et validation des congés</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm mb-6">
              Soumettez vos demandes de congés ou validez les demandes en attente en tant qu'administrateur.
            </p>
            <Button onClick={() => router.push("/rh/conges")} className="bg-blue-500 hover:bg-blue-600">
              Accéder aux congés
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
