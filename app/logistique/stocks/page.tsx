"use client"

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
import { Pencil, Plus, Search, Filter, Package, ArrowLeft, Cable, Codesandbox, Trash } from "lucide-react"
import type { StockItem } from "@/lib/logistique-types"
import { cableTypes, typeMs, typeGs, typeEnroulements } from "@/lib/logistique-types"
import { stockItemsInitiaux } from "@/lib/logistique-stock-data"
import StockItemForm from "@/components/logistique/stock-item-form"
import ExportStockExcel from "@/components/logistique/export-stock-excel"

export default function StocksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentStockItem, setCurrentStockItem] = useState<StockItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCableType, setFilterCableType] = useState<string | null>(null)
  const [filterTypeM, setFilterTypeM] = useState<string | null>(null)
  const [filterTypeG, setFilterTypeG] = useState<string | null>(null)
  const [filterEnroulement, setFilterEnroulement] = useState<string | null>(null)

  // Vérifier si l'utilisateur est admin ou manager
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "manager") {
      router.push("/")
      toast({
        title: "Accès limité",
        description: "La gestion des stocks est réservée aux administrateurs et managers.",
        variant: "destructive",
      })
    }
  }, [user, router, toast])

  // Charger les éléments de stock
  useEffect(() => {
    // Simuler une requête API
    setStockItems(stockItemsInitiaux)
  }, [])

  // Filtrer les éléments de stock
  const filteredStockItems = useMemo(() => {
    return stockItems.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.cableType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${item.cableType} ${item.typeM} ${item.typeG}`.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCableType = filterCableType === null || item.cableType === filterCableType
      const matchesTypeM = filterTypeM === null || item.typeM === filterTypeM
      const matchesTypeG = filterTypeG === null || item.typeG === filterTypeG
      const matchesEnroulement = filterEnroulement === null || item.enroulement === filterEnroulement

      return matchesSearch && matchesCableType && matchesTypeM && matchesTypeG && matchesEnroulement
    })
  }, [stockItems, searchTerm, filterCableType, filterTypeM, filterTypeG, filterEnroulement])

  // Calculer les statistiques
  const stats = useMemo(() => {
    const touretCount = filteredStockItems.filter((item) => item.enroulement === "Touret").length
    const couronneCount = filteredStockItems.filter((item) => item.enroulement === "Couronne").length

    const totalLength = filteredStockItems.reduce((sum, item) => sum + item.longueur, 0)

    // Calculer la longueur totale par type de câble
    const lengthByType = cableTypes.reduce(
      (acc, type) => {
        acc[type] = filteredStockItems
          .filter((item) => item.cableType === type)
          .reduce((sum, item) => sum + item.longueur, 0)
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      touretCount,
      couronneCount,
      totalLength,
      lengthByType,
    }
  }, [filteredStockItems])

  // Gérer l'ajout d'un élément de stock
  const handleAddStockItem = () => {
    setCurrentStockItem(null)
    setIsFormOpen(true)
  }

  // Gérer la modification d'un élément de stock
  const handleEditStockItem = (stockItem: StockItem) => {
    setCurrentStockItem(stockItem)
    setIsFormOpen(true)
  }

  // Gérer la sauvegarde d'un élément de stock
  const handleSaveStockItem = (stockItem: StockItem) => {
    // Vérifier si c'est un nouvel élément ou une mise à jour
    if (stockItems.some((item) => item.id === stockItem.id)) {
      // Mise à jour
      setStockItems(stockItems.map((item) => (item.id === stockItem.id ? stockItem : item)))
      toast({
        title: "Élément mis à jour",
        description: "Les informations de l'élément de stock ont été mises à jour avec succès.",
      })
    } else {
      // Création
      setStockItems([...stockItems, stockItem])
      toast({
        title: "Élément ajouté",
        description: "L'élément de stock a été ajouté avec succès.",
      })
    }
    setIsFormOpen(false)
  }

  // Gérer la suppression d'un élément de stock
  const handleDeleteStockItem = (id: string) => {
    setStockItems(stockItems.filter((item) => item.id !== id))
    toast({
      title: "Élément supprimé",
      description: "L'élément de stock a été supprimé avec succès.",
    })
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
          <h1 className="text-3xl font-bold">Gestion des Stocks de Câbles</h1>
        </div>
        <div className="flex gap-2">
          <ExportStockExcel stockItems={stockItems} />
          <Button onClick={handleAddStockItem} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un élément
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total éléments</p>
                <h3 className="text-2xl font-bold">{filteredStockItems.length}</h3>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tourets</p>
                <h3 className="text-2xl font-bold">{stats.touretCount}</h3>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Codesandbox className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Couronnes</p>
                <h3 className="text-2xl font-bold">{stats.couronneCount}</h3>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <Cable className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Longueur totale</p>
                <h3 className="text-2xl font-bold">{stats.totalLength} m</h3>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-full">
                <Cable className="h-5 w-5 text-purple-500" />
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
          value={filterCableType || "all"}
          onValueChange={(value) => setFilterCableType(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les types de câble" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {cableTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterTypeM || "all"} onValueChange={(value) => setFilterTypeM(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les modules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les modules</SelectItem>
            {typeMs.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterTypeG || "all"} onValueChange={(value) => setFilterTypeG(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les types de fibre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {typeGs.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterEnroulement || "all"}
          onValueChange={(value) => setFilterEnroulement(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les enroulements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les enroulements</SelectItem>
            {typeEnroulements.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock de câbles fibre optique</CardTitle>
          <CardDescription>
            {filteredStockItems.length} élément{filteredStockItems.length > 1 ? "s" : ""} trouvé
            {filteredStockItems.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type de câble</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Type de fibre</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Enroulement</TableHead>
                  <TableHead>Longueur (m)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {item.cableType}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.typeM}</TableCell>
                    <TableCell>{item.typeG}</TableCell>
                    <TableCell className="font-medium">
                      {item.cableType} {item.typeM} {item.typeG}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.enroulement === "Touret" ? "default" : "secondary"}
                        className={item.enroulement === "Touret" ? "bg-orange-500" : "bg-green-500"}
                      >
                        {item.enroulement}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.longueur} m</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditStockItem(item)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStockItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif par type de câble</CardTitle>
          <CardDescription>Longueur totale par type de câble</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.lengthByType)
              .filter(([_, length]) => length > 0)
              .map(([type, length]) => (
                <Card key={type}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{type}</p>
                        <h3 className="text-xl font-bold">{length} m</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {filteredStockItems.filter((item) => item.cableType === type).length} élément(s)
                        </p>
                      </div>
                      <div className="p-2 bg-blue-500/10 rounded-full">
                        <Cable className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/modification */}
      <StockItemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        stockItem={currentStockItem}
        onSave={handleSaveStockItem}
      />
    </div>
  )
}
