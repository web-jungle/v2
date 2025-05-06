"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

export default function TestConnection() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    connection: boolean
    tables: {
      collaborateurs: boolean
      utilisateurs: boolean
      evenements: boolean
    }
    data: {
      collaborateurs: number
      utilisateurs: number
      evenements: number
    }
    error?: string
  } | null>(null)

  const testConnection = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()

      // Test de connexion
      const { data: connectionTest, error: connectionError } = await supabase.from("_tables").select("*").limit(1)

      if (connectionError && connectionError.code !== "PGRST116") {
        throw new Error(`Erreur de connexion: ${connectionError.message}`)
      }

      // Test des tables
      const tableResults = {
        collaborateurs: false,
        utilisateurs: false,
        evenements: false,
      }

      const dataResults = {
        collaborateurs: 0,
        utilisateurs: 0,
        evenements: 0,
      }

      // Vérifier la table collaborateurs
      const { count: collaborateursCount, error: collaborateursError } = await supabase
        .from("collaborateurs")
        .select("*", { count: "exact", head: true })

      tableResults.collaborateurs = !collaborateursError
      if (!collaborateursError) {
        dataResults.collaborateurs = collaborateursCount || 0
      }

      // Vérifier la table utilisateurs
      const { count: utilisateursCount, error: utilisateursError } = await supabase
        .from("utilisateurs")
        .select("*", { count: "exact", head: true })

      tableResults.utilisateurs = !utilisateursError
      if (!utilisateursError) {
        dataResults.utilisateurs = utilisateursCount || 0
      }

      // Vérifier la table evenements
      const { count: evenementsCount, error: evenementsError } = await supabase
        .from("evenements")
        .select("*", { count: "exact", head: true })

      tableResults.evenements = !evenementsError
      if (!evenementsError) {
        dataResults.evenements = evenementsCount || 0
      }

      setResults({
        connection: true,
        tables: tableResults,
        data: dataResults,
      })
    } catch (error: any) {
      setResults({
        connection: false,
        tables: {
          collaborateurs: false,
          utilisateurs: false,
          evenements: false,
        },
        data: {
          collaborateurs: 0,
          utilisateurs: 0,
          evenements: 0,
        },
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const initDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/init-db")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'initialisation de la base de données")
      }

      // Retester la connexion après l'initialisation
      await testConnection()
    } catch (error: any) {
      setResults({
        ...results!,
        error: `Erreur d'initialisation: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test de connexion à Supabase</CardTitle>
        <CardDescription>Vérifiez si votre application peut se connecter à la base de données Supabase</CardDescription>
      </CardHeader>
      <CardContent>
        {results && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Connexion à Supabase:</span>
              {results.connection ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" /> Connecté
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <XCircle className="h-5 w-5 mr-1" /> Non connecté
                </span>
              )}
            </div>

            {results.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{results.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">Tables:</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  collaborateurs:
                  {results.tables.collaborateurs ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Existe ({results.data.collaborateurs} entrées)
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" /> N'existe pas
                    </span>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  utilisateurs:
                  {results.tables.utilisateurs ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Existe ({results.data.utilisateurs} entrées)
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" /> N'existe pas
                    </span>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  evenements:
                  {results.tables.evenements ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Existe ({results.data.evenements} entrées)
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" /> N'existe pas
                    </span>
                  )}
                </li>
              </ul>
            </div>

            {(!results.tables.collaborateurs || !results.tables.utilisateurs || !results.tables.evenements) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Tables manquantes</AlertTitle>
                <AlertDescription>
                  Certaines tables nécessaires n'existent pas. Utilisez l'onglet "Script SQL" pour créer les tables
                  manuellement.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button onClick={testConnection} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Test en cours...
            </>
          ) : (
            "Tester la connexion"
          )}
        </Button>

        {results && (!results.tables.collaborateurs || !results.tables.utilisateurs || !results.tables.evenements) && (
          <Button variant="outline" onClick={initDatabase} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initialisation...
              </>
            ) : (
              "Initialiser la base de données"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
