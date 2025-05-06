"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Users, Briefcase, Building, Calendar } from "lucide-react"
import type { Salarie } from "@/lib/rh-types"

interface StatistiquesRHProps {
  salaries: Salarie[]
}

export default function StatistiquesRH({ salaries }: StatistiquesRHProps) {
  // Statistiques par entreprise
  const statsByEntreprise = useMemo(() => {
    const stats = salaries.reduce(
      (acc, salarie) => {
        acc[salarie.entreprise] = (acc[salarie.entreprise] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
    }))
  }, [salaries])

  // Statistiques par type de contrat
  const statsByContrat = useMemo(() => {
    const stats = salaries.reduce(
      (acc, salarie) => {
        acc[salarie.typeContrat] = (acc[salarie.typeContrat] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
    }))
  }, [salaries])

  // Statistiques par classification
  const statsByClassification = useMemo(() => {
    const stats = salaries.reduce(
      (acc, salarie) => {
        acc[salarie.classification] = (acc[salarie.classification] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
    }))
  }, [salaries])

  // Statistiques par poste
  const statsByPoste = useMemo(() => {
    const stats = salaries.reduce(
      (acc, salarie) => {
        acc[salarie.poste] = (acc[salarie.poste] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(stats)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 des postes
  }, [salaries])

  // Couleurs pour les graphiques
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total salariés</p>
                <h3 className="text-2xl font-bold">{salaries.length}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CDI</p>
                <h3 className="text-2xl font-bold">{salaries.filter((s) => s.typeContrat === "CDI").length}</h3>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <Briefcase className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CDD/Alternance</p>
                <h3 className="text-2xl font-bold">{salaries.filter((s) => s.typeContrat !== "CDI").length}</h3>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entreprises</p>
                <h3 className="text-2xl font-bold">{new Set(salaries.map((s) => s.entreprise)).size}</h3>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Building className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par entreprise</CardTitle>
            <CardDescription>Distribution des salariés par entreprise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsByEntreprise}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statsByEntreprise.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par type de contrat</CardTitle>
            <CardDescription>Distribution des salariés par type de contrat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsByContrat}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statsByContrat.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par classification</CardTitle>
            <CardDescription>Distribution des salariés par classification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statsByClassification}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Salariés" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 des postes</CardTitle>
            <CardDescription>Les postes les plus représentés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statsByPoste}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Salariés" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
