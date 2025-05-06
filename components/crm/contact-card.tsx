"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Calendar, Edit, Users, FileText, AlertTriangle, Archive, Euro } from "lucide-react"
import type { Contact } from "@/lib/crm-types"
import { collaborateurs } from "@/lib/data"
import { isContactInactive } from "@/lib/crm-utils"

interface ContactCardProps {
  contact: Contact
  onEdit: (contact: Contact) => void
  onArchive?: (contact: Contact) => void
  isDragging?: boolean
}

export default function ContactCard({ contact, onEdit, onArchive, isDragging = false }: ContactCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Vérifier que les propriétés existent avant de les utiliser
  const collaborateursIds = contact.collaborateursIds || []
  const documents = contact.documents || []

  // Récupérer les noms des collaborateurs affectés
  const assignedCollaborateurs = collaborateurs.filter((c) => collaborateursIds.includes(c.id))

  // Vérifier si le contact est inactif
  const isInactive = isContactInactive(contact)

  // Vérifier si le contact est terminé (pour afficher le bouton d'archivage)
  const isCompleted = contact.status === "Terminé"

  return (
    <Card className={`mb-4 ${isDragging ? "opacity-50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg flex items-center">
              {contact.prenom} {contact.nom}
              {isInactive && (
                <span className="ml-2 text-amber-500" title="Aucune activité depuis la création il y a plus de 5 jours">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              )}
            </h3>
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {formatDate(contact.dateCreation)}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {contact.categories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{contact.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{contact.telephone}</span>
          </div>
          {contact.adresse && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
              <span>
                {contact.adresse}
                {contact.codePostal && contact.ville && (
                  <>
                    , {contact.codePostal} {contact.ville}
                  </>
                )}
              </span>
            </div>
          )}
          {assignedCollaborateurs.length > 0 && (
            <div className="flex items-start">
              <Users className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
              <span>{assignedCollaborateurs.map((c) => c.nom).join(", ")}</span>
            </div>
          )}
          {documents.length > 0 && (
            <div className="flex items-start">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
              <span>{documents.length} document(s)</span>
            </div>
          )}
          {contact.montantDevis && contact.montantDevis > 0 && (
            <div className="mt-3 flex items-center">
              <Euro className="h-4 w-4 mr-2 text-green-600" />
              <span className="font-medium">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(contact.montantDevis)}
              </span>
            </div>
          )}
        </div>

        {contact.commentaires && (
          <div className="mt-3 p-2 bg-muted rounded-md text-sm">
            <p className="line-clamp-3">{contact.commentaires}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0 flex justify-between">
        <div>
          {isCompleted && onArchive && (
            <Button variant="ghost" size="sm" onClick={() => onArchive(contact)}>
              <Archive className="h-4 w-4 mr-1" />
              Archiver
            </Button>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => onEdit(contact)}>
          <Edit className="h-4 w-4 mr-1" />
          Modifier
        </Button>
      </CardFooter>
    </Card>
  )
}
