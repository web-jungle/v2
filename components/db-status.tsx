"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw, Database } from "lucide-react"

export default function DbStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [isSeeding, setIsSeeding] = useState<boolean>(false)

  const checkConnection = async () => {
    setStatus("loading")
    try {
      const res = await fetch("/api/db-status")
      const data = await res.json()

      if (data.success) {
        setStatus("connected")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.message)
      }
    } catch (error) {
      setStatus("error")
      setMessage("Erreur de connexion à la base de données")
    }
  }

  const seedDatabase = async () => {
    setIsSeeding(true)
    try {
      const res = await fetch("/api/seed")
      const data = await res.json()

      if (data.success) {
        setMessage("Base de données initialisée avec succès!")
        checkConnection()
      } else {
        setStatus("error")
        setMessage(`Erreur lors de l'initialisation: ${data.message}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage("Erreur lors de l'initialisation de la base de données")
    } finally {
      setIsSeeding(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="space-y-4">
      <Alert variant={status === "connected" ? "default" : "destructive"}>
        <div className="flex items-center gap-2">
          {status === "connected" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : status === "error" ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : (
            <RefreshCw className="h-5 w-5 animate-spin" />
          )}
          <AlertTitle>
            {status === "connected"
              ? "Connexion à la base de données établie"
              : status === "error"
                ? "Erreur de connexion à la base de données"
                : "Vérification de la connexion..."}
          </AlertTitle>
        </div>
        <AlertDescription className="mt-2">{message}</AlertDescription>
      </Alert>

      <div className="flex gap-4">
        <Button onClick={checkConnection} disabled={status === "loading"} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
          Vérifier la connexion
        </Button>
        <Button onClick={seedDatabase} disabled={isSeeding || status === "loading"} variant="default">
          <Database className="mr-2 h-4 w-4" />
          {isSeeding ? "Initialisation en cours..." : "Initialiser la base de données"}
        </Button>
      </div>
    </div>
  )
}
