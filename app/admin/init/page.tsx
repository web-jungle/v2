"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

export default function InitAdminPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleInitAdmins = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/init")
      const data = await response.json()
      
      setResult(data)
      
      if (data.success) {
        toast({
          title: "Administrateurs initialisés",
          description: `${data.count} administrateurs ont été ajoutés avec succès.`,
        })
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de l'initialisation des administrateurs.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initialisation des administrateurs.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Initialisation des administrateurs</CardTitle>
          <CardDescription>
            Cliquez sur le bouton ci-dessous pour initialiser les administrateurs dans la base de données.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Cette action va ajouter les 5 administrateurs définis dans les données initiales à la base de données.
          </p>
          <Button onClick={handleInitAdmins} disabled={isLoading} className="w-full">
            {isLoading ? "Initialisation en cours..." : "Initialiser les administrateurs"}
          </Button>
        </CardContent>
        {result && (
          <CardFooter className="flex flex-col items-start border-t pt-4">
            <h3 className="font-semibold mb-2">Résultat:</h3>
            <pre className="text-sm bg-slate-100 p-2 rounded w-full overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardFooter>
        )}
      </Card>
    </div>
  )
} 