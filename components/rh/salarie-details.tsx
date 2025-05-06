"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Pencil, Mail, Phone, MapPin, Calendar, FileText, Briefcase, Building } from "lucide-react"
import type { Salarie } from "@/lib/rh-types"

interface SalarieDetailsProps {
  isOpen: boolean
  onClose: () => void
  salarie: Salarie | null
  onEdit: (salarie: Salarie) => void
}

export default function SalarieDetails({ isOpen, onClose, salarie, onEdit }: SalarieDetailsProps) {
  if (!salarie) return null

  const formatDate = (date: Date) => {
    return format(new Date(date), "PPP", { locale: fr })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>
              {salarie.prenom} {salarie.nom}
            </span>
            <Button variant="outline" size="sm" onClick={() => onEdit(salarie)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="infos">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="infos">Informations</TabsTrigger>
            <TabsTrigger value="contrat">Contrat</TabsTrigger>
            <TabsTrigger value="competences">Compétences</TabsTrigger>
          </TabsList>

          <TabsContent value="infos" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{salarie.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{salarie.telephone}</span>
                  </div>
                  {salarie.adresse && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <span>
                        {salarie.adresse}
                        {salarie.codePostal && salarie.ville && (
                          <>
                            <br />
                            {salarie.codePostal} {salarie.ville}
                          </>
                        )}
                      </span>
                    </div>
                  )}
                  {salarie.dateNaissance && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Né(e) le {formatDate(salarie.dateNaissance)}</span>
                    </div>
                  )}
                  {salarie.numeroSecu && (
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>N° SS: {salarie.numeroSecu}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Informations professionnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{salarie.entreprise}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{salarie.poste}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline">{salarie.classification}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contrat" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Détails du contrat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Type de contrat</p>
                    <Badge className="mt-1" variant={salarie.typeContrat === "CDI" ? "default" : "outline"}>
                      {salarie.typeContrat}
                      {salarie.dureeContrat ? ` (${salarie.dureeContrat})` : ""}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date d'entrée</p>
                    <p className="text-sm mt-1">{formatDate(salarie.dateEntree)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competences" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                {salarie.certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {salarie.certifications.map((certification) => (
                      <Badge key={certification} variant="secondary">
                        {certification}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune certification enregistrée</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Habilitations</CardTitle>
              </CardHeader>
              <CardContent>
                {salarie.habilitations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {salarie.habilitations.map((habilitation) => (
                      <Badge key={habilitation} variant="outline">
                        {habilitation}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune habilitation enregistrée</p>
                )}
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
