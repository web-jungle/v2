"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { Contact, ContactCategory, Document } from "@/lib/crm-types"
import { collaborateurs } from "@/lib/data"
import { contactCategories } from "@/lib/crm-data"
import DocumentUpload from "./document-upload"

interface ContactFormProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onSave: (contact: Contact) => void
}

export default function ContactForm({ isOpen, onClose, contact, onSave }: ContactFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("infos")
  const [formData, setFormData] = useState<
    Omit<Contact, "id" | "dateCreation" | "dateDerniereModification" | "utilisateurId">
  >({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    codePostal: "",
    ville: "",
    categories: [],
    status: "À contacter",
    commentaires: "",
    collaborateursIds: [],
    documents: [],
    montantDevis: undefined,
  })

  useEffect(() => {
    if (contact) {
      setFormData({
        nom: contact.nom || "",
        prenom: contact.prenom || "",
        email: contact.email || "",
        telephone: contact.telephone || "",
        adresse: contact.adresse || "",
        codePostal: contact.codePostal || "",
        ville: contact.ville || "",
        categories: contact.categories || [],
        status: contact.status || "À contacter",
        commentaires: contact.commentaires || "",
        collaborateursIds: contact.collaborateursIds || [],
        documents: contact.documents || [],
        montantDevis: contact.montantDevis,
      })
    } else {
      // Réinitialiser le formulaire pour un nouveau contact
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        codePostal: "",
        ville: "",
        categories: [],
        status: "À contacter",
        commentaires: "",
        collaborateursIds: user?.collaborateurId ? [user.collaborateurId] : [],
        documents: [],
        montantDevis: undefined,
      })
    }
    setActiveTab("infos")
  }, [contact, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (category: ContactCategory, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, category],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c !== category),
      }))
    }
  }

  const handleCollaborateurChange = (collaborateurId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        collaborateursIds: [...prev.collaborateursIds, collaborateurId],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        collaborateursIds: prev.collaborateursIds.filter((id) => id !== collaborateurId),
      }))
    }
  }

  const handleDocumentsChange = (documents: Document[]) => {
    setFormData((prev) => ({ ...prev, documents }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value ? Number.parseFloat(value) : undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    // Validation de base
    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const now = new Date()

    // Créer le contact avec l'utilisateur actuel comme créateur
    const savedContact: Contact = {
      id: contact?.id || String(Date.now()),
      ...formData,
      dateCreation: contact?.dateCreation || now,
      dateDerniereModification: now,
      utilisateurId: user.id,
    }

    onSave(savedContact)
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? "Modifier le contact" : "Ajouter un contact"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="infos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="infos">Informations</TabsTrigger>
            <TabsTrigger value="collaborateurs">Collaborateurs</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="infos" className="space-y-4 mt-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input id="adresse" name="adresse" value={formData.adresse} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codePostal">Code postal</Label>
                    <Input id="codePostal" name="codePostal" value={formData.codePostal} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input id="ville" name="ville" value={formData.ville} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Catégories</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-md p-4">
                    {contactCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={formData.categories.includes(category)}
                          onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                        />
                        <Label htmlFor={`category-${category}`} className="font-normal">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commentaires">Commentaires</Label>
                  <Textarea
                    id="commentaires"
                    name="commentaires"
                    value={formData.commentaires}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montantDevis">Montant du devis (€)</Label>
                  <Input
                    id="montantDevis"
                    name="montantDevis"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.montantDevis || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                      setFormData((prev) => ({ ...prev, montantDevis: value }))
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collaborateurs" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Label>Collaborateurs affectés</Label>
                <div className="grid grid-cols-2 gap-4 border rounded-md p-4">
                  {collaborateurs.map((collaborateur) => (
                    <div key={collaborateur.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`collaborateur-${collaborateur.id}`}
                        checked={formData.collaborateursIds.includes(collaborateur.id)}
                        onCheckedChange={(checked) => handleCollaborateurChange(collaborateur.id, checked as boolean)}
                      />
                      <Label htmlFor={`collaborateur-${collaborateur.id}`} className="font-normal">
                        {collaborateur.nom} ({collaborateur.entreprise})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <DocumentUpload documents={formData.documents} onDocumentsChange={handleDocumentsChange} />
            </TabsContent>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
