"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { collaborateurs, entreprises, evenementsInitiaux } from "@/lib/data";
import type { Evenement } from "@/lib/types";
import {
  Building,
  CalendarIcon,
  Car,
  Clock,
  Coffee,
  FileText,
  Home,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend as ChartLegend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [events] = useState<Evenement[]>(evenementsInitiaux);
  const [timeframe, setTimeframe] = useState<"semaine" | "mois" | "annee">(
    "mois"
  );
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Vérifier si l'utilisateur est admin ou manager
  useEffect(() => {
    if (user && user.role === "collaborateur") {
      router.push("/");
      toast({
        title: "Accès limité",
        description:
          "Le tableau de bord complet est réservé aux administrateurs et managers.",
        variant: "destructive",
      });
    }
  }, [user, router, toast]);

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">
            Veuillez patienter pendant le chargement du tableau de bord.
          </p>
        </div>
      </div>
    );
  }

  // Filtrer les événements selon la période sélectionnée
  const filteredEvents = (() => {
    const now = new Date();
    const startOfPeriod = new Date();

    if (timeframe === "semaine") {
      startOfPeriod.setDate(now.getDate() - now.getDay() + 1); // Lundi de la semaine en cours
    } else if (timeframe === "mois") {
      startOfPeriod.setDate(1); // Premier jour du mois
    } else if (timeframe === "annee") {
      startOfPeriod.setMonth(0, 1); // Premier jour de l'année
    }

    startOfPeriod.setHours(0, 0, 0, 0);

    let filtered = events.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate >= startOfPeriod;
    });

    // Filtrer par entreprise si une entreprise est sélectionnée
    if (selectedEnterprise) {
      filtered = filtered.filter((event) => {
        const collaborateur = collaborateurs.find(
          (c) => c.id === event.collaborateurId
        );
        return collaborateur && collaborateur.entreprise === selectedEnterprise;
      });
    }

    return filtered;
  })();

  // Filtrer les collaborateurs par entreprise
  const filteredCollaborateurs = selectedEnterprise
    ? collaborateurs.filter((c) => c.entreprise === selectedEnterprise)
    : collaborateurs;

  // Calculer les statistiques
  const totalEvents = filteredEvents.length;
  const totalCollaborateurs = filteredCollaborateurs.length;
  const totalHeuresSupp = filteredEvents.reduce(
    (sum, event) =>
      sum + (event.heuresSupplementaires || event.heures_supplementaires || 0),
    0
  );
  const totalGrandsDeplacement = filteredEvents.filter(
    (event) => event.grandDeplacement || event.grand_deplacement
  ).length;
  const totalPaniersRepas = filteredEvents.filter(
    (event) => event.panierRepas || event.panier_repas
  ).length;
  const totalPRGD = filteredEvents.reduce((sum, event) => {
    // Vérifier si nombrePrgd existe et si c'est un nombre valide
    const prgdValue = event.prgd
      ? event.nombrePrgd || event.nombre_prgd || 0
      : 0;
    return sum + (isNaN(prgdValue) ? 0 : prgdValue);
  }, 0);

  // Données pour le graphique des événements par collaborateur
  const eventsByCollaborateur = filteredCollaborateurs
    .map((collaborateur) => {
      const count = filteredEvents.filter(
        (event) => event.collaborateurId === collaborateur.id
      ).length;
      return {
        name: collaborateur.nom,
        events: count,
        color: collaborateur.couleur,
      };
    })
    .sort((a, b) => b.events - a.events)
    .slice(0, 10); // Top 10 des collaborateurs

  // Données pour le graphique des types d'événements
  const eventTypes = [
    {
      name: "Standards",
      value: filteredEvents.filter(
        (e) => !e.grandDeplacement && !e.panierRepas && !e.prgd
      ).length,
      color: "#4f46e5",
    },
    {
      name: "Grands déplacements",
      value: filteredEvents.filter((e) => e.grandDeplacement).length,
      color: "#0ea5e9",
    },
    {
      name: "Paniers repas",
      value: filteredEvents.filter((e) => e.panierRepas).length,
      color: "#10b981",
    },
    {
      name: "PRGD",
      value: filteredEvents.filter((e) => e.prgd).length,
      color: "#8b5cf6",
    },
  ].filter((type) => type.value > 0);

  // Données pour le graphique des zones de trajet
  const zoneTrajetData = filteredEvents.reduce((acc, event) => {
    if (event.zoneTrajet) {
      acc[event.zoneTrajet] = (acc[event.zoneTrajet] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const zoneTrajetChart = Object.entries(zoneTrajetData)
    .map(([zone, count]) => ({
      name: `Zone ${zone}`,
      value: count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Données pour le graphique des événements par entreprise
  const eventsByEnterprise = entreprises.map((entreprise) => {
    const collaborateursIds = collaborateurs
      .filter((c) => c.entreprise === entreprise)
      .map((c) => c.id);

    const count = events.filter((event) => {
      const eventDate = new Date(event.start);
      const isInTimeframe =
        eventDate >= new Date(new Date().setMonth(new Date().getMonth() - 1));
      return collaborateursIds.includes(event.collaborateurId) && isInTimeframe;
    }).length;

    return {
      name: entreprise,
      events: count,
    };
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        {user.role === "admin" && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push("/admin/recap")}
          >
            <FileText className="h-4 w-4" />
            Récapitulatif administratif
          </Button>
        )}
        <div className="flex flex-wrap gap-4">
          <Select
            value={selectedEnterprise || ""}
            onValueChange={(value) => setSelectedEnterprise(value || null)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les entreprises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entreprises</SelectItem>
              {entreprises.map((entreprise) => (
                <SelectItem key={entreprise} value={entreprise}>
                  {entreprise}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as any)}
          >
            <TabsList>
              <TabsTrigger value="semaine">Cette semaine</TabsTrigger>
              <TabsTrigger value="mois">Ce mois</TabsTrigger>
              <TabsTrigger value="annee">Cette année</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Événements planifiés
                </p>
                <h3 className="text-2xl font-bold">{totalEvents}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Heures supplémentaires
                </p>
                <h3 className="text-2xl font-bold">{totalHeuresSupp}h</h3>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Grands déplacements
                </p>
                <h3 className="text-2xl font-bold">{totalGrandsDeplacement}</h3>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Car className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Paniers repas
                </p>
                <h3 className="text-2xl font-bold">{totalPaniersRepas}</h3>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <Coffee className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Événements par collaborateur</CardTitle>
            <CardDescription>
              Top 10 des collaborateurs avec le plus d'événements planifiés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={eventsByCollaborateur}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <ChartLegend />
                  <Bar dataKey="events" name="Événements">
                    {eventsByCollaborateur.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Types d'événements</CardTitle>
            <CardDescription>
              Répartition des différents types d'événements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {eventTypes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <ChartLegend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Zones de trajet</CardTitle>
            <CardDescription>
              Répartition des événements par zone de trajet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {zoneTrajetChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={zoneTrajetChart}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <ChartLegend />
                    <Bar dataKey="value" name="Événements" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Statistiques par entreprise</CardTitle>
            <CardDescription>
              Répartition des événements par entreprise (30 derniers jours)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={eventsByEnterprise}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <ChartLegend />
                  <Bar dataKey="events" name="Événements" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Statistiques détaillées</CardTitle>
            <CardDescription>
              Récapitulatif des indicateurs clés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Collaborateurs
                  </p>
                  <p className="text-lg font-semibold">{totalCollaborateurs}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Lieux de chantier
                  </p>
                  <p className="text-lg font-semibold">
                    {new Set(filteredEvents.map((e) => e.lieuChantier)).size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Home className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    PRGD
                  </p>
                  <p className="text-lg font-semibold">
                    {String(totalPRGD || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Moyenne d'heures supp.
                  </p>
                  <p className="text-lg font-semibold">
                    {totalEvents > 0
                      ? (totalHeuresSupp / totalEvents).toFixed(1)
                      : 0}
                    h / événement
                  </p>
                </div>
              </div>
              {selectedEnterprise && (
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <Building className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Entreprise
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedEnterprise}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
