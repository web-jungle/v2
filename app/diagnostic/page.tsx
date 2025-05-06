"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Database, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function DiagnosticPage() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">(
    "loading"
  );
  const [databaseInfo, setDatabaseInfo] = useState<{
    count?: number;
    error?: string;
  } | null>(null);

  const checkStatus = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/health-check", {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setStatus("online");
        setDatabaseInfo({ count: data.count });
      } else {
        const errorData = await response.json();
        setStatus("offline");
        setDatabaseInfo({ error: errorData.error || "Erreur inconnue" });
      }
    } catch (error) {
      setStatus("offline");
      setDatabaseInfo({
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Diagnostic du système</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>État de la base de données</CardTitle>
          <CardDescription>
            Vérification de la connexion à la base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant={status === "online" ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {status === "online" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : status === "offline" ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                )}
                <AlertTitle>
                  {status === "online"
                    ? "Connexion à la base de données établie"
                    : status === "offline"
                    ? "Erreur de connexion à la base de données"
                    : "Vérification de la connexion..."}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {status === "online"
                  ? `Base de données accessible. ${databaseInfo?.count} collaborateurs trouvés.`
                  : status === "offline" && databaseInfo?.error
                  ? `Erreur: ${databaseInfo.error}`
                  : "Vérification en cours..."}
              </AlertDescription>
            </Alert>

            <Button
              onClick={checkStatus}
              disabled={status === "loading"}
              variant="outline"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  status === "loading" ? "animate-spin" : ""
                }`}
              />
              Vérifier la connexion
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ressources</CardTitle>
          <CardDescription>
            Liens vers les ressources importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center p-2 rounded-md bg-muted hover:bg-muted/80">
              <Database className="h-5 w-5 mr-2 text-muted-foreground" />
              <Button
                variant="link"
                onClick={() => (window.location.href = "/collaborateurs")}
              >
                Gérer les collaborateurs
              </Button>
            </div>
            <div className="flex items-center p-2 rounded-md bg-muted hover:bg-muted/80">
              <Database className="h-5 w-5 mr-2 text-muted-foreground" />
              <Button
                variant="link"
                onClick={() => (window.location.href = "/planning")}
              >
                Accéder au planning
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
