"use client";

import LoadingSpinner from "@/components/loading-spinner";
import DemandeCongeFormFixed from "@/components/rh/demande-conge-form-fixed";
import DetailsCongeModal from "@/components/rh/details-conge-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import type {
  DemandeConge,
  StatistiquesConges,
  StatutConge,
  TypeConge,
} from "@/lib/conges-types";
import { collaborateurs } from "@/lib/data";
import type { Evenement, TypeAbsence } from "@/lib/types";
import { differenceInCalendarDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CongesPage() {
  const { user, globalEvents, updateEvents } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // États principaux
  const [demandes, setDemandes] = useState<DemandeConge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState<StatutConge | "all">("all");
  const [filterType, setFilterType] = useState<TypeConge | "all">("all");
  const [activeTab, setActiveTab] = useState("demandes");

  // États pour les modales et formulaires
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentDemande, setCurrentDemande] = useState<DemandeConge | null>(
    null
  );
  const [commentaire, setCommentaire] = useState("");

  // État pour la confirmation de changement de statut
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    demandeId: string;
    newStatus: StatutConge;
    oldStatus: StatutConge;
    commentaire: string;
  }>({
    isOpen: false,
    demandeId: "",
    newStatus: "En attente",
    oldStatus: "En attente",
    commentaire: "",
  });

  // Charger les demandes depuis l'API
  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Récupérer le token d'authentification
        const authToken = localStorage.getItem("auth_token");

        if (!authToken) {
          throw new Error("Vous n'êtes pas connecté");
        }

        // Construction de l'URL avec paramètres selon le rôle
        let url = "/api/conges";

        // On passe le collaborateur_id en paramètre de requête si ce n'est pas un admin
        if (user.role !== "admin") {
          // Récupérer les infos utilisateur depuis le localStorage
          const userInfo = JSON.parse(
            localStorage.getItem("user_info") || "{}"
          );
          const collaborateurId = userInfo.collaborateur_id;

          console.log("Infos utilisateur depuis localStorage:", userInfo);
          console.log("ID collaborateur récupéré:", collaborateurId);

          // Pour le collaborateur ou le manager, on filtre par collaborateur_id
          url += `?collaborateur_id=${collaborateurId}`;
        }

        console.log("URL de récupération des congés:", url);
        console.log("ID de l'utilisateur connecté:", user.id);
        console.log("ID du collaborateur associé:", user.collaborateur_id);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Données reçues de l'API:", data.length, "demandes");

        // Traiter les dates
        const processedData = data.map((demande: any) => ({
          ...demande,
          dateDebut: new Date(demande.dateDebut),
          dateFin: new Date(demande.dateFin),
          dateCreation: new Date(demande.dateCreation),
          dateModification: new Date(demande.dateModification),
        }));

        setDemandes(processedData);
        console.log("Demandes de congés chargées:", processedData.length);

        // Vérifier s'il y a un ID de demande dans le localStorage
        const demandeId = localStorage.getItem("selectedDemandeId");
        if (demandeId) {
          const demande = processedData.find(
            (d: DemandeConge) => d.id === demandeId
          );
          if (demande) {
            setCurrentDemande(demande);
            setIsDetailsOpen(true);
          }
          // Supprimer l'ID du localStorage après utilisation
          localStorage.removeItem("selectedDemandeId");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des demandes:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des demandes"
        );
        setDemandes([]); // Initialiser avec un tableau vide en cas d'erreur
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemandes();
  }, [user, router]);

  // Filtrer les demandes selon le rôle de l'utilisateur
  const filteredDemandes = demandes.filter((demande) => {
    // Appliquer uniquement les filtres de recherche et de statut
    const matchesSearch =
      searchTerm === "" ||
      demande.collaborateurNom
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      demande.motif.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatut =
      filterStatut === "all" || demande.statut === filterStatut;
    const matchesType =
      filterType === "all" || demande.typeConge === filterType;

    return matchesSearch && matchesStatut && matchesType;
  });

  // Trier les demandes par date de création (plus récentes en premier)
  const sortedDemandes = [...filteredDemandes].sort(
    (a, b) =>
      new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
  );

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
  };

  // Compter par type
  filteredDemandes.forEach((d) => {
    statistiques.parType[d.typeConge]++;

    // Compter par mois
    const moisDebut = format(new Date(d.dateDebut), "yyyy-MM");
    statistiques.parMois[moisDebut] =
      (statistiques.parMois[moisDebut] || 0) + 1;
  });

  // Gérer l'ajout d'une demande
  const handleAddDemande = () => {
    setCurrentDemande(null);
    setIsFormOpen(true);
  };

  // Gérer la sauvegarde d'une demande
  const handleSaveDemande = async (demande: DemandeConge) => {
    try {
      console.log("Début de handleSaveDemande", demande);
      console.log("ID du collaborateur reçu:", demande.collaborateurId);
      console.log("Nom du collaborateur reçu:", demande.collaborateurNom);
      setIsLoading(true);

      // Récupérer le token d'authentification
      const authToken = localStorage.getItem("auth_token");
      console.log("Token d'authentification récupéré:", !!authToken);

      if (!authToken) {
        throw new Error("Vous n'êtes pas connecté");
      }

      let response;
      let successMessage;

      // Vérifier si la demande existe déjà dans notre liste
      const demandeExistante = demandes.find((d) => d.id === demande.id);

      console.log("Demande existante trouvée:", !!demandeExistante);

      if (demandeExistante) {
        // Mise à jour d'une demande existante
        console.log("Mise à jour d'une demande existante:", demande.id);
        response = await fetch(`/api/conges/${demande.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(demande),
        });

        successMessage = "Demande mise à jour";
      } else {
        // Création d'une nouvelle demande
        console.log(
          "Création d'une nouvelle demande avec collaborateur:",
          demande.collaborateurId
        );
        // Supprimer l'ID temporaire pour que l'API en génère un nouveau
        const { id, ...demandeData } = demande;
        console.log("Données à envoyer:", JSON.stringify(demandeData, null, 2));

        response = await fetch("/api/conges", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(demandeData),
        });

        successMessage = "Demande envoyée";
      }

      console.log("Réponse API reçue, statut:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur API:", errorData);
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const savedDemande = await response.json();
      console.log("Demande sauvegardée avec succès:", savedDemande);
      console.log(
        "ID collaborateur dans la réponse:",
        savedDemande.collaborateurId
      );

      // Traiter les dates de la réponse
      const processedDemande = {
        ...savedDemande,
        dateDebut: new Date(savedDemande.dateDebut),
        dateFin: new Date(savedDemande.dateFin),
        dateCreation: new Date(savedDemande.dateCreation),
        dateModification: new Date(savedDemande.dateModification),
      };

      // Mettre à jour l'état local
      setDemandes((prevDemandes) => {
        const index = prevDemandes.findIndex(
          (d) => d.id === processedDemande.id
        );

        if (index >= 0) {
          // Mise à jour d'une demande existante
          const updated = [...prevDemandes];
          updated[index] = processedDemande;
          return updated;
        } else {
          // Ajout d'une nouvelle demande
          return [...prevDemandes, processedDemande];
        }
      });

      toast({
        title: successMessage,
        description: `Votre demande de congés a été ${successMessage.toLowerCase()} avec succès.`,
      });

      setIsFormOpen(false);
      console.log("Formulaire fermé, processus terminé");
    } catch (err) {
      console.error(
        "Erreur détaillée lors de la sauvegarde de la demande:",
        err
      );
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Impossible de sauvegarder la demande",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la fermeture du modal de détails
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setCurrentDemande(null);
    setCommentaire("");
  };

  // Vérifier si l'utilisateur peut modifier le statut d'une demande
  const canChangeStatus = (demande: DemandeConge) => {
    if (!user) return false;

    // Seuls les admins peuvent modifier le statut
    return user.role === "admin";
  };

  // Convertir le type de congé en type d'absence
  const convertTypeCongeToTypeAbsence = (typeConge: TypeConge): TypeAbsence => {
    switch (typeConge) {
      case "Congés payés":
        return "CP";
      case "RTT":
        return "RTT";
      case "Congé sans solde":
        return "CSS";
      case "Maladie":
        return "Arrêt Travail";
      default:
        return "Abs Inj";
    }
  };

  // Créer un événement d'absence dans le planning
  const createAbsenceEvent = (demande: DemandeConge): Evenement | null => {
    // Trouver le collaborateur
    const collaborateur = collaborateurs.find(
      (c) => c.id === demande.collaborateurId
    );
    if (!collaborateur) {
      console.error("Collaborateur non trouvé:", demande.collaborateurId);
      return null;
    }

    // Convertir le type de congé en type d'absence
    const typeAbsence = convertTypeCongeToTypeAbsence(demande.typeConge);

    // Créer un événement d'absence
    return {
      id: `conge-${demande.id}`,
      title: `${collaborateur.nom} - ${typeAbsence}`,
      start: new Date(demande.dateDebut),
      end: new Date(demande.dateFin),
      collaborateur_id: demande.collaborateurId,
      type_evenement: "absence",
      lieu_chantier: "",
      zone_trajet: "",
      panier_repas: false,
      heures_supplementaires: 0,
      grand_deplacement: false,
      prgd: false,
      nombre_prgd: 0,
      ticket_restaurant: false,
      type_absence: typeAbsence,
      verrouille: true, // Verrouiller l'événement pour éviter les modifications
    };
  };

  // Supprimer un événement d'absence du planning
  const removeAbsenceEvent = (demandeId: string) => {
    const eventId = `conge-${demandeId}`;
    const updatedEvents = globalEvents.filter((event) => event.id !== eventId);
    updateEvents(updatedEvents);
    console.log("Événement d'absence supprimé:", eventId);
  };

  // Ouvrir le dialogue de confirmation pour changer le statut
  const openConfirmDialog = (demandeId: string, newStatus: StatutConge) => {
    const demande = demandes.find((d) => d.id === demandeId);
    if (!demande) return;

    setConfirmDialog({
      isOpen: true,
      demandeId,
      newStatus,
      oldStatus: demande.statut,
      commentaire: "",
    });
  };

  // Fonction pour changer le statut d'une demande
  const changeDemandeStatus = async (
    demandeId: string,
    newStatus: StatutConge,
    commentaire = ""
  ) => {
    console.log(
      `Changement de statut pour la demande ${demandeId} vers ${newStatus}`
    );

    try {
      // Récupérer le token d'authentification
      const authToken = localStorage.getItem("auth_token");

      if (!authToken) {
        throw new Error("Vous n'êtes pas connecté");
      }

      // Trouver la demande actuelle
      const demandeToUpdate = demandes.find((d) => d.id === demandeId);
      if (!demandeToUpdate) {
        console.error("Demande non trouvée:", demandeId);
        return;
      }

      // Préserver le commentaire existant si aucun nouveau commentaire n'est fourni
      const commentaireToUse =
        commentaire || demandeToUpdate.commentaireAdmin || "";
      console.log("Commentaire utilisé:", commentaireToUse);

      // Appel API pour mettre à jour le statut
      const response = await fetch(`/api/conges/${demandeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          statut: newStatus,
          commentaireAdmin: commentaireToUse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const updatedDemande = await response.json();

      // Traiter les dates de la réponse
      const processedDemande = {
        ...updatedDemande,
        dateDebut: new Date(updatedDemande.dateDebut),
        dateFin: new Date(updatedDemande.dateFin),
        dateCreation: new Date(updatedDemande.dateCreation),
        dateModification: new Date(updatedDemande.dateModification),
      };

      // Mettre à jour l'état des demandes
      setDemandes(
        demandes.map((d) => (d.id === demandeId ? processedDemande : d))
      );
      console.log("État des demandes mis à jour");

      // Gérer les événements d'absence
      if (newStatus === "Approuvé") {
        // Si la demande est approuvée, créer un événement d'absence
        // Vérifier d'abord si l'événement existe déjà
        const existingEvent = globalEvents.find(
          (e) => e.id === `conge-${demandeId}`
        );
        if (!existingEvent) {
          const newEvent = createAbsenceEvent(processedDemande);
          if (newEvent) {
            const updatedEvents = [...globalEvents, newEvent];
            updateEvents(updatedEvents);
            console.log("Événement d'absence créé:", newEvent);
          }
        }
      } else if (demandeToUpdate.statut === "Approuvé") {
        // Si la demande était approuvée et ne l'est plus, supprimer l'événement d'absence
        removeAbsenceEvent(demandeId);
      }

      // Notification
      toast({
        title: `Demande ${newStatus.toLowerCase()}`,
        description: `La demande de congés a été ${newStatus.toLowerCase()} avec succès.`,
      });

      // Fermer le modal de détails si ouvert
      if (isDetailsOpen) {
        handleCloseDetails();
      }

      // Fermer le dialogue de confirmation
      setConfirmDialog({
        isOpen: false,
        demandeId: "",
        newStatus: "En attente",
        oldStatus: "En attente",
        commentaire: "",
      });
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Impossible de modifier le statut de la demande",
        variant: "destructive",
      });
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeColor = (statut: StatutConge) => {
    switch (statut) {
      case "Approuvé":
        return "bg-green-500";
      case "Refusé":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  // Formater la date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  // Calculer la durée en jours
  const calculateDuration = (dateDebut: Date, dateFin: Date) => {
    return differenceInCalendarDays(new Date(dateFin), new Date(dateDebut)) + 1;
  };

  // Gérer la modification d'une demande
  const handleModifierDemande = () => {
    if (currentDemande) {
      handleCloseDetails();
      setTimeout(() => {
        setCurrentDemande(currentDemande);
        setIsFormOpen(true);
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner
          size="lg"
          message="Chargement des demandes de congés..."
        />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/rh")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Button>
          <h1 className="text-3xl font-bold">Gestion des Congés</h1>
        </div>
        <Button
          onClick={handleAddDemande}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      <Tabs
        defaultValue="demandes"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="demandes">Demandes de congés</TabsTrigger>
          {user?.role === "admin" && (
            <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="demandes" className="space-y-4 mt-4">
          {user?.role === "admin" && (
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
                value={filterStatut}
                onValueChange={(value) =>
                  setFilterStatut(value as StatutConge | "all")
                }
              >
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

              <Select
                value={filterType}
                onValueChange={(value) =>
                  setFilterType(value as TypeConge | "all")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="Congés payés">Congés payés</SelectItem>
                  <SelectItem value="RTT">RTT</SelectItem>
                  <SelectItem value="Congé sans solde">
                    Congé sans solde
                  </SelectItem>
                  <SelectItem value="Maladie">Maladie</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {user?.role === "admin"
                  ? "Liste des demandes"
                  : "Mes demandes de congés"}
              </CardTitle>
              <CardDescription>
                {user?.role === "admin"
                  ? `${sortedDemandes.length} demande${
                      sortedDemandes.length > 1 ? "s" : ""
                    } de congés`
                  : "Vos demandes de congés personnelles"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {user?.role === "admin" && (
                        <TableHead>Collaborateur</TableHead>
                      )}
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
                          {user?.role === "admin" && (
                            <TableCell className="font-medium">
                              {demande.collaborateurNom}
                            </TableCell>
                          )}
                          <TableCell>
                            Du {formatDate(demande.dateDebut)} au{" "}
                            {formatDate(demande.dateFin)}
                          </TableCell>
                          <TableCell>
                            {calculateDuration(
                              demande.dateDebut,
                              demande.dateFin
                            )}{" "}
                            jour(s)
                          </TableCell>
                          <TableCell>{demande.typeConge}</TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={demande.motif}
                          >
                            {demande.motif}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(demande.statut)}
                            >
                              {demande.statut}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(demande.dateCreation),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentDemande(demande);
                                  setIsDetailsOpen(true);
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
                                      onClick={() =>
                                        openConfirmDialog(
                                          demande.id,
                                          "Approuvé"
                                        )
                                      }
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
                                      onClick={() =>
                                        openConfirmDialog(demande.id, "Refusé")
                                      }
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
                                      onClick={() =>
                                        openConfirmDialog(
                                          demande.id,
                                          "En attente"
                                        )
                                      }
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
                        <TableCell
                          colSpan={user?.role === "admin" ? 8 : 7}
                          className="text-center py-8 text-muted-foreground"
                        >
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

        {user?.role === "admin" && (
          <TabsContent value="statistiques" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total des demandes
                      </p>
                      <h3 className="text-2xl font-bold">
                        {statistiques.totalDemandes}
                      </h3>
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
                      <p className="text-sm font-medium text-muted-foreground">
                        En attente
                      </p>
                      <h3 className="text-2xl font-bold">
                        {statistiques.enAttente}
                      </h3>
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
                      <p className="text-sm font-medium text-muted-foreground">
                        Approuvées
                      </p>
                      <h3 className="text-2xl font-bold">
                        {statistiques.approuvees}
                      </h3>
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
                      <p className="text-sm font-medium text-muted-foreground">
                        Refusées
                      </p>
                      <h3 className="text-2xl font-bold">
                        {statistiques.refusees}
                      </h3>
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
                    {Object.entries(statistiques.parType).map(
                      ([type, count]) => (
                        <div key={type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{type}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-500 rounded-full h-2"
                              style={{
                                width: `${
                                  statistiques.totalDemandes > 0
                                    ? (count / statistiques.totalDemandes) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
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
                        const [year, month] = mois.split("-");
                        const monthName = format(
                          new Date(
                            Number.parseInt(year),
                            Number.parseInt(month) - 1,
                            1
                          ),
                          "MMMM yyyy",
                          {
                            locale: fr,
                          }
                        );

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
                                  width: `${
                                    statistiques.totalDemandes > 0
                                      ? (count / statistiques.totalDemandes) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
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
            setConfirmDialog({ ...confirmDialog, isOpen: false });
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
                  Attention : Cette demande a déjà été{" "}
                  {confirmDialog.oldStatus.toLowerCase()}.
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
                <p className="mt-2">
                  Un événement d'absence sera automatiquement créé dans le
                  planning.
                </p>
              )}
              {confirmDialog.oldStatus === "Approuvé" &&
                confirmDialog.newStatus !== "Approuvé" && (
                  <p className="mt-2">
                    L'événement d'absence sera supprimé du planning.
                  </p>
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
                });
              }}
              className="min-h-[100px]"
            />
          </div>

          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                changeDemandeStatus(
                  confirmDialog.demandeId,
                  confirmDialog.newStatus,
                  confirmDialog.commentaire
                )
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
  );
}
