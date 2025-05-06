"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, FileText, Trash2, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Document } from "@/lib/crm-types"

interface DocumentUploadProps {
  documents: Document[]
  onDocumentsChange: (documents: Document[]) => void
}

export default function DocumentUpload({ documents, onDocumentsChange }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    setError(null)

    // Vérifier la taille des fichiers (limite à 5 Mo par fichier)
    const maxSize = 5 * 1024 * 1024 // 5 Mo en octets

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        setError(`Le fichier "${file.name}" dépasse la taille maximale autorisée (5 Mo).`)
        return
      }

      // Simuler le téléchargement du fichier
      // Dans une application réelle, vous utiliseriez un service de stockage
      const newDocument: Document = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nom: file.name,
        type: file.type,
        dateAjout: new Date(),
        url: URL.createObjectURL(file), // Temporaire, à remplacer par l'URL réelle après téléchargement
        taille: Math.round(file.size / 1024), // Taille en Ko
      }

      onDocumentsChange([...documents, newDocument])
    })

    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveDocument = (documentId: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== documentId))
  }

  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} Ko`
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} Mo`
    }
  }

  const getFileIcon = (type: string) => {
    // Vous pouvez ajouter plus d'icônes spécifiques selon les types de fichiers
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm mb-2">
          Glissez-déposez vos fichiers ici ou{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            parcourez
          </Button>
        </p>
        <p className="text-xs text-muted-foreground">
          Formats acceptés: PDF, Word, Excel, images (max. 5 Mo par fichier)
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {documents.length > 0 && (
        <div className="space-y-2">
          <Label>Documents ({documents.length})</Label>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(doc.type)}
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{doc.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.taille)} • {new Date(doc.dateAjout).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveDocument(doc.id)} className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
