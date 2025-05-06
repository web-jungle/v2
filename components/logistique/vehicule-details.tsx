"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Pencil, Calendar, Wrench, User, FileText, Truck, AlertTriangle } from "lucide-react"
import type { Vehicule } from "@/lib/logistique-types"
import { collaborateurs } from "@/lib/data"

interface VehiculeDetailsProps {
  isOpen: boolean
  onClose: () => void
  vehicule: Vehicule | null
  onEdit: (vehicule: Vehicule) => void
}

export default function VehiculeDetails({ isOpen, onClose, vehicule, onEdit }: VehiculeDetailsProps) {
  if (!vehicule) return null

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Non spécifié"
    return format(new Date(date), "PPP", { locale: fr })
  }

  const conducteur = vehicule.conducteurPrincipal
    ? collaborateurs.find((c) => c.id === vehicule.conducteurPrincipal)
    : null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>
              {vehicule.marque} {vehicule.modele} - {vehicule.immatriculation}
            </span>
            <Button variant="outline" size="sm" onClick={() => onEdit(vehicule)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="infos">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="infos">Informations</TabsTrigger>
            <TabsTrigger value="entretien">Entretien</TabsTrigger>
            <TabsTrigger value="controles">Contrôles</TabsTrigger>
          </TabsList>

          <TabsContent value="infos" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Société</p>
                    <Badge variant="outline" className="mt-1">
                      {vehicule.societe}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">État</p>
                    <Badge
                      className="mt-1"
                      variant={vehicule.etat === "EN CIRCULATION" ? "default" : "destructive"}
                      style={vehicule.etat === "EN CIRCULATION" ? { backgroundColor: "#22c55e" } : {}}
                    >
                      {vehicule.etat}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium">Type de véhicule</p>
                    <p className="text-sm mt-1">{vehicule.typeVehicule || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date de mise en circulation</p>
                    <p className="text-sm mt-1">
                      {vehicule.dateMiseEnCirculation ? formatDate(vehicule.dateMiseEnCirculation) : "Non spécifiée"}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm font-medium">Kilométrage</p>
                  <p className="text-sm mt-1">{vehicule.kilometrage ? `${vehicule.kilometrage} km` : "Non spécifié"}</p>
                </div>

                {conducteur && (
                  <div className="pt-2 flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Conducteur principal</p>
                      <p className="text-sm">{conducteur.nom}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entretien" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Suivi d'entretien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center">
                      <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Dernier entretien</p>
                    </div>
                    <p className="text-sm mt-1 pl-6">{formatDate(vehicule.dernierEntretien)}</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Prochain entretien</p>
                    </div>
                    <p className="text-sm mt-1 pl-6">{formatDate(vehicule.prochainEntretien)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Kilométrage actuel</p>
                    </div>
                    <p className="text-sm mt-1 pl-6">
                      {vehicule.kilometrage ? `${vehicule.kilometrage} km` : "Non spécifié"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Km prochaine révision</p>
                    </div>
                    <p className="text-sm mt-1 pl-6">
                      {vehicule.kmProchaineRevision ? `${vehicule.kmProchaineRevision} km` : "Non spécifié"}
                      {isKmCloseToRevision && (
                        <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Proche
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>

                {vehicule.notes && (
                  <div className="pt-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Notes</p>
                    </div>
                    <p className="text-sm mt-1 pl-6">{vehicule.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controles" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Contrôles techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Date limite contrôle technique</p>
                    </div>
                    <p className="text-sm mt-1 pl-6">
                      {formatDate(vehicule.dateLimiteControleTechnique)}
                      {isCtExpiringSoon && vehicule.dateLimiteControleTechnique && (
                        <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expire bientôt
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Date limite contrôle pollution</p>
                    </div>
                    <p className="text-sm mt-1 pl-6">
                      {formatDate(vehicule.dateLimiteControlePollution)}
                      {isCtPollutionExpiringSoon && vehicule.dateLimiteControlePollution && (
                        <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expire bientôt
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Informations contractuelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Type de propriété</p>
                    <Badge
                      className="mt-1"
                      variant="secondary"
                      style={{
                        backgroundColor:
                          vehicule.proprietaire === "ACHAT"
                            ? "#dbeafe"
                            : vehicule.proprietaire === "CREDIT BAIL"
                              ? "#f3e8ff"
                              : vehicule.proprietaire === "LOCATION"
                                ? "#ffedd5"
                                : "#dcfce7",
                        color:
                          vehicule.proprietaire === "ACHAT"
                            ? "#1e40af"
                            : vehicule.proprietaire === "CREDIT BAIL"
                              ? "#7e22ce"
                              : vehicule.proprietaire === "LOCATION"
                                ? "#c2410c"
                                : "#166534",
                      }}
                    >
                      {vehicule.proprietaire}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fin de contrat</p>
                    <p className="text-sm mt-1">{formatDate(vehicule.finContrat)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
