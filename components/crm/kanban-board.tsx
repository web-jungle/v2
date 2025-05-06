"use client"

import { useState, useRef } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Search, Archive } from "lucide-react"
import ContactCard from "./contact-card"
import ContactForm from "./contact-form"
import ArchiveManager from "./archive-manager"
import ProspectAlerts from "./prospect-alerts"
import type { Contact, ContactStatus } from "@/lib/crm-types"
import { contactStatuses } from "@/lib/crm-data"

interface KanbanBoardProps {
  contacts: Contact[]
  onUpdateContacts: (contacts: Contact[]) => void
}

export default function KanbanBoard({ contacts, onUpdateContacts }: KanbanBoardProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Filtrer les contacts en fonction des droits d'accès de l'utilisateur et exclure les archivés
  const userAccessibleContacts = contacts.filter((contact) => {
    // Exclure les contacts archivés
    if (contact.archived) return false

    // Les administrateurs et managers voient tous les contacts
    if (user?.role === "admin" || user?.role === "manager") {
      return true
    }

    // Les collaborateurs ne voient que les contacts qu'ils ont créés
    if (user?.role === "collaborateur") {
      return contact.utilisateurId === user.id
    }

    return false
  })

  // Compter les contacts archivés
  const archivedContactsCount = contacts.filter((contact) => contact.archived).length

  // Filtrer les contacts en fonction du terme de recherche
  const filteredContacts = userAccessibleContacts.filter((contact) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      contact.nom.toLowerCase().includes(searchTermLower) ||
      contact.prenom.toLowerCase().includes(searchTermLower) ||
      contact.email.toLowerCase().includes(searchTermLower) ||
      contact.telephone.includes(searchTerm) ||
      (contact.ville && contact.ville.toLowerCase().includes(searchTermLower))
    )
  })

  // Grouper les contacts par statut
  const contactsByStatus = contactStatuses.reduce(
    (acc, status) => {
      acc[status] = filteredContacts.filter((contact) => contact.status === status)
      return acc
    },
    {} as Record<ContactStatus, Contact[]>,
  )

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // Si l'élément est déposé en dehors d'une zone de dépôt
    if (!destination) return

    // Si l'élément est déposé au même endroit
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    // Récupérer le contact déplacé
    const sourceStatus = source.droppableId as ContactStatus
    const destinationStatus = destination.droppableId as ContactStatus
    const contactToMove = contactsByStatus[sourceStatus][source.index]

    // Vérifier si l'utilisateur a le droit de modifier ce contact
    const canModify = user?.role === "admin" || user?.role === "manager" || contactToMove.utilisateurId === user?.id

    // Si l'utilisateur n'a pas le droit de modifier ce contact
    if (!canModify) {
      toast({
        title: "Action non autorisée",
        description: "Vous n'avez pas les droits pour modifier ce contact.",
        variant: "destructive",
      })
      return
    }

    // Créer une copie du contact avec le nouveau statut
    const updatedContact = {
      ...contactToMove,
      status: destinationStatus,
      dateDerniereModification: new Date(),
    }

    // Mettre à jour la liste des contacts
    const updatedContacts = contacts.map((contact) => (contact.id === updatedContact.id ? updatedContact : contact))

    onUpdateContacts(updatedContacts)

    // Afficher une notification
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      toast({
        title: "Contact mis à jour",
        description: `Le statut de ${contactToMove.prenom} ${contactToMove.nom} a été changé en "${destinationStatus}".`,
      })
    }, 500)
  }

  const handleAddContact = () => {
    setSelectedContact(null)
    setIsFormOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    // Vérifier si l'utilisateur a le droit de modifier ce contact
    const canModify = user?.role === "admin" || user?.role === "manager" || contact.utilisateurId === user?.id

    if (!canModify) {
      toast({
        title: "Action non autorisée",
        description: "Vous n'avez pas les droits pour modifier ce contact.",
        variant: "destructive",
      })
      return
    }

    setSelectedContact(contact)
    setIsFormOpen(true)
  }

  const handleSaveContact = (contact: Contact) => {
    // Vérifier si c'est un nouveau contact ou une mise à jour
    const isNewContact = !contacts.some((c) => c.id === contact.id)

    // Vérifier si l'utilisateur a le droit de modifier ce contact
    if (!isNewContact) {
      const existingContact = contacts.find((c) => c.id === contact.id)
      const canModify =
        user?.role === "admin" || user?.role === "manager" || existingContact?.utilisateurId === user?.id

      if (!canModify) {
        toast({
          title: "Action non autorisée",
          description: "Vous n'avez pas les droits pour modifier ce contact.",
          variant: "destructive",
        })
        return
      }
    }

    let updatedContacts: Contact[]

    if (isNewContact) {
      updatedContacts = [...contacts, contact]
      toast({
        title: "Contact ajouté",
        description: `${contact.prenom} ${contact.nom} a été ajouté avec succès.`,
      })
    } else {
      updatedContacts = contacts.map((c) => (c.id === contact.id ? contact : c))
      toast({
        title: "Contact mis à jour",
        description: `Les informations de ${contact.prenom} ${contact.nom} ont été mises à jour.`,
      })
    }

    onUpdateContacts(updatedContacts)
    setIsFormOpen(false)
    setSelectedContact(null)
  }

  // Gérer l'archivage d'un contact
  const handleArchiveContact = (contact: Contact) => {
    // Vérifier si l'utilisateur a le droit d'archiver ce contact
    const canArchive = user?.role === "admin" || user?.role === "manager" || contact.utilisateurId === user?.id

    if (!canArchive) {
      toast({
        title: "Action non autorisée",
        description: "Vous n'avez pas les droits pour archiver ce contact.",
        variant: "destructive",
      })
      return
    }

    // Mettre à jour le contact
    const updatedContact = {
      ...contact,
      archived: true,
      archiveDate: new Date(),
      dateDerniereModification: new Date(),
    }

    // Mettre à jour la liste des contacts
    const updatedContacts = contacts.map((c) => (c.id === contact.id ? updatedContact : c))
    onUpdateContacts(updatedContacts)

    toast({
      title: "Contact archivé",
      description: `${contact.prenom} ${contact.nom} a été archivé avec succès.`,
    })
  }

  // Gérer le clic sur un contact dans les alertes
  const handleAlertContactClick = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    if (contact) {
      handleEditContact(contact)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un contact..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <ProspectAlerts contacts={userAccessibleContacts} onContactClick={handleAlertContactClick} />

          <Button variant="outline" onClick={() => setIsArchiveOpen(true)}>
            <Archive className="h-4 w-4 mr-2" />
            Archives
            {archivedContactsCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {archivedContactsCount}
              </Badge>
            )}
          </Button>

          <Button onClick={handleAddContact}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un contact
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4" style={{ minWidth: contactStatuses.length * 320 + "px" }}>
            {contactStatuses.map((status) => (
              <div key={status} className="w-80 flex-shrink-0">
                <div className="bg-muted rounded-t-md p-3 font-medium">
                  <div className="flex justify-between items-center">
                    <span>{status}</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                      {contactsByStatus[status]?.length || 0}
                    </span>
                  </div>
                </div>
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-muted/50 rounded-b-md p-2 min-h-[500px]"
                    >
                      {contactsByStatus[status]?.map((contact, index) => (
                        <Draggable key={contact.id} draggableId={contact.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <ContactCard
                                contact={contact}
                                onEdit={handleEditContact}
                                onArchive={status === "Terminé" ? handleArchiveContact : undefined}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      <ContactForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        contact={selectedContact}
        onSave={handleSaveContact}
      />

      <ArchiveManager
        contacts={contacts}
        onUpdateContacts={onUpdateContacts}
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
      />
    </div>
  )
}
