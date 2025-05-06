"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthToken } from "@/hooks/useAuthToken";
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HashPasswordsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    details?: string[];
  }>({});
  const { isAuthenticated, hasRole } = useAuthToken();
  const router = useRouter();

  // Vérifier si l'utilisateur est admin
  if (!isAuthenticated || !hasRole("admin")) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous devez être administrateur pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleHashPasswords = async () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir hacher tous les mots de passe non hachés ?"
      )
    ) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/hash-passwords", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.error("Erreur:", error);
        setResult({
          success: false,
          message: "Une erreur s'est produite lors de la requête",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Hachage des mots de passe
          </CardTitle>
          <CardDescription>
            Cet outil va hacher tous les mots de passe qui sont actuellement
            stockés en clair dans la base de données. Les mots de passe déjà
            hachés ne seront pas modifiés.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.success !== undefined && (
            <Alert
              variant={result.success ? "default" : "destructive"}
              className="mb-4"
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success
                  ? "Opération réussie"
                  : "Erreur lors de l'opération"}
              </AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {result.details && result.details.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-md max-h-60 overflow-y-auto">
              <h3 className="mb-2 font-semibold">Détails:</h3>
              <ul className="space-y-1 text-sm">
                {result.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Retour
          </Button>
          <Button
            variant="default"
            onClick={handleHashPasswords}
            disabled={isLoading}
          >
            {isLoading ? "En cours..." : "Hacher les mots de passe"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
