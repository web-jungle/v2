"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// Ajouter l'import pour l'icône Euro
import { Search, Filter, ArrowUpDown, Edit, Archive, Euro } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import type { Contact, ContactCategory, ContactStatus } from "@/lib/crm-types"
import { contactCategories, contactStatuses } from "@/lib/crm-data"
import { collaborateurs } from "@/lib/data"

interface ContactsListProps {
  contacts: Contact[]
  onEditContact: (contact: Contact) => void
  onArchiveContact: (contact: Contact) => void
}

export default function ContactsList({ contacts, onEditContact, onArchiveContact }: ContactsListProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<ContactCategory | "all">("all")
  const [filterStatus, setFilterStatus] = useState<ContactStatus | "all">("all")
  const [sortField, setSortField] = useState<keyof Contact>("nom")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showArchived, setShowArchived] = useState(false)

  // Filtrer les contacts en fonction des droits d'accès de l'utilisateur
  const userAccessibleContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Filtrer par statut d'archivage
      if (!showArchived && contact.archived) return false
      if (showArchived && !contact.archived) return false

      // Les administrateurs et managers voient tous les contacts
      if (user?.role === "admin" || user?.role === "manager") {
        return true
      }

      // Les collaborateurs ne voient que les contacts qu'ils ont créés ou qui leur sont affectés
      if (user?.role === "collaborateur") {
        return (
          contact.utilisateurId === user.id ||
          (contact.collaborateursIds &&
            user.collaborateurId &&
            contact.collaborateursIds.includes(user.collaborateurId))
        )
      }

      return false
    })
  }, [contacts, user, showArchived])

  // Appliquer les filtres et la recherche
  const filteredContacts = useMemo(() => {
    return userAccessibleContacts.filter((contact) => {
      const matchesSearch =
        searchTerm === "" ||
        contact.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.telephone.includes(searchTerm) ||
        (contact.ville && contact.ville.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = filterCategory === "all" || contact.categories.includes(filterCategory as ContactCategory)
      const matchesStatus = filterStatus === "all" || contact.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [userAccessibleContacts, searchTerm, filterCategory, filterStatus])

  // Trier les contacts
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      let valueA = a[sortField]
      let valueB = b[sortField]

      // Gérer les cas spéciaux
      if (sortField === "dateCreation" || sortField === "dateDerniereModification" || sortField === "archiveDate") {
        valueA = valueA ? new Date(valueA).getTime() : 0
        valueB = valueB ? new Date(valueB).getTime() : 0
      }

      if (valueA === valueB) return 0

      if (sortDirection === "asc") {
        return valueA < valueB ? -1 : 1
      } else {
        return valueA > valueB ? -1 : 1
      }
    })
  }, [filteredContacts, sortField, sortDirection])

  // Gérer le tri
  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Obtenir les collaborateurs assignés à un contact
  const getAssignedCollaborateurs = (collaborateursIds: string[] = []) => {
    return collaborateurs
      .filter((c) => collaborateursIds.includes(c.id))
      .map((c) => c.nom)
      .join(", ")
  }

  // Vérifier si l'utilisateur peut modifier un contact
  const canModifyContact = (contact: Contact) => {
    return user?.role === "admin" || user?.role === "manager" || contact.utilisateurId === user?.id
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
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
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filterCategory}
              onValueChange={(value) => setFilterCategory(value as ContactCategory | "all")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {contactCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as ContactStatus | "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {contactStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant={showArchived ? "default" : "outline"} onClick={() => setShowArchived(!showArchived)}>
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? "Voir actifs" : "Voir archivés"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des contacts {showArchived ? "archivés" : "actifs"}</CardTitle>
          <CardDescription>
            {sortedContacts.length} contact{sortedContacts.length !== 1 ? "s" : ""} trouvé
            {sortedContacts.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("nom")}>
                    <div className="flex items-center">
                      Nom
                      {sortField === "nom" && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("prenom")}>
                    <div className="flex items-center">
                      Prénom
                      {sortField === "prenom" && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Catégories</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    <div className="flex items-center">
                      Statut
                      {sortField === "status" && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Collaborateurs</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("dateCreation")}>
                    <div className="flex items-center">
                      Date de création
                      {sortField === "dateCreation" && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  {/* Ajouter une colonne pour le montant du devis dans la table */}
                  {/* Chercher la section TableHeader et ajouter une nouvelle colonne avant "Actions" */}
                  <TableHead className="cursor-pointer" onClick={() => handleSort("montantDevis")}>
                    <div className="flex items-center">
                      Montant devis
                      {sortField === "montantDevis" && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContacts.length > 0 ? (
                  sortedContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.nom}</TableCell>
                      <TableCell>{contact.prenom}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.telephone}</TableCell>
                      <TableCell>
                        {contact.adresse && (
                          <>
                            {contact.adresse}
                            {contact.codePostal && contact.ville && (
                              <>
                                <br />
                                {contact.codePostal} {contact.ville}
                              </>
                            )}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={contact.status === "Terminé" ? "default" : "secondary"}
                          className={contact.status === "Terminé" ? "bg-green-500" : ""}
                        >
                          {contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{getAssignedCollaborateurs(contact.collaborateursIds)}</TableCell>
                      <TableCell>
                        {new Date(contact.dateCreation).toLocaleDateString("fr-FR")}
                        {contact.archived && contact.archiveDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Archivé le: {new Date(contact.archiveDate).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                      </TableCell>
                      {/* Puis dans la section TableBody, ajouter une nouvelle cellule correspondante */}
                      <TableCell>
                        {contact.montantDevis !== undefined && contact.montantDevis > 0 ? (
                          <div className="flex items-center">
                            <Euro className="h-4 w-4 mr-1 text-green-600" />
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                              contact.montantDevis,
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditContact(contact)}
                          disabled={!canModifyContact(contact)}
                          title={
                            canModifyContact(contact)
                              ? "Modifier"
                              : "Vous n'avez pas les droits pour modifier ce contact"
                          }
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        {!contact.archived && contact.status === "Terminé" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onArchiveContact(contact)}
                            disabled={!canModifyContact(contact)}
                            title={
                              canModifyContact(contact)
                                ? "Archiver"
                                : "Vous n'avez pas les droits pour archiver ce contact"
                            }
                          >
                            <Archive className="h-4 w-4" />
                            <span className="sr-only">Archiver</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Aucun contact trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
