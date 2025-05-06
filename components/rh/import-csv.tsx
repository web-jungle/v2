"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Salarie } from "@/lib/rh-types"

interface ImportCSVProps {
  isOpen: boolean
  onClose: () => void
  onImport: (salaries: Salarie[]) => void
  existingSalaries: Salarie[]
}

export default function ImportCSV({ isOpen, onClose, onImport, existingSalaries }: ImportCSVProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ total: number; new: number; updated: number } | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
      setPreview(null)
    }
  }

  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date()

    // Format DD/MM/YYYY
    const parts = dateStr.split("/")
    if (parts.length === 3) {
      const day = Number.parseInt(parts[0], 10)
      const month = Number.parseInt(parts[1], 10) - 1 // Les mois commencent à 0 en JavaScript
      const year = Number.parseInt(parts[2], 10)
      return new Date(year, month, day)
    }

    return new Date()
  }

  const handlePreview = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier CSV")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const text = await file.text()
      const result = processCSV(text)

      // Compter les nouveaux et les mis à jour
      const newSalaries = result.filter(
        (newSalarie) => !existingSalaries.some((existingSalarie) => existingSalarie.id === newSalarie.id),
      ).length

      const updatedSalaries = result.filter((newSalarie) =>
        existingSalaries.some((existingSalarie) => existingSalarie.id === newSalarie.id),
      ).length

      setPreview({
        total: result.length,
        new: newSalaries,
        updated: updatedSalaries,
      })
    } catch (err) {
      setError(`Erreur lors de l'analyse du fichier: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier CSV")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const text = await file.text()
      const salaries = processCSV(text)
      onImport(salaries)
      toast({
        title: "Importation réussie",
        description: `${salaries.length} salariés ont été importés avec succès.`,
      })
      onClose()
    } catch (err) {
      setError(`Erreur lors de l'importation: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const processCSV = (csvText: string): Salarie[] => {
    // Diviser le texte en lignes
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "")

    // Ignorer la première ligne (en-têtes)
    const dataLines = lines.slice(1)

    // Traiter chaque ligne
    return dataLines.map((line) => {
      // Gérer les virgules dans les champs entre guillemets
      const fields: string[] = []
      let inQuotes = false
      let currentField = ""

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          fields.push(currentField)
          currentField = ""
        } else {
          currentField += char
        }
      }

      // Ajouter le dernier champ
      fields.push(currentField)

      // Si le séparateur est un tab ou un point-virgule, essayer avec ces séparateurs
      if (fields.length <= 1) {
        if (line.includes("\t")) {
          return processTabSeparatedLine(line)
        } else if (line.includes(";")) {
          return processSemicolonSeparatedLine(line)
        }
      }

      return createSalarieFromFields(fields)
    })
  }

  const processTabSeparatedLine = (line: string): Salarie => {
    const fields = line.split("\t")
    return createSalarieFromFields(fields)
  }

  const processSemicolonSeparatedLine = (line: string): Salarie => {
    const fields = line.split(";")
    return createSalarieFromFields(fields)
  }

  const createSalarieFromFields = (fields: string[]): Salarie => {
    // Nettoyer les champs
    const cleanFields = fields.map((field) => field.trim().replace(/^"|"$/g, ""))

    // Extraire les données
    const [
      id,
      nom,
      prenom,
      classification,
      dateEntree,
      typeContrat,
      dureeContrat,
      certifications,
      habilitations,
      entreprise,
      poste,
      email,
      telephone,
      adresse,
      codePostal,
      ville,
      dateNaissance,
      numeroSecu,
    ] = cleanFields

    // Créer l'objet salarié
    return {
      id: id || String(Date.now()),
      nom: nom || "",
      prenom: prenom || "",
      classification: classification || "Employé",
      dateEntree: parseDate(dateEntree),
      typeContrat: (typeContrat as any) || "CDI",
      dureeContrat: dureeContrat || undefined,
      certifications: certifications ? certifications.split(",").map((c) => c.trim()) : [],
      habilitations: habilitations ? habilitations.split(",").map((h) => h.trim()) : [],
      entreprise: entreprise || "ORIZON TELECOM",
      poste: poste || "",
      email: email || "",
      telephone: telephone || "",
      adresse: adresse || undefined,
      codePostal: codePostal || undefined,
      ville: ville || undefined,
      dateNaissance: dateNaissance ? parseDate(dateNaissance) : undefined,
      numeroSecu: numeroSecu || undefined,
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importer des salariés depuis un fichier CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="csv-file" className="block text-sm font-medium">
              Sélectionner un fichier CSV
            </label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer" />
            <p className="text-xs text-muted-foreground">
              Le fichier doit contenir les colonnes: ID, Nom, Prénom, Classification, etc.
            </p>
          </div>

          {file && (
            <div className="flex items-center space-x-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{file.name}</span>
              <span className="text-muted-foreground">({Math.round(file.size / 1024)} Ko)</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {preview && (
            <div className="bg-muted p-4 rounded-md space-y-2">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span className="font-medium">Aperçu de l'importation</span>
              </div>
              <ul className="text-sm space-y-1">
                <li>Total: {preview.total} salariés</li>
                <li>Nouveaux: {preview.new} salariés</li>
                <li>Mises à jour: {preview.updated} salariés</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handlePreview} disabled={!file || isLoading}>
            {isLoading ? "Analyse en cours..." : "Aperçu"}
          </Button>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || isLoading}
              className="bg-green-500 hover:bg-green-600"
            >
              {isLoading ? "Importation..." : "Importer"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
