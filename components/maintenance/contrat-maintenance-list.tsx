"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import type { ContratMaintenance } from "@/lib/maintenance-types"
import { formatDate, getStatusColor } from "@/lib/maintenance-utils"
import ContratMaintenanceModal from "./contrat-maintenance-modal"
import { useToast } from "@/components/ui/use-toast"

interface ContratMaintenanceListProps {
  contrats: ContratMaintenance[]
  onUpdateContrats: (contrats: ContratMaintenance[]) => void
}

export default function ContratMaintenanceList({ contrats, onUpdateContrats }: ContratMaintenanceListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedContrat, setSelectedContrat] = useState<ContratMaintenance | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  // Filtrer les contrats en fonction de la recherche et du filtre de statut
  const filteredContrats = contrats.filter((contrat) => {
    const matchesSearch =
      contrat.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrat.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrat.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter ? contrat.statut === statusFilter : true

    return matchesSearch && matchesStatus
  })

  // Trier les contrats par date d'échéance (les plus proches en premier)
  const sortedContrats = [...filteredContrats].sort((a, b) => {
    return new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime()
  })

  // Calculer les statistiques
  const stats = {
    total: contrats.length,
    actifs: contrats.filter((c) => c.statut === "Actif").length,
    expiration: contrats.filter((c) => {
      const today = new Date()
      const echeance = new Date(c.dateEcheance)
      const diffTime = echeance.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && c.statut === "Actif"
    }).length,
    expires: contrats.filter((c) => c.statut === "Expiré").length,
  }

  // Gérer la création ou la mise à jour d'un contrat
  const handleSaveContrat = (contrat: ContratMaintenance) => {
    if (isCreating) {
      // Ajouter un nouveau contrat
      const newContrat = {
        ...contrat,
        id: `contrat-${Date.now()}`,
        dateCreation: new Date().toISOString(),
      }
      onUpdateContrats([...contrats, newContrat])
      toast({
        title: "Contrat créé",
        description: `Le contrat pour ${contrat.client} a été créé avec succès.`,
      })
    } else {
      // Mettre à jour un contrat existant
      const updatedContrats = contrats.map((c) =>
        c.id === contrat.id ? { ...contrat, dateDerniereModification: new Date().toISOString() } : c,
      )
      onUpdateContrats(updatedContrats)
      toast({
        title: "Contrat mis à jour",
        description: `Le contrat pour ${contrat.client} a été mis à jour avec succès.`,
      })
    }
    setIsModalOpen(false)
    setSelectedContrat(null)
    setIsCreating(false)
  }

  // Vérifier si un contrat est proche de l'expiration (moins de 30 jours)
  const isNearExpiration = (dateEcheance: string) => {
    const today = new Date()
    const echeance = new Date(dateEcheance)
    const diffTime = echeance.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total des contrats</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <SlidersHorizontal className="h-5 w-5 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contrats actifs</p>
                  <h3 className="text-2xl font-bold">{stats.actifs}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expirent bientôt</p>
                  <h3 className="text-2xl font-bold">{stats.expiration}</h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contrats expirés</p>
                  <h3 className="text-2xl font-bold">{stats.expires}</h3>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un contrat..."
              className="pl-10 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>Tous les statuts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Actif")}>Actifs</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("En attente")}>En attente</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Expiré")}>Expirés</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Résilié")}>Résiliés</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Export en cours",
                  description: "L'export des contrats de maintenance est en cours de traitement.",
                })
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setIsCreating(true)
                setSelectedContrat(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contrat
            </Button>
          </div>
        </div>

        {/* Tableau des contrats */}
        <Card>
          <CardHeader>
            <CardTitle>Contrats de maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date d'échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContrats.length > 0 ? (
                  sortedContrats.map((contrat) => (
                    <TableRow key={contrat.id}>
                      <TableCell className="font-medium">{contrat.client}</TableCell>
                      <TableCell>{contrat.reference}</TableCell>
                      <TableCell>{contrat.type}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(contrat.montant)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {formatDate(contrat.dateEcheance)}
                          {isNearExpiration(contrat.dateEcheance) && contrat.statut === "Actif" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Bientôt expiré
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contrat.statut)}>{contrat.statut}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedContrat(contrat)
                                setIsCreating(false)
                                setIsModalOpen(true)
                              }}
                            >
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // Renouveler le contrat
                                const dateEcheance = new Date(contrat.dateEcheance)
                                dateEcheance.setFullYear(dateEcheance.getFullYear() + 1)

                                const renewedContrat = {
                                  ...contrat,
                                  dateEcheance: dateEcheance.toISOString(),
                                  statut: "Actif",
                                  dateDerniereModification: new Date().toISOString(),
                                }

                                const updatedContrats = contrats.map((c) => (c.id === contrat.id ? renewedContrat : c))

                                onUpdateContrats(updatedContrats)
                                toast({
                                  title: "Contrat renouvelé",
                                  description: `Le contrat pour ${contrat.client} a été renouvelé pour un an.`,
                                })
                              }}
                            >
                              Renouveler
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // Résilier le contrat
                                const terminatedContrat = {
                                  ...contrat,
                                  statut: "Résilié",
                                  dateDerniereModification: new Date().toISOString(),
                                }

                                const updatedContrats = contrats.map((c) =>
                                  c.id === contrat.id ? terminatedContrat : c,
                                )

                                onUpdateContrats(updatedContrats)
                                toast({
                                  title: "Contrat résilié",
                                  description: `Le contrat pour ${contrat.client} a été résilié.`,
                                })
                              }}
                            >
                              Résilier
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Aucun contrat de maintenance trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal pour créer/éditer un contrat */}
      {isModalOpen && (
        <ContratMaintenanceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedContrat(null)
            setIsCreating(false)
          }}
          contrat={selectedContrat}
          isCreating={isCreating}
          onSave={handleSaveContrat}
        />
      )}
    </>
  )
}
