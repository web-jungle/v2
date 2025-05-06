"use client"

import { PlanningSyncDiagnostic } from "@/components/planning-sync-diagnostic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function PlanningDiagnosticPage() {
  const [isCreatingTables, setIsCreatingTables] = useState(false)
  const [tableStatus, setTableStatus] = useState<{
    collaborateurs: boolean
    planning_events: boolean
  }>({
    collaborateurs: false,
    planning_events: false,
  })

  const supabase = createClientComponentClient()

  // Vérifier si les tables existent
  const checkTables = async () => {
    try {
      // Vérifier la table collaborateurs
      const { error: errorCollaborateurs } = await supabase.from("collaborateurs").select("id").limit(1)

      // Vérifier la table planning_events
      const { error: errorPlanningEvents } = await supabase.from("planning_events").select("id").limit(1)

      setTableStatus({
        collaborateurs: !errorCollaborateurs,
        planning_events: !errorPlanningEvents,
      })
    } catch (error) {
      console.error("Erreur lors de la vérification des tables:", error)
    }
  }

  // Créer les tables nécessaires
  const createTables = async () => {
    setIsCreatingTables(true)
    try {
      // Créer la table collaborateurs si elle n'existe pas
      if (!tableStatus.collaborateurs) {
        await supabase.rpc("create_collaborateurs_table")
      }

      // Créer la table planning_events si elle n'existe pas
      if (!tableStatus.planning_events) {
        await supabase.rpc("create_planning_events_table")
      }

      // Vérifier à nouveau les tables
      await checkTables()
    } catch (error) {
      console.error("Erreur lors de la création des tables:", error)
    } finally {
      setIsCreatingTables(false)
    }
  }

  useEffect(() => {
    checkTables()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Diagnostic du Planning</h1>

      <Card>
        <CardHeader>
          <CardTitle>État des tables</CardTitle>
          <CardDescription>Vérification des tables nécessaires pour le planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-medium">Table Collaborateurs</h3>
                <div className={`text-lg font-bold ${tableStatus.collaborateurs ? "text-green-600" : "text-red-600"}`}>
                  {tableStatus.collaborateurs ? "Disponible" : "Non disponible"}
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-medium">Table Planning Events</h3>
                <div className={`text-lg font-bold ${tableStatus.planning_events ? "text-green-600" : "text-red-600"}`}>
                  {tableStatus.planning_events ? "Disponible" : "Non disponible"}
                </div>
              </div>
            </div>

            {(!tableStatus.collaborateurs || !tableStatus.planning_events) && (
              <Button onClick={createTables} disabled={isCreatingTables}>
                {isCreatingTables ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Création des tables...
                  </>
                ) : (
                  "Créer les tables manquantes"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="diagnostic">
        <TabsList>
          <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          <TabsTrigger value="sql">SQL</TabsTrigger>
        </TabsList>
        <TabsContent value="diagnostic" className="mt-4">
          <PlanningSyncDiagnostic />
        </TabsContent>
        <TabsContent value="sql" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scripts SQL</CardTitle>
              <CardDescription>Scripts SQL pour créer et maintenir les tables du planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Création de la table collaborateurs</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    {`CREATE TABLE IF NOT EXISTS collaborateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telephone VARCHAR(20),
  poste VARCHAR(100),
  departement VARCHAR(100),
  date_embauche DATE,
  statut VARCHAR(50) DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Création de la table planning_events</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    {`CREATE TABLE IF NOT EXISTS planning_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  end TIMESTAMP WITH TIME ZONE NOT NULL,
  collaborateur_id UUID REFERENCES collaborateurs(id) ON DELETE CASCADE,
  lieu VARCHAR(255),
  description TEXT,
  type VARCHAR(50),
  statut VARCHAR(50) DEFAULT 'planifié',
  panier_repas BOOLEAN DEFAULT FALSE,
  ticket_restaurant BOOLEAN DEFAULT FALSE,
  heures_sup NUMERIC(5,2) DEFAULT 0,
  grand_deplacement BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Fonction pour créer la table collaborateurs</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    {`CREATE OR REPLACE FUNCTION create_collaborateurs_table()
RETURNS void AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  CREATE TABLE IF NOT EXISTS collaborateurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20),
    poste VARCHAR(100),
    departement VARCHAR(100),
    date_embauche DATE,
    statut VARCHAR(50) DEFAULT 'actif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Fonction pour créer la table planning_events</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    {`CREATE OR REPLACE FUNCTION create_planning_events_table()
RETURNS void AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Vérifier si la table collaborateurs existe, sinon la créer
  PERFORM create_collaborateurs_table();
  
  CREATE TABLE IF NOT EXISTS planning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    start TIMESTAMP WITH TIME ZONE NOT NULL,
    end TIMESTAMP WITH TIME ZONE NOT NULL,
    collaborateur_id UUID REFERENCES collaborateurs(id) ON DELETE CASCADE,
    lieu VARCHAR(255),
    description TEXT,
    type VARCHAR(50),
    statut VARCHAR(50) DEFAULT 'planifié',
    panier_repas BOOLEAN DEFAULT FALSE,
    ticket_restaurant BOOLEAN DEFAULT FALSE,
    heures_sup NUMERIC(5,2) DEFAULT 0,
    grand_deplacement BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
