"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      router.push("/home")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Tentative de connexion avec:", identifiant, motDePasse)
      const success = await login(identifiant, motDePasse)
      console.log("Résultat de la connexion:", success)

      if (success) {
        router.push("/home")
      } else {
        setError("Identifiant ou mot de passe incorrect")
      }
    } catch (err) {
      console.error("Erreur de connexion:", err)
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="relative w-40 h-40">
              <Image src="/images/logo.png" alt="ORIZON GROUP" fill className="object-contain" priority />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Planning Interactif</CardTitle>
          <CardDescription className="text-center">Connectez-vous pour accéder à votre espace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="identifiant">Identifiant</Label>
              <Input
                id="identifiant"
                type="text"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motDePasse">Mot de passe</Label>
              <Input
                id="motDePasse"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">Identifiants de démonstration :</div>
          <div className="text-xs text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
            <div>Admin:</div>
            <div>admin / adminV66+</div>
            <div>Manager:</div>
            <div>manager / managerV66+</div>
            <div>Collaborateur:</div>
            <div>damien.artes / damienV66+</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
