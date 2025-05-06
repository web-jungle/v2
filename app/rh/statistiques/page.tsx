"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import StatistiquesRH from "@/components/rh/statistiques-rh"
import { salariesInitiaux } from "@/lib/rh-data"

export default function StatistiquesRHPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [salaries, setSalaries] = useState(salariesInitiaux)
  const [periode, setPeriode] = useState("tous")

  // Vérifier si l'utilisateur est admin ou manager
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "manager") {
      router.push("/")
      toast({
        title: "Accès limité",
        description: "Les statistiques RH sont réservées aux administrateurs et managers.",
        variant: "destructive",
      })
    }
  }, [user, router, toast])

  // Filtrer les salariés selon la période
  const filteredSalaries = (() => {
    if (periode === "tous") {
      return salaries
    }

    const now = new Date()
    const cutoffDate = new Date()

    if (periode === "mois") {
      cutoffDate.setMonth(now.getMonth() - 1)
    } else if (periode === "trimestre") {
      cutoffDate.setMonth(now.getMonth() - 3)
    } else if (periode === "annee") {
      cutoffDate.setFullYear(now.getFullYear() - 1)
    }

    return salaries.filter((salarie) => new Date(salarie.dateEntree) >= cutoffDate)
  })()

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return null
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/rh")} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Button>
          <h1 className="text-3xl font-bold">Statistiques RH</h1>
        </div>
        <Tabs value={periode} onValueChange={setPeriode}>
          <TabsList>
            <TabsTrigger value="tous">Tous</TabsTrigger>
            <TabsTrigger value="mois">Dernier mois</TabsTrigger>
            <TabsTrigger value="trimestre">Dernier trimestre</TabsTrigger>
            <TabsTrigger value="annee">Dernière année</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <StatistiquesRH salaries={filteredSalaries} />
    </div>
  )
}
