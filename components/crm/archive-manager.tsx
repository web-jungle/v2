"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Archive, Search, Filter, RefreshCw, Trash2, Download } from "lucide-react"
import type { Contact, ContactCategory } from "@/lib/crm-types"
import { contactCategories } from "@/lib/crm-data"

interface ArchiveManagerProps {
  contacts: Contact[]
  onUpdateContacts: (contacts: Contact[]) => void
  isOpen: boolean
  onClose: () => void
}

export default function ArchiveManager({ contacts, onUpdateContacts, isOpen, onClose }: ArchiveManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<ContactCategory | "all">("all")
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const { toast } = useToast()

  // Filtrer les contacts archivés
  const archivedContacts = contacts.filter((contact) => contact.archived)

  // Appliquer les filtres
  const filteredContacts = archivedContacts.filter((contact) => {
    const matchesSearch =
      searchTerm === "" ||
      contact.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === "all" || contact.categories.includes(filterCategory as ContactCategory)

    return matchesSearch && matchesCategory
  })

  // Trier par date d'archivage (plus récent en premier)
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const dateA = a.archiveDate ? new Date(a.archiveDate).getTime() : 0
    const dateB = b.archiveDate ? new Date(b.archiveDate).getTime() : 0
    return dateB - dateA
  })

  // Restaurer un contact archivé
  const handleRestoreContact = (contact: Contact) => {
    const updatedContact = {
      ...contact,
      archived: false,
      archiveDate: undefined,
      dateDerniereModification: new Date(),
    }

    const updatedContacts = contacts.map((c) => (c.id === contact.id ? updatedContact : c))
    onUpdateContacts(updatedContacts)

    toast({
      title: "Contact restauré",
      description: `${contact.prenom} ${contact.nom} a été restauré avec succès.`,
    })
  }

  // Ouvrir la confirmation de suppression
  const handleConfirmDelete = (contact: Contact) => {
    setContactToDelete(contact)
    setConfirmDeleteOpen(true)
  }

  // Supprimer définitivement un contact
  const handleDeletePermanently = () => {
    if (!contactToDelete) return

    const updatedContacts = contacts.filter((c) => c.id !== contactToDelete.id)
    onUpdateContacts(updatedContacts)

    toast({
      title: "Contact supprimé",
      description: `${contactToDelete.prenom} ${contactToDelete.nom} a été supprimé définitivement.`,
      variant: "destructive",
    })

    setConfirmDeleteOpen(false)
    setContactToDelete(null)
  }

  // Exporter les contacts archivés en CSV
  const handleExportCSV = () => {
    // Préparer les données pour l'export
    const data = sortedContacts.map((contact) => {
      return {
        Nom: contact.nom,
        Prénom: contact.prenom,
        Email: contact.email,
        Téléphone: contact.telephone,
        Adresse: contact.adresse,
        "Code Postal": contact.codePostal,
        Ville: contact.ville,
        Catégories: contact.categories.join(", "),
        Statut: contact.status,
        "Date de création": new Date(contact.dateCreation).toLocaleDateString("fr-FR"),
        "Date d'archivage": contact.archiveDate ? new Date(contact.archiveDate).toLocaleDateString("fr-FR") : "",
        Commentaires: contact.commentaires,
      }
    })

    // Convertir en CSV
    const headers = Object.keys(data[0] || {}).join(",")
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    )
    const csv = [headers, ...rows].join("\n")

    // Créer un blob et télécharger
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `contacts_archives_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export réussi",
      description: `${sortedContacts.length} contacts archivés ont été exportés.`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Gestion des archives
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={filterCategory}
                  onValueChange={(value) => setFilterCategory(value as ContactCategory | "all")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Toutes les catégories" />
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
              <Button variant="outline" onClick={handleExportCSV} disabled={sortedContacts.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Contacts archivés</CardTitle>
              <CardDescription>
                {sortedContacts.length} contact{sortedContacts.length !== 1 ? "s" : ""} archivé
                {sortedContacts.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedContacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Prénom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Catégories</TableHead>
                        <TableHead>Date d'archivage</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.nom}</TableCell>
                          <TableCell>{contact.prenom}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{contact.telephone}</TableCell>
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
                            {contact.archiveDate ? new Date(contact.archiveDate).toLocaleDateString("fr-FR") : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleRestoreContact(contact)}>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Restaurer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleConfirmDelete(contact)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Aucun contact archivé trouvé.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer définitivement le contact{" "}
              <span className="font-semibold">
                {contactToDelete?.prenom} {contactToDelete?.nom}
              </span>
              ? Cette action est irréversible.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeletePermanently}>
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
