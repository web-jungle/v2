"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Calendar,
  FileText,
  Filter,
  Plus,
  Search,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Check,
  X,
  RefreshCw,
} from "lucide-react"
import { format, differenceInCalendarDays } from "date-fns"
import { fr } from "date-fns/locale"
import { demandesCongesInitiales } from "@/lib/conges-data"
import type { DemandeConge, StatutConge, TypeConge, StatistiquesConges } from "@/lib/conges-types"
import DetailsCongeModal from "@/components/rh/details-conge-modal"
import LoadingSpinner from "@/components/loading-spinner"
import DemandeCongeFormFixed from "@/components/rh/demande-conge-form-fixed"
import { collaborateurs } from "@/lib/data"
import type { Evenement, TypeAbsence } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"

export default function CongesPage() {
  const { user, globalEvents, updateEvents } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // États principaux
  const [demandes, setDemandes] = useState<DemandeConge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<StatutConge | "all">("all")
  const [filterType, setFilterType] = useState<TypeConge | "all">("all")
  const [activeTab, setActiveTab] = useState("demandes")

  // États pour les modales et formulaires
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [currentDemande, setCurrentDemande] = useState<DemandeConge | null>(null)
  const [commentaire, setCommentaire] = useState("")

  // État pour la confirmation de changement de statut
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    demandeId: string
    newStatus: StatutConge
    oldStatus: StatutConge
    commentaire: string
  }>({
    isOpen: false,
    demandeId: "",
    newStatus: "En attente",
    oldStatus: "En attente",
    commentaire: "",
  })

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Charger les demandes
    setDemandes([...demandesCongesInitiales])
    setIsLoading(false)

    // Vérifier s'il y a un ID de demande dans le localStorage
    const demandeId = localStorage.getItem("selectedDemandeId")
    if (demandeId) {
      const demande = demandesCongesInitiales.find((d) => d.id === demandeId)
      if (demande) {
        setCurrentDemande(demande)
        setIsDetailsOpen(true)
      }
      // Supprimer l'ID du localStorage après utilisation
      localStorage.removeItem("selectedDemandeId")
    }
  }, [user, router])

  // Filtrer les demandes selon le rôle de l'utilisateur
  const filteredDemandes = demandes.filter((demande) => {
    // Filtrer selon le rôle
    if (user?.role === "collaborateur" && demande.utilisateurId !== user.id) {
      return false
    }

    if (user?.role === "manager") {
      const collaborateursGeres = user.collaborateursGeres || []
      if (demande.utilisateurId !== user.id && !collaborateursGeres.includes(demande.collaborateurId)) {
        return false
      }
    }

    // Appliquer les filtres de recherche et de statut
    const matchesSearch =
      searchTerm === "" ||
      demande.collaborateurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.motif.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatut = filterStatut === "all" || demande.statut === filterStatut
    const matchesType = filterType === "all" || demande.typeConge === filterType

    return matchesSearch && matchesStatut && matchesType
  })

  // Trier les demandes par date de création (plus récentes en premier)
  const sortedDemandes = [...filteredDemandes].sort(
    (a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime(),
  )

  // Calculer les statistiques
  const statistiques: StatistiquesConges = {
    totalDemandes: filteredDemandes.length,
    enAttente: filteredDemandes.filter((d) => d.statut === "En attente").length,
    approuvees: filteredDemandes.filter((d) => d.statut === "Approuvé").length,
    refusees: filteredDemandes.filter((d) => d.statut === "Refusé").length,
    parType: {
      "Congés payés": 0,
      RTT: 0,
      "Congé sans solde": 0,
      Maladie: 0,
      Autre: 0,
    },
    parMois: {},
  }

  // Compter par type
  filteredDemandes.forEach((d) => {
    statistiques.parType[d.typeConge]++

    // Compter par mois
    const moisDebut = format(new Date(d.dateDebut), "yyyy-MM")
    statistiques.parMois[moisDebut] = (statistiques.parMois[moisDebut] || 0) + 1
  })

  // Gérer l'ajout d'une demande
  const handleAddDemande = () => {
    setCurrentDemande(null)
    setIsFormOpen(true)
  }

  // Gérer la sauvegarde d'une demande
  const handleSaveDemande = (demande: DemandeConge) => {
    // Vérifier si c'est une nouvelle demande ou une mise à jour
    if (demandes.some((d) => d.id === demande.id)) {
      // Mise à jour
      setDemandes(demandes.map((d) => (d.id === demande.id ? demande : d)))
      toast({
        title: "Demande mise à jour",
        description: "Votre demande de congés a été mise à jour avec succès.",
      })
    } else {
      // Création
      setDemandes([...demandes, demande])
      toast({
        title: "Demande envoyée",
        description: "Votre demande de congés a été envoyée avec succès.",
      })
    }
    setIsFormOpen(false)
  }

  // Gérer la fermeture du modal de détails
  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setCurrentDemande(null)
    setCommentaire("")
  }

  // Vérifier si l'utilisateur peut modifier le statut d'une demande
  const canChangeStatus = (demande: DemandeConge) => {
    if (!user) return false

    // Les admins peuvent toujours modifier le statut
    if (user.role === "admin") return true

    // Les managers peuvent modifier le statut des demandes de leurs collaborateurs
    if (user.role === "manager") {
      const collaborateursGeres = user.collaborateursGeres || []
      return collaborateursGeres.includes(demande.collaborateurId)
    }

    return false
  }

  // Convertir le type de congé en type d'absence
  const convertTypeCongeToTypeAbsence = (typeConge: TypeConge): TypeAbsence => {
    switch (typeConge) {
      case "Congés payés":
        return "CP"
      case "RTT":
        return "RTT"
      case "Congé sans solde":
        return "CSS"
      case "Maladie":
        return "Arrêt Travail"
      default:
        return "Abs Inj"
    }
  }

  // Créer un événement d'absence dans le planning
  const createAbsenceEvent = (demande: DemandeConge): Evenement | null => {
    // Trouver le collaborateur
    const collaborateur = collaborateurs.find((c) => c.id === demande.collaborateurId)
    if (!collaborateur) {
      console.error("Collaborateur non trouvé:", demande.collaborateurId)
      return null
    }

    // Convertir le type de congé en type d'absence
    const typeAbsence = convertTypeCongeToTypeAbsence(demande.typeConge)

    // Créer un événement d'absence
    return {
      id: `conge-${demande.id}`,
      title: `${collaborateur.nom} - ${typeAbsence}`,
      start: new Date(demande.dateDebut),
      end: new Date(demande.dateFin),
      collaborateurId: demande.collaborateurId,
      typeEvenement: "absence",
      lieuChantier: "",
      zoneTrajet: "",
      panierRepas: false,
      heuresSupplementaires: 0,
      grandDeplacement: false,
      prgd: false,
      nombrePRGD: 0,
      ticketRestaurant: false,
      typeAbsence: typeAbsence,
      verrouille: true, // Verrouiller l'événement pour éviter les modifications
    }
  }

  // Supprimer un événement d'absence du planning
  const removeAbsenceEvent = (demandeId: string) => {
    const eventId = `conge-${demandeId}`
    const updatedEvents = globalEvents.filter((event) => event.id !== eventId)
    updateEvents(updatedEvents)
    console.log("Événement d'absence supprimé:", eventId)
  }

  // Ouvrir le dialogue de confirmation pour changer le statut
  const openConfirmDialog = (demandeId: string, newStatus: StatutConge) => {
    const demande = demandes.find((d) => d.id === demandeId)
    if (!demande) return

    setConfirmDialog({
      isOpen: true,
      demandeId,
      newStatus,
      oldStatus: demande.statut,
      commentaire: "",
    })
  }

  // Fonction pour changer le statut d'une demande
  const changeDemandeStatus = (demandeId: string, newStatus: StatutConge, commentaire = "") => {
    console.log(`Changement de statut pour la demande ${demandeId} vers ${newStatus}`)

    // Trouver la demande
    const demandeToUpdate = demandes.find((d) => d.id === demandeId)
    if (!demandeToUpdate) {
      console.error("Demande non trouvée:", demandeId)
      return
    }

    // Créer une copie mise à jour de la demande
    const updatedDemande = {
      ...demandeToUpdate,
      statut: newStatus,
      commentaireAdmin: commentaire || demandeToUpdate.commentaireAdmin,
      dateModification: new Date(),
    }

    // Mettre à jour l'état des demandes
    const updatedDemandes = demandes.map((d) => (d.id === demandeId ? updatedDemande : d))

    // Mettre à jour l'état
    setDemandes(updatedDemandes)
    console.log("État des demandes mis à jour:", updatedDemandes)

    // Gérer les événements d'absence
    if (newStatus === "Approuvé") {
      // Si la demande est approuvée, créer un événement d'absence
      // Vérifier d'abord si l'événement existe déjà
      const existingEvent = globalEvents.find((e) => e.id === `conge-${demandeId}`)
      if (!existingEvent) {
        const newEvent = createAbsenceEvent(updatedDemande)
        if (newEvent) {
          const updatedEvents = [...globalEvents, newEvent]
          updateEvents(updatedEvents)
          console.log("Événement d'absence créé:", newEvent)
        }
      }
    } else if (demandeToUpdate.statut === "Approuvé" && newStatus !== "Approuvé") {
      // Si la demande était approuvée et ne l'est plus, supprimer l'événement d'absence
      removeAbsenceEvent(demandeId)
    }

    // Notification
    toast({
      title: `Demande ${newStatus.toLowerCase()}`,
      description: `La demande de congés a été ${newStatus.toLowerCase()} avec succès.`,
    })

    // Fermer le modal de détails si ouvert
    if (isDetailsOpen) {
      handleCloseDetails()
    }

    // Fermer le dialogue de confirmation
    setConfirmDialog({
      isOpen: false,
      demandeId: "",
      newStatus: "En attente",
      oldStatus: "En attente",
      commentaire: "",
    })
  }

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeColor = (statut: StatutConge) => {
    switch (statut) {
      case "Approuvé":
        return "bg-green-500"
      case "Refusé":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  // Formater la date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy")
  }

  // Calculer la durée en jours
  const calculateDuration = (dateDebut: Date, dateFin: Date) => {
    return differenceInCalendarDays(new Date(dateFin), new Date(dateDebut)) + 1
  }

  // Gérer la modification d'une demande
  const handleModifierDemande = () => {
    if (currentDemande) {
      handleCloseDetails()
      setTimeout(() => {
        setCurrentDemande(currentDemande)
        setIsFormOpen(true)
      }, 100)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Chargement des demandes de congés..." />
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/rh")} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Button>
          <h1 className="text-3xl font-bold">Gestion des Congés</h1>
        </div>
        <Button onClick={handleAddDemande} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      <Tabs defaultValue="demandes" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="demandes">Demandes de congés</TabsTrigger>
          <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="demandes" className="space-y-4 mt-4">
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

            <Select value={filterStatut} onValueChange={(value) => setFilterStatut(value as StatutConge | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="Approuvé">Approuvé</SelectItem>
                <SelectItem value="Refusé">Refusé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(value) => setFilterType(value as TypeConge | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Congés payés">Congés payés</SelectItem>
                <SelectItem value="RTT">RTT</SelectItem>
                <SelectItem value="Congé sans solde">Congé sans solde</SelectItem>
                <SelectItem value="Maladie">Maladie</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des demandes</CardTitle>
              <CardDescription>
                {sortedDemandes.length} demande{sortedDemandes.length > 1 ? "s" : ""} de congés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Collaborateur</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de demande</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDemandes.length > 0 ? (
                      sortedDemandes.map((demande) => (
                        <TableRow key={demande.id}>
                          <TableCell className="font-medium">{demande.collaborateurNom}</TableCell>
                          <TableCell>
                            Du {formatDate(demande.dateDebut)} au {formatDate(demande.dateFin)}
                          </TableCell>
                          <TableCell>{calculateDuration(demande.dateDebut, demande.dateFin)} jour(s)</TableCell>
                          <TableCell>{demande.typeConge}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={demande.motif}>
                            {demande.motif}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(demande.statut)}>{demande.statut}</Badge>
                          </TableCell>
                          <TableCell>{format(new Date(demande.dateCreation), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentDemande(demande)
                                  setIsDetailsOpen(true)
                                }}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Détails
                              </Button>

                              {/* Actions pour les demandes */}
                              {canChangeStatus(demande) && (
                                <div className="flex gap-1">
                                  {/* Bouton pour approuver */}
                                  {demande.statut !== "Approuvé" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-green-500 text-green-500 hover:bg-green-50"
                                      onClick={() => openConfirmDialog(demande.id, "Approuvé")}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}

                                  {/* Bouton pour refuser */}
                                  {demande.statut !== "Refusé" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-red-500 text-red-500 hover:bg-red-50"
                                      onClick={() => openConfirmDialog(demande.id, "Refusé")}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}

                                  {/* Bouton pour remettre en attente */}
                                  {demande.statut !== "En attente" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                                      onClick={() => openConfirmDialog(demande.id, "En attente")}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Aucune demande de congés trouvée.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistiques" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total des demandes</p>
                    <h3 className="text-2xl font-bold">{statistiques.totalDemandes}</h3>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En attente</p>
                    <h3 className="text-2xl font-bold">{statistiques.enAttente}</h3>
                  </div>
                  <div className="p-2 bg-yellow-500/10 rounded-full">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approuvées</p>
                    <h3 className="text-2xl font-bold">{statistiques.approuvees}</h3>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Refusées</p>
                    <h3 className="text-2xl font-bold">{statistiques.refusees}</h3>
                  </div>
                  <div className="p-2 bg-red-500/10 rounded-full">
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par type de congés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statistiques.parType).map(([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2"
                          style={{
                            width: `${statistiques.totalDemandes > 0 ? (count / statistiques.totalDemandes) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statistiques.parMois)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([mois, count]) => {
                      const [year, month] = mois.split("-")
                      const monthName = format(
                        new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1),
                        "MMMM yyyy",
                        {
                          locale: fr,
                        },
                      )

                      return (
                        <div key={mois} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{monthName}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-green-500 rounded-full h-2"
                              style={{
                                width: `${statistiques.totalDemandes > 0 ? (count / statistiques.totalDemandes) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Formulaire de demande de congés */}
      <DemandeCongeFormFixed
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveDemande}
        demande={currentDemande}
      />

      {/* Modal de détails de la demande */}
      <DetailsCongeModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        demande={currentDemande}
        commentaireAdmin={commentaire}
        setCommentaireAdmin={setCommentaire}
        onUpdateStatut={changeDemandeStatus}
        onModifier={handleModifierDemande}
        userRole={user?.role}
        userId={user?.id}
        getStatusBadgeColor={getStatusBadgeColor}
      />

      {/* Dialogue de confirmation pour le changement de statut */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setConfirmDialog({ ...confirmDialog, isOpen: false })
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newStatus === "Approuvé"
                ? "Approuver la demande"
                : confirmDialog.newStatus === "Refusé"
                  ? "Refuser la demande"
                  : "Remettre la demande en attente"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.oldStatus !== "En attente" && (
                <p className="mb-2 font-medium text-amber-600">
                  Attention : Cette demande a déjà été {confirmDialog.oldStatus.toLowerCase()}.
                </p>
              )}
              Êtes-vous sûr de vouloir{" "}
              {confirmDialog.newStatus === "Approuvé"
                ? "approuver"
                : confirmDialog.newStatus === "Refusé"
                  ? "refuser"
                  : "remettre en attente"}{" "}
              cette demande de congés ?
              {confirmDialog.newStatus === "Approuvé" && (
                <p className="mt-2">Un événement d'absence sera automatiquement créé dans le planning.</p>
              )}
              {confirmDialog.oldStatus === "Approuvé" && confirmDialog.newStatus !== "Approuvé" && (
                <p className="mt-2">L'événement d'absence sera supprimé du planning.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4">
            <Textarea
              placeholder="Ajouter un commentaire (optionnel)"
              value={confirmDialog.commentaire}
              onChange={(e) => {
                setConfirmDialog({
                  ...confirmDialog,
                  commentaire: e.target.value,
                })
              }}
              className="min-h-[100px]"
            />
          </div>

          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                changeDemandeStatus(confirmDialog.demandeId, confirmDialog.newStatus, confirmDialog.commentaire)
              }
              className={
                confirmDialog.newStatus === "Approuvé"
                  ? "bg-green-500 hover:bg-green-600"
                  : confirmDialog.newStatus === "Refusé"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
              }
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
