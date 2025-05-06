"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Car, Package } from "lucide-react"

export default function LogistiquePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Vérifier si l'utilisateur est admin ou manager
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "manager") {
      router.push("/")
      toast({
        title: "Accès limité",
        description: "La gestion logistique est réservée aux administrateurs et managers.",
        variant: "destructive",
      })
    }
  }, [user, router, toast])

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return null
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Gestion Logistique</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Car className="h-8 w-8 text-orange-500" />
            </div>
            <CardTitle className="text-xl">Gestion du Parc Automobile</CardTitle>
            <CardDescription>Gérer les véhicules de l'entreprise</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm mb-6">
              Suivez l'état de votre flotte de véhicules, les contrôles techniques, les révisions et les contrats.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/logistique/parc-auto")} className="bg-orange-500 hover:bg-orange-600">
              Accéder au Parc Auto
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle className="text-xl">Gestion des Stocks</CardTitle>
            <CardDescription>Gérer les stocks de câbles fibre optique</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm mb-6">
              Suivez votre inventaire de câbles fibre optique par type, module, fibre et enroulement.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/logistique/stocks")} className="bg-blue-500 hover:bg-blue-600">
              Accéder aux Stocks
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
