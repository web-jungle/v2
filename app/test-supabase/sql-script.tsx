"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy } from "lucide-react"

export default function SqlScript() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `
-- Activer l'extension uuid-ossp si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la table des collaborateurs
CREATE TABLE IF NOT EXISTS collaborateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  couleur VARCHAR(50) NOT NULL,
  entreprise VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifiant VARCHAR(255) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  nom VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'collaborateur')),
  collaborateur_id UUID REFERENCES collaborateurs(id),
  collaborateurs_geres UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table des événements
CREATE TABLE IF NOT EXISTS evenements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  end TIMESTAMP WITH TIME ZONE NOT NULL,
  collaborateur_id UUID NOT NULL REFERENCES collaborateurs(id),
  type_evenement VARCHAR(50) NOT NULL,
  lieu_chantier VARCHAR(255),
  zone_trajet VARCHAR(50),
  panier_repas BOOLEAN DEFAULT FALSE,
  ticket_restaurant BOOLEAN DEFAULT FALSE,
  heures_supplementaires NUMERIC(5,2) DEFAULT 0,
  grand_deplacement BOOLEAN DEFAULT FALSE,
  prgd BOOLEAN DEFAULT FALSE,
  nombre_prgd INTEGER DEFAULT 0,
  type_absence VARCHAR(50),
  verrouille BOOLEAN DEFAULT FALSE,
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  adresse_complete TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evenements_collaborateur_id ON evenements(collaborateur_id);
CREATE INDEX IF NOT EXISTS idx_evenements_start ON evenements(start);
CREATE INDEX IF NOT EXISTS idx_evenements_end ON evenements(end);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_collaborateur_id ON utilisateurs(collaborateur_id);

-- Insérer des données de test pour les collaborateurs
INSERT INTO collaborateurs (nom, couleur, entreprise)
VALUES 
  ('ARTES Damien', '#3174ad', 'ORIZON TELECOM'),
  ('BENAMARA Walid', '#e6550d', 'ORIZON TELECOM'),
  ('BELTRAN Noah', '#31a354', 'ORIZON INSTALLATION'),
  ('BERRAHMOUNE Abdelkader', '#756bb1', 'ORIZON INSTALLATION'),
  ('BLOT Alexia', '#636363', 'ORIZON TELECOM')
ON CONFLICT (id) DO NOTHING;

-- Insérer l'utilisateur admin
INSERT INTO utilisateurs (identifiant, mot_de_passe, nom, role)
VALUES ('admin', 'adminV66+', 'Administrateur', 'admin')
ON CONFLICT (identifiant) DO NOTHING;
`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Script SQL pour initialiser la base de données</CardTitle>
        <CardDescription>
          Copiez ce script et exécutez-le dans l'éditeur SQL de Supabase pour créer les tables nécessaires
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTitle>Instructions</AlertTitle>
          <AlertDescription>
            1. Connectez-vous à votre compte Supabase
            <br />
            2. Sélectionnez votre projet
            <br />
            3. Allez dans "SQL Editor"
            <br />
            4. Créez une nouvelle requête
            <br />
            5. Collez ce script
            <br />
            6. Cliquez sur "Run" pour exécuter le script
          </AlertDescription>
        </Alert>
        <Textarea value={sqlScript} readOnly className="font-mono text-sm h-96 overflow-auto" />
      </CardContent>
      <CardFooter>
        <Button onClick={copyToClipboard} className="flex items-center gap-2">
          <Copy size={16} />
          {copied ? "Copié !" : "Copier le script"}
        </Button>
      </CardFooter>
    </Card>
  )
}
