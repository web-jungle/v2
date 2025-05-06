"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Plus, Search, Filter, Car, AlertTriangle, Calendar, Truck, ArrowLeft } from "lucide-react"
import type { Vehicule } from "@/lib/logistique-types"
import { societes, etatsVehicule, typesProprietaire } from "@/lib/logistique-types"
import { vehiculesInitiaux } from "@/lib/logistique-data"
import VehiculeForm from "@/components/logistique/vehicule-form"
import VehiculeDetails from "@/components/logistique/vehicule-details"
import ExportLogistiqueExcel from "@/components/logistique/export-logistique-excel"

export default function ParcAutoPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [currentVehicule, setCurrentVehicule] = useState<Vehicule | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSociete, setFilterSociete] = useState<string | null>(null)
  const [filterEtat, setFilterEtat] = useState<string | null>(null)
  const [filterProprietaire, setFilterProprietaire] = useState<string | null>(null)
  const [filterAlerte, setFilterAlerte] = useState<boolean>(false)

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

  // Charger les véhicules
  useEffect(() => {
    // Simuler une requête API
    setVehicules(vehiculesInitiaux)
  }, [])

  // Calculer les véhicules qui nécessitent une attention
  const vehiculesEnAlerte = useMemo(() => {
    return vehicules.filter((vehicule) => {
      // Vérifier si le contrôle technique est bientôt expiré (moins de 30 jours)
      const isCtExpiringSoon = vehicule.dateLimiteControleTechnique
        ? (new Date(vehicule.dateLimiteControleTechnique).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) < 30
        : false

      // Vérifier si le contrôle pollution est bientôt expiré (moins de 30 jours)
      const isCtPollutionExpiringSoon = vehicule.dateLimiteControlePollution
        ? (new Date(vehicule.dateLimiteControlePollution).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) < 30
        : false

      // Vérifier si le kilométrage est proche de la prochaine révision (moins de 1000 km)
      const isKmCloseToRevision =
        vehicule.kilometrage &&
        vehicule.kmProchaineRevision &&
        vehicule.kmProchaineRevision - vehicule.kilometrage < 1000 &&
        vehicule.kmProchaineRevision > vehicule.kilometrage

      return isCtExpiringSoon || isCtPollutionExpiringSoon || isKmCloseToRevision
    })
  }, [vehicules])

  // Filtrer les véhicules
  const filteredVehicules = useMemo(() => {
    return vehicules.filter((vehicule) => {
      const matchesSearch =
        searchTerm === "" ||
        vehicule.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicule.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicule.immatriculation.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSociete = filterSociete === null || vehicule.societe === filterSociete
      const matchesEtat = filterEtat === null || vehicule.etat === filterEtat
      const matchesProprietaire = filterProprietaire === null || vehicule.proprietaire === filterProprietaire

      // Filtrer par alerte
      const matchesAlerte = !filterAlerte || vehiculesEnAlerte.includes(vehicule)

      return matchesSearch && matchesSociete && matchesEtat && matchesProprietaire && matchesAlerte
    })
  }, [vehicules, searchTerm, filterSociete, filterEtat, filterProprietaire, filterAlerte, vehiculesEnAlerte])

  // Gérer l'ajout d'un véhicule
  const handleAddVehicule = () => {
    setCurrentVehicule(null)
    setIsFormOpen(true)
  }

  // Gérer la modification d'un véhicule
  const handleEditVehicule = (vehicule: Vehicule) => {
    setCurrentVehicule(vehicule)
    setIsFormOpen(true)
  }

  // Gérer l'affichage des détails d'un véhicule
  const handleViewVehicule = (vehicule: Vehicule) => {
    setCurrentVehicule(vehicule)
    setIsDetailsOpen(true)
  }

  // Gérer la sauvegarde d'un véhicule
  const handleSaveVehicule = (vehicule: Vehicule) => {
    // Vérifier si c'est un nouveau véhicule ou une mise à jour
    if (vehicules.some((v) => v.id === vehicule.id)) {
      // Mise à jour
      setVehicules(vehicules.map((v) => (v.id === vehicule.id ? vehicule : v)))
      toast({
        title: "Véhicule mis à jour",
        description: "Les informations du véhicule ont été mises à jour avec succès.",
      })
    } else {
      // Création
      setVehicules([...vehicules, vehicule])
      toast({
        title: "Véhicule ajouté",
        description: "Le véhicule a été ajouté avec succès.",
      })
    }
    setIsFormOpen(false)
  }

  // Vérifier si un véhicule est en alerte
  const isVehiculeEnAlerte = (vehicule: Vehicule) => {
    return vehiculesEnAlerte.includes(vehicule)
  }

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return null
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/logistique")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Gestion du Parc Automobile</h1>
        </div>
        <div className="flex gap-2">
          <ExportLogistiqueExcel vehicules={vehicules} />
          <Button onClick={handleAddVehicule} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un véhicule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total véhicules</p>
                <h3 className="text-2xl font-bold">{vehicules.length}</h3>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Car className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Véhicules en alerte</p>
                <h3 className="text-2xl font-bold">{vehiculesEnAlerte.length}</h3>
              </div>
              <div className="p-2 bg-red-500/10 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contrôles à venir</p>
                <h3 className="text-2xl font-bold">
                  {
                    vehicules.filter(
                      (v) =>
                        v.dateLimiteControleTechnique &&
                        (new Date(v.dateLimiteControleTechnique).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24) <
                          30,
                    ).length
                  }
                </h3>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Révisions à venir</p>
                <h3 className="text-2xl font-bold">
                  {
                    vehicules.filter(
                      (v) =>
                        v.kilometrage &&
                        v.kmProchaineRevision &&
                        v.kmProchaineRevision - v.kilometrage < 1000 &&
                        v.kmProchaineRevision > v.kilometrage,
                    ).length
                  }
                </h3>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <Truck className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtres:</span>
        </div>

        <Select
          value={filterSociete || "all"}
          onValueChange={(value) => setFilterSociete(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les sociétés" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sociétés</SelectItem>
            {societes.map((societe) => (
              <SelectItem key={societe} value={societe}>
                {societe}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterEtat || "all"} onValueChange={(value) => setFilterEtat(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les états" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les états</SelectItem>
            {etatsVehicule.map((etat) => (
              <SelectItem key={etat} value={etat}>
                {etat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterProprietaire || "all"}
          onValueChange={(value) => setFilterProprietaire(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les propriétaires" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les propriétaires</SelectItem>
            {typesProprietaire.map((proprietaire) => (
              <SelectItem key={proprietaire} value={proprietaire}>
                {proprietaire}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="filterAlerte"
            checked={filterAlerte}
            onCheckedChange={(checked) => setFilterAlerte(checked as boolean)}
          />
          <label
            htmlFor="filterAlerte"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Véhicules en alerte
          </label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parc automobile</CardTitle>
          <CardDescription>
            {filteredVehicules.length} véhicule{filteredVehicules.length > 1 ? "s" : ""} trouvé
            {filteredVehicules.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Société</TableHead>
                  <TableHead>Marque</TableHead>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Immatriculation</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Kilométrage</TableHead>
                  <TableHead>Contrôle technique</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicules.map((vehicule) => {
                  // Vérifier si le contrôle technique est bientôt expiré (moins de 30 jours)
                  const isCtExpiringSoon = vehicule.dateLimiteControleTechnique
                    ? (new Date(vehicule.dateLimiteControleTechnique).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24) <
                      30
                    : false

                  return (
                    <TableRow key={vehicule.id} className={isVehiculeEnAlerte(vehicule) ? "bg-red-50" : ""}>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {vehicule.societe}
                        </Badge>
                      </TableCell>
                      <TableCell>{vehicule.marque}</TableCell>
                      <TableCell>{vehicule.modele}</TableCell>
                      <TableCell className="font-mono">{vehicule.immatriculation}</TableCell>
                      <TableCell>
                        <Badge
                          variant={vehicule.etat === "EN CIRCULATION" ? "default" : "destructive"}
                          className={vehicule.etat === "EN CIRCULATION" ? "bg-green-500" : ""}
                        >
                          {vehicule.etat}
                        </Badge>
                      </TableCell>
                      <TableCell>{vehicule.kilometrage ? `${vehicule.kilometrage} km` : "-"}</TableCell>
                      <TableCell>
                        {vehicule.dateLimiteControleTechnique ? (
                          <div className="flex items-center">
                            {new Date(vehicule.dateLimiteControleTechnique).toLocaleDateString("fr-FR")}
                            {isCtExpiringSoon && (
                              <AlertTriangle
                                className="h-4 w-4 ml-2 text-red-500"
                                title="Contrôle technique à renouveler bientôt"
                              />
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewVehicule(vehicule)}>
                          <Car className="h-4 w-4" />
                          <span className="sr-only">Détails</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditVehicule(vehicule)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/modification */}
      <VehiculeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        vehicule={currentVehicule}
        onSave={handleSaveVehicule}
      />

      {/* Détails du véhicule */}
      <VehiculeDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        vehicule={currentVehicule}
        onEdit={(vehicule) => {
          setIsDetailsOpen(false)
          setTimeout(() => handleEditVehicule(vehicule), 100)
        }}
      />
    </div>
  )
}
