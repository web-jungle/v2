"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import type { Contact } from "@/lib/crm-types"

interface ProspectAlertsProps {
  contacts: Contact[]
  onContactClick: (contactId: string) => void
}

export default function ProspectAlerts({ contacts, onContactClick }: ProspectAlertsProps) {
  const [showAlerts, setShowAlerts] = useState(false)
  const [inactiveProspects, setInactiveProspects] = useState<Contact[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Filtrer les prospects inactifs (pas de modification depuis 5 jours après création)
    const now = new Date()
    const inactiveContacts = contacts.filter((contact) => {
      // Calculer la différence en jours entre la date de création et la dernière modification
      const creationDate = new Date(contact.dateCreation)
      const lastModifiedDate = new Date(contact.dateDerniereModification)

      // Si la date de dernière modification est la même que la date de création
      // et que la création date d'au moins 5 jours
      const daysSinceCreation = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24))
      const noActivitySinceCreation = lastModifiedDate.getTime() === creationDate.getTime()

      return daysSinceCreation >= 5 && noActivitySinceCreation
    })

    setInactiveProspects(inactiveContacts)

    // Afficher une notification si de nouveaux prospects inactifs sont détectés
    if (inactiveContacts.length > 0 && !showAlerts) {
      toast({
        title: "Prospects inactifs détectés",
        description: `${inactiveContacts.length} prospect(s) sans activité depuis 5 jours.`,
        variant: "destructive",
      })
    }
  }, [contacts, showAlerts, toast])

  const handleDismissAlert = (e: React.MouseEvent, contactId: string) => {
    e.stopPropagation()
    // Filtrer le prospect de la liste des alertes
    setInactiveProspects((prev) => prev.filter((p) => p.id !== contactId))
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="relative" onClick={() => setShowAlerts(!showAlerts)}>
        <Bell className="h-4 w-4 mr-1" />
        Alertes
        {inactiveProspects.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
          >
            {inactiveProspects.length}
          </Badge>
        )}
      </Button>

      {showAlerts && inactiveProspects.length > 0 && (
        <Card className="absolute top-full right-0 mt-2 z-50 w-80 shadow-lg">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              Prospects sans activité
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-3">
            <div className="max-h-80 overflow-y-auto space-y-2">
              {inactiveProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  className="bg-muted p-2 rounded-md text-sm flex justify-between items-start cursor-pointer hover:bg-muted/80"
                  onClick={() => onContactClick(prospect.id)}
                >
                  <div>
                    <p className="font-medium">
                      {prospect.prenom} {prospect.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créé le {new Date(prospect.dateCreation).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => handleDismissAlert(e, prospect.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Ignorer</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
