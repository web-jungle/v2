"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { evenementsInitiaux, collaborateurs, entreprises } from "@/lib/data"
import RecapTable from "@/components/admin/recap-table"
import ExportRecapExcel from "@/components/admin/export-recap-excel"

export default function RecapPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(null)
  const [selectedCollaborateur, setSelectedCollaborateur] = useState<string | null>(null)

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "admin") {
      router.push("/")
      toast({
        title: "Accès refusé",
        description: "Cette page est réservée aux administrateurs.",
        variant: "destructive",
      })
    }
  }, [user, isLoading, router, toast])

  // Générer les options pour les mois
  const monthOptions = [
    { value: 0, label: "Janvier" },
    { value: 1, label: "Février" },
    { value: 2, label: "Mars" },
    { value: 3, label: "Avril" },
    { value: 4, label: "Mai" },
    { value: 5, label: "Juin" },
    { value: 6, label: "Juillet" },
    { value: 7, label: "Août" },
    { value: 8, label: "Septembre" },
    { value: 9, label: "Octobre" },
    { value: 10, label: "Novembre" },
    { value: 11, label: "Décembre" },
  ]

  // Générer les options pour les années (année courante et les 2 précédentes)
  const currentYear = new Date().getFullYear()
  const yearOptions = [
    { value: currentYear, label: currentYear.toString() },
    { value: currentYear - 1, label: (currentYear - 1).toString() },
    { value: currentYear - 2, label: (currentYear - 2).toString() },
  ]

  // Filtrer les collaborateurs par entreprise
  const filteredCollaborateurs = useMemo(() => {
    if (selectedEnterprise) {
      return collaborateurs.filter((c) => c.entreprise === selectedEnterprise)
    }
    return collaborateurs
  }, [selectedEnterprise])

  // Filtrer les événements par mois et année
  const filteredEvents = useMemo(() => {
    return evenementsInitiaux.filter((event) => {
      const eventDate = new Date(event.start)
      return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear
    })
  }, [selectedMonth, selectedYear])

  if (isLoading || !user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Récapitulatif Administratif</h1>
        <ExportRecapExcel
          events={filteredEvents}
          collaborateurs={filteredCollaborateurs}
          selectedCollaborateur={selectedCollaborateur}
          selectedEnterprise={selectedEnterprise}
          month={selectedMonth}
          year={selectedYear}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Sélectionnez les critères pour affiner le récapitulatif</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Mois</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner un mois" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Année</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner une année" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year.value} value={year.value.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Entreprise</label>
              <Select
                value={selectedEnterprise || "all"}
                onValueChange={(value) => {
                  setSelectedEnterprise(value === "all" ? null : value)
                  setSelectedCollaborateur(null) // Réinitialiser le collaborateur sélectionné
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les entreprises" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les entreprises</SelectItem>
                  {entreprises.map((entreprise) => (
                    <SelectItem key={entreprise} value={entreprise}>
                      {entreprise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Collaborateur</label>
              <Select
                value={selectedCollaborateur || "all"}
                onValueChange={(value) => setSelectedCollaborateur(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Tous les collaborateurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les collaborateurs</SelectItem>
                  {filteredCollaborateurs.map((collaborateur) => (
                    <SelectItem key={collaborateur.id} value={collaborateur.id}>
                      {collaborateur.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <RecapTable
        events={filteredEvents}
        collaborateurs={filteredCollaborateurs}
        selectedCollaborateur={selectedCollaborateur}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  )
}
