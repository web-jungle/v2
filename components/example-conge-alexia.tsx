"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Calendar, FileText, ThumbsUp, ThumbsDown } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { DemandeConge } from "@/lib/conges-types"
import type { Evenement } from "@/lib/types"
import { collaborateurs } from "@/lib/data"

export default function ExampleCongeAlexia() {
  // Étape actuelle du processus
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Créer une demande de congé pour Alexia
  const alexia = collaborateurs.find((c) => c.nom === "BLOT Alexia")
  const demandeConge: DemandeConge = {
    id: "example-conge-alexia",
    utilisateurId: "5", // ID utilisateur d'Alexia
    collaborateurId: alexia?.id || "5",
    collaborateurNom: alexia?.nom || "BLOT Alexia",
    dateDebut: new Date(2025, 3, 21), // 21 avril 2025
    dateFin: new Date(2025, 3, 26), // 26 avril 2025
    typeConge: "Congés payés",
    motif: "Vacances de printemps",
    statut: step === 1 ? "En attente" : step >= 2 ? "Approuvé" : "En attente",
    commentaireAdmin: step >= 2 ? "Congés approuvés, bon repos !" : undefined,
    dateCreation: new Date(2025, 3, 10), // 10 avril 2025
    dateModification: step >= 2 ? new Date(2025, 3, 15) : new Date(2025, 3, 10),
    notificationLue: false,
  }

  // Événement créé dans le planning après approbation
  const evenementPlanning: Evenement = {
    id: `conge-${demandeConge.id}`,
    title: `${demandeConge.collaborateurNom} - CP`,
    start: new Date(2025, 3, 21, 8, 0), // 21 avril 2025 à 8h
    end: new Date(2025, 3, 26, 17, 0), // 26 avril 2025 à 17h
    collaborateurId: demandeConge.collaborateurId,
    typeEvenement: "absence",
    lieuChantier: "",
    zoneTrajet: "",
    panierRepas: false,
    heuresSupplementaires: 0,
    grandDeplacement: false,
    prgd: false,
    nombrePRGD: 0,
    typeAbsence: "CP",
    verrouille: true,
  }

  // Formater la date
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: fr })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Exemple: Congés d'Alexia BLOT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Étape actuelle</div>
            <div className="font-medium">
              {step === 1 && "Demande de congés en attente"}
              {step === 2 && "Approbation de la demande"}
              {step === 3 && "Création automatique dans le planning"}
              {step === 4 && "Visualisation dans le planning"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep(step > 1 ? ((step - 1) as 1 | 2 | 3 | 4) : 1)}
              disabled={step === 1}
            >
              Précédent
            </Button>
            <Button onClick={() => setStep(step < 4 ? ((step + 1) as 1 | 2 | 3 | 4) : 4)} disabled={step === 4}>
              Suivant
            </Button>
          </div>
        </div>

        <Tabs defaultValue={step === 4 ? "planning" : "demande"}>
          <TabsList>
            <TabsTrigger value="demande">Demande de congés</TabsTrigger>
            <TabsTrigger value="planning" disabled={step < 3}>
              Planning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demande" className="mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Demande de congés</h3>
                    <p className="text-sm text-muted-foreground">Créée le {formatDate(demandeConge.dateCreation)}</p>
                  </div>
                  <Badge className={step >= 2 ? "bg-green-500" : "bg-yellow-500"}>{demandeConge.statut}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Collaborateur</div>
                    <div className="font-medium">{demandeConge.collaborateurNom}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Type de congés</div>
                    <div className="font-medium">{demandeConge.typeConge}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Période</div>
                  <div className="font-medium">
                    Du {formatDate(demandeConge.dateDebut)} au {formatDate(demandeConge.dateFin)}
                  </div>
                  <div className="text-sm text-muted-foreground">Durée: 6 jour(s)</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Motif</div>
                  <div className="font-medium">{demandeConge.motif}</div>
                </div>

                {step >= 2 && demandeConge.commentaireAdmin && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Commentaire administratif</div>
                    <div className="bg-muted p-3 rounded-md mt-1">
                      <p className="text-sm">{demandeConge.commentaireAdmin}</p>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="border-t pt-4 mt-2">
                    <h3 className="text-sm font-medium mb-2">Traiter cette demande</h3>
                    <div className="flex flex-col space-y-2">
                      <textarea
                        placeholder="Ajouter un commentaire (optionnel)"
                        rows={2}
                        className="w-full p-2 border rounded-md"
                        defaultValue="Congés approuvés, bon repos !"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                        <Button className="bg-green-500 hover:bg-green-600" onClick={() => setStep(2)}>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planning" className="mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Événement créé dans le planning</h3>
                    <p className="text-sm text-muted-foreground">Créé automatiquement après approbation</p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Absence
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Collaborateur</div>
                    <div className="font-medium">{demandeConge.collaborateurNom}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Type d'absence</div>
                    <div className="font-medium">CP (Congés payés)</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Période</div>
                  <div className="font-medium">
                    Du {formatDate(evenementPlanning.start)} au {formatDate(evenementPlanning.end)}
                  </div>
                  <div className="text-sm text-muted-foreground">Horaires: 8h00 - 17h00</div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-800">Événement verrouillé</p>
                      <p className="text-sm text-orange-700">
                        Cet événement a été créé automatiquement suite à l'approbation d'une demande de congés. Il est
                        verrouillé pour éviter les modifications directes dans le planning.
                      </p>
                    </div>
                  </div>
                </div>

                {step === 4 && (
                  <div className="border p-4 rounded-md bg-gray-50">
                    <div className="font-medium mb-2">Visualisation dans le planning</div>
                    <div className="border border-gray-300 rounded-md p-2 bg-white">
                      <div className="flex justify-between items-center mb-2 pb-2 border-b">
                        <div className="font-medium">Avril 2025</div>
                        <div className="text-sm text-muted-foreground">Semaine 17</div>
                      </div>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="border p-2 w-40">Collaborateur</th>
                            <th className="border p-2 text-center">Lun 21</th>
                            <th className="border p-2 text-center">Mar 22</th>
                            <th className="border p-2 text-center">Mer 23</th>
                            <th className="border p-2 text-center">Jeu 24</th>
                            <th className="border p-2 text-center">Ven 25</th>
                            <th className="border p-2 text-center">Sam 26</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2 font-medium" style={{ color: alexia?.couleur }}>
                              {alexia?.nom}
                            </td>
                            {[21, 22, 23, 24, 25, 26].map((day) => (
                              <td key={day} className="border p-1 align-top h-16 relative">
                                <div className="p-1 rounded text-xs bg-green-500/20 text-green-800">
                                  <div className="font-medium">CP</div>
                                  <div className="text-muted-foreground">08:00 - 17:00</div>
                                </div>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
