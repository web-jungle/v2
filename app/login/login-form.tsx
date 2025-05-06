"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const success = await login(identifiant, motDePasse);

      if (success) {
        sessionStorage.setItem("redirect_after_login", "/home");
        window.location.href = "/home";
      } else {
        toast({
          title: "Erreur d'authentification",
          description: "Identifiant ou mot de passe incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      toast({
        title: "Erreur de connexion",
        description:
          "Une erreur est survenue lors de la tentative de connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="identifiant">Identifiant</Label>
        <Input
          id="identifiant"
          value={identifiant}
          onChange={(e) => setIdentifiant(e.target.value)}
          placeholder="Votre identifiant"
          type="text"
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="motDePasse">Mot de passe</Label>
        <Input
          id="motDePasse"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          placeholder="Votre mot de passe"
          type="password"
          disabled={isLoading}
        />
      </div>
      <Button disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
