"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import KanbanBoard from "@/components/crm/kanban-board"
import type { Contact } from "@/lib/crm-types"
import { contactsInitiaux } from "@/lib/crm-data"
// Ajouter l'import pour le nouveau composant ContactsList
import ContactsList from "@/components/crm/contacts-list"
import ContactForm from "@/components/crm/contact-form"

// Ajouter l'import pour le Select en haut du fichier
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Euro, BarChart3, TrendingUp, PieChart } from "lucide-react"

export default function CRMPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeTab, setActiveTab] = useState("kanban")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Charger les contacts
  useEffect(() => {
    // Simuler une requête API
    setContacts(contactsInitiaux)
  }, [])

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">Veuillez patienter pendant le chargement du CRM.</p>
        </div>
      </div>
    )
  }

  // Filtrer les contacts accessibles à l'utilisateur pour les statistiques (inclut les archivés)
  const userAccessibleContacts = contacts.filter((contact) => {
    // Les administrateurs et managers voient tous les contacts
    if (user.role === "admin" || user.role === "manager") {
      return true
    }

    // Les collaborateurs ne voient que les contacts qui leur sont affectés
    if (user.role === "collaborateur" && user.collaborateurId) {
      return contact.collaborateursIds && contact.collaborateursIds.includes(user.collaborateurId)
    }

    return false
  })

  // Filtrer les contacts non archivés pour les statistiques
  const activeContacts = userAccessibleContacts.filter((contact) => !contact.archived)

  // Compter les contacts archivés
  const archivedContacts = userAccessibleContacts.filter((contact) => contact.archived)

  // Extraire toutes les catégories uniques des contacts
  const contactCategories = Array.from(new Set(activeContacts.flatMap((c) => c.categories)))

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">CRM</h1>
      </div>

      {/* Modifier le composant Tabs pour ajouter l'onglet "Contacts" */}
      <Tabs defaultValue="kanban" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kanban">Tableau Kanban</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        {/* Contenu existant des onglets */}
        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard contacts={contacts} onUpdateContacts={setContacts} />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <ContactsList
            contacts={contacts}
            onEditContact={(contact) => {
              // Ouvrir le formulaire d'édition
              setSelectedContact(contact)
              setIsFormOpen(true)
            }}
            onArchiveContact={(contact) => {
              // Archiver le contact
              const updatedContact = {
                ...contact,
                archived: true,
                archiveDate: new Date(),
                dateDerniereModification: new Date(),
              }
              const updatedContacts = contacts.map((c) => (c.id === contact.id ? updatedContact : c))
              setContacts(updatedContacts)
              toast({
                title: "Contact archivé",
                description: `${contact.prenom} ${contact.nom} a été archivé avec succès.`,
              })
            }}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          {/* Ajouter un filtre par catégorie */}
          <div className="flex justify-end mb-4">
            <Select
              defaultValue="all"
              onValueChange={(value) => {
                // Filtrer les contacts par catégorie
                if (value === "all") {
                  // Pas de filtre
                } else {
                  // Filtrer par catégorie
                }
              }}
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

          {/* Statistiques des devis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total des devis</p>
                    <h3 className="text-2xl font-bold">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                        activeContacts.reduce((sum, contact) => sum + (contact.montantDevis || 0), 0),
                      )}
                    </h3>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <Euro className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Devis moyen</p>
                    <h3 className="text-2xl font-bold">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                        activeContacts.filter((c) => c.montantDevis && c.montantDevis > 0).length > 0
                          ? activeContacts.reduce((sum, contact) => sum + (contact.montantDevis || 0), 0) /
                              activeContacts.filter((c) => c.montantDevis && c.montantDevis > 0).length
                          : 0,
                      )}
                    </h3>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Devis en attente</p>
                    <h3 className="text-2xl font-bold">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                        activeContacts
                          .filter((c) => c.status === "Devis envoyé")
                          .reduce((sum, contact) => sum + (contact.montantDevis || 0), 0),
                      )}
                    </h3>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-full">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nombre de devis</p>
                    <h3 className="text-2xl font-bold">
                      {activeContacts.filter((c) => c.montantDevis && c.montantDevis > 0).length}
                    </h3>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-full">
                    <PieChart className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contacts par statut</CardTitle>
                <CardDescription>Répartition des contacts actifs selon leur statut</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(activeContacts.map((c) => c.status))).map((status) => {
                    const count = activeContacts.filter((c) => c.status === status).length
                    const percentage = Math.round((count / activeContacts.length) * 100) || 0

                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{status}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contacts par catégorie</CardTitle>
                <CardDescription>Répartition des contacts selon leurs intérêts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(activeContacts.flatMap((c) => c.categories))).map((category) => {
                    const count = activeContacts.filter((c) => c.categories.includes(category)).length
                    const percentage = Math.round((count / activeContacts.length) * 100) || 0

                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-blue-500 rounded-full h-2" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Montant par catégorie</CardTitle>
                <CardDescription>Répartition des montants de devis par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(activeContacts.flatMap((c) => c.categories))).map((category) => {
                    const totalAmount = activeContacts
                      .filter((c) => c.categories.includes(category) && c.montantDevis && c.montantDevis > 0)
                      .reduce((sum, contact) => sum + (contact.montantDevis || 0), 0)

                    const maxAmount = Math.max(
                      ...Array.from(new Set(activeContacts.flatMap((c) => c.categories))).map((cat) =>
                        activeContacts
                          .filter((c) => c.categories.includes(cat) && c.montantDevis && c.montantDevis > 0)
                          .reduce((sum, contact) => sum + (contact.montantDevis || 0), 0),
                      ),
                    )

                    const percentage = maxAmount > 0 ? Math.round((totalAmount / maxAmount) * 100) : 0

                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 rounded-full h-2" style={{ width: `${percentage}%` }} />
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
      {isFormOpen && (
        <ContactForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedContact(null)
          }}
          contact={selectedContact}
          onSave={(contact) => {
            // Mettre à jour le contact
            const updatedContacts = contacts.map((c) => (c.id === contact.id ? contact : c))
            setContacts(updatedContacts)
            setIsFormOpen(false)
            setSelectedContact(null)
            toast({
              title: "Contact mis à jour",
              description: `Les informations de ${contact.prenom} ${contact.nom} ont été mises à jour.`,
            })
          }}
        />
      )}
    </div>
  )
}
