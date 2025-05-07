"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthToken } from "@/hooks/useAuthToken";
import { CalendarRange, Moon, Sun, Truck, UserCog, Users } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isAuthenticated, userId, isLoading } = useAuthToken();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // État de chargement
  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">
            Veuillez patienter pendant le chargement de votre espace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-32 h-32 mb-4">
          <Image
            src="/images/logo.png"
            alt="ORIZON GROUP"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold">Bienvenue</h1>
        <div className="flex items-center space-x-2 mt-4">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
            <Moon className="h-4 w-4" />
            <Label htmlFor="dark-mode" className="ml-1">
              Mode sombre
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CalendarRange className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Planning RH</CardTitle>
            <CardDescription>Gestion des plannings</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm">
              Organisez le travail des collaborateurs, gérez les absences et
              suivez les activités.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/planning")}>
              Accéder au Planning
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle className="text-xl">CRM</CardTitle>
            <CardDescription>Gestion de la relation client</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm">
              Gérez vos prospects et clients, suivez l'avancement des projets
              commerciaux.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => router.push("/crm")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Accéder au CRM
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <UserCog className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-xl">RH</CardTitle>
            <CardDescription>Gestion des ressources humaines</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm">
              Gérez les dossiers du personnel.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => router.push("/rh")}
              className="bg-green-500 hover:bg-green-600"
            >
              Accéder aux RH
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-orange-500" />
            </div>
            <CardTitle className="text-xl">Logistique</CardTitle>
            <CardDescription>Gestion du parc automobile</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm">
              Suivez l'état de votre flotte de véhicules, les contrats et
              l'entretien.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => router.push("/logistique")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Accéder à la Logistique
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
