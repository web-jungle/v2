"use client"

import ExportRHExcel from "@/components/rh/export-rh-excel"
import ImportCSV from "@/components/rh/import-csv"
import SalarieDetails from "@/components/rh/salarie-details"
import SalarieForm from "@/components/rh/salarie-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { Salarie } from "@/lib/rh-types"
import { ArrowLeft, FileText, Filter, Pencil, Plus, Search, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PersonnelPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [salaries, setSalaries] = useState<Salarie[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [currentSalarie, setCurrentSalarie] = useState<Salarie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEntreprise, setFilterEntreprise] = useState<string | null>(null)

  // Vérifier si l'utilisateur est admin ou manager
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "manager") {
      router.push("/")
      toast({
        title: "Accès limité",
        description: "La gestion RH est réservée aux administrateurs et managers.",
        variant: "destructive",
      })
    }
  }, [user, router, toast])

  // Charger les salariés depuis l'API
  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/salaries')
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des salariés')
        }
        
        const data = await response.json()
        setSalaries(data)
      } catch (error) {
        console.error("Erreur lors du chargement des salariés:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les salariés.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user) {
      fetchSalaries()
    }
  }, [user, toast])

  // Filtrer les salariés
  const filteredSalaries = salaries.filter((salarie) => {
    const matchesSearch =
      searchTerm === "" ||
      salarie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salarie.poste.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEntreprise = filterEntreprise === null || salarie.entreprise === filterEntreprise

    return matchesSearch && matchesEntreprise
  })

  // Gérer l'ajout d'un salarié
  const handleAddSalarie = () => {
    setCurrentSalarie(null)
    setIsFormOpen(true)
  }
  const handleDeleteSalarie = (id: string) => {
    console.log("Suppression du salarié avec l'ID:", id)
  }

  // Gérer l'affichage des détails d'un salarié
  const handleViewSalarie = (salarie: Salarie) => {
    setCurrentSalarie(salarie)
    setIsDetailsOpen(true)
  }

  // Gérer la modification d'un salarié
  const handleEditSalarie = (salarie: Salarie) => {
    setCurrentSalarie(salarie)
    setIsFormOpen(true)
  }

  // Fonction qui sauvegarde un salarié
  const handleSaveSalarie = async (salarie: Salarie) => {
    try {
      setIsLoading(true);
      let response;

      if (salarie.id && !salarie.id.startsWith("temp_")) {
        // Mise à jour d'un salarié existant
        response = await fetch(`/api/salaries/${salarie.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(salarie),
        });
      } else {
        // Création d'un nouveau salarié
        response = await fetch('/api/salaries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(salarie),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue lors de l'enregistrement du salarié");
      }

      const data = await response.json();
      
      // Rafraîchir la liste des salariés
      setSalaries((prev) => {
        const index = prev.findIndex((s) => s.id === data.id);
        if (index >= 0) {
          return [...prev.slice(0, index), data, ...prev.slice(index + 1)];
        } else {
          return [...prev, data];
        }
      });

      setIsFormOpen(false);
      setCurrentSalarie(null);
      toast({
        title: "Succès",
        description: `Salarié ${salarie.id ? 'modifié' : 'ajouté'} avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du salarié:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder le salarié.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'importation de salariés
  const handleImportSalaries = async (importedSalaries: Salarie[]) => {
    try {
      const createdSalaries = []
      
      // Créer chaque salarié via l'API
      for (const salarieData of importedSalaries) {
        const response = await fetch('/api/salaries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(salarieData),
        })
        
        if (!response.ok) {
          console.error(`Erreur lors de l'importation du salarié ${salarieData.nom} ${salarieData.prenom}`)
          continue
        }
        
        const newSalarie = await response.json()
        createdSalaries.push(newSalarie)
      }
      
      // Mettre à jour la liste des salariés
      setSalaries([...salaries, ...createdSalaries])
      
      toast({
        title: "Importation réussie",
        description: `${createdSalaries.length} salariés ont été importés avec succès.`,
      })
    } catch (error) {
      console.error('Erreur lors de l\'importation des salariés:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'importer tous les salariés.",
        variant: "destructive",
      })
    }
  }

  // Obtenir la liste des entreprises uniques
  const entreprises = Array.from(new Set(salaries.map((s) => s.entreprise)))

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold">Gestion du Personnel</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            Importer CSV
          </Button>
          <ExportRHExcel salaries={filteredSalaries} />
          <Button onClick={handleAddSalarie} className="bg-green-500 hover:bg-green-600">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un salarié
          </Button>
        </div>
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

        <select
          className="border rounded-md px-3 py-2 bg-background"
          value={filterEntreprise || ""}
          onChange={(e) => setFilterEntreprise(e.target.value || null)}
        >
          <option value="">Toutes les entreprises</option>
          {entreprises.map((entreprise) => (
            <option key={entreprise} value={entreprise}>
              {entreprise}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des salariés</CardTitle>
          <CardDescription>
            {filteredSalaries.length} salarié{filteredSalaries.length > 1 ? "s" : ""} trouvé
            {filteredSalaries.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Type de contrat</TableHead>
                  <TableHead>Date d'entrée</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalaries.length > 0 ? (
                  filteredSalaries.map((salarie) => (
                    <TableRow key={salarie.id}>
                      <TableCell className="font-medium">{salarie.nom}</TableCell>
                      <TableCell>{salarie.prenom}</TableCell>
                      <TableCell>{salarie.poste}</TableCell>
                      <TableCell>{salarie.entreprise}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{salarie.classification}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={salarie.typeContrat === "CDI" ? "default" : "secondary"}
                          className={salarie.typeContrat === "CDI" ? "bg-green-500" : ""}
                        >
                          {salarie.typeContrat}
                          {salarie.dureeContrat ? ` (${salarie.dureeContrat})` : ""}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(salarie.dateEntree).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewSalarie(salarie)}>
                          <FileText className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditSalarie(salarie)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSalarie(salarie.id)}>
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                        
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun salarié trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/modification de salarié */}
      <SalarieForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        salarie={currentSalarie}
        onSave={handleSaveSalarie}
      />

      {/* Détails du salarié */}
      <SalarieDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        salarie={currentSalarie}
        onEdit={(salarie) => {
          setIsDetailsOpen(false)
          setTimeout(() => handleEditSalarie(salarie), 100)
        }}
      />

      {/* Importation CSV */}
      <ImportCSV
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportSalaries}
        existingSalaries={salaries}
      />
    </div>
  )
}
