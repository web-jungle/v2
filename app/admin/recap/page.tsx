"use client";

import ExportRecapExcel from "@/components/admin/export-recap-excel";
import RecapTable from "@/components/admin/recap-table";
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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RecapPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedEnterprise, setSelectedEnterprise] = useState<string | null>(
    null
  );
  const [selectedCollaborateur, setSelectedCollaborateur] = useState<
    string | null
  >(null);

  // États pour stocker les données de l'API
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [evenements, setEvenements] = useState<any[]>([]);
  const [entreprises, setEntreprises] = useState<string[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "admin") {
      router.push("/");
      toast({
        title: "Accès refusé",
        description: "Cette page est réservée aux administrateurs.",
        variant: "destructive",
      });
    }
  }, [user, isLoading, router, toast]);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== "admin") return;

      setIsDataLoading(true);
      try {
        // Construire l'URL avec les paramètres de filtre
        const params = new URLSearchParams({
          month: selectedMonth.toString(),
          year: selectedYear.toString(),
        });

        if (selectedEnterprise) {
          params.append("entreprise", selectedEnterprise);
        }

        if (selectedCollaborateur) {
          params.append("collaborateurId", selectedCollaborateur);
        }

        const response = await fetch(`/api/admin/recap?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const data = await response.json();

        // Mettre à jour les états avec les données
        setCollaborateurs(data.collaborateurs);
        setEvenements(data.evenements);
        setEntreprises(data.entreprises);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          title: "Erreur",
          description:
            "Impossible de charger les données. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [
    user,
    selectedMonth,
    selectedYear,
    selectedEnterprise,
    selectedCollaborateur,
    toast,
  ]);

  // Générer les options pour les mois
  const monthOptions = [
    { value: 0, label: "Janvier" },
    { value: 1, label: "Février" },
    { value: 2, label: "Mars" },
    { value: 3, label: "Avril" },
    { value: 4, label: "Mai" },
    { value: 5, label: "Juin" },
    { value: 6, label: "Juillet" },
    { value: 7, label: "Août" },
    { value: 8, label: "Septembre" },
    { value: 9, label: "Octobre" },
    { value: 10, label: "Novembre" },
    { value: 11, label: "Décembre" },
  ];

  // Générer les options pour les années (année courante et les 2 précédentes)
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: currentYear, label: currentYear.toString() },
    { value: currentYear - 1, label: (currentYear - 1).toString() },
    { value: currentYear - 2, label: (currentYear - 2).toString() },
  ];

  // Filtrer les collaborateurs selon l'entreprise sélectionnée
  const filteredCollaborateurs = selectedEnterprise
    ? collaborateurs.filter((c) => c.entreprise === selectedEnterprise)
    : collaborateurs;

  if (isLoading || !user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Récapitulatif Administratif</h1>
        <ExportRecapExcel
          events={evenements}
          collaborateurs={filteredCollaborateurs}
          selectedCollaborateur={selectedCollaborateur}
          selectedEnterprise={selectedEnterprise}
          month={selectedMonth}
          year={selectedYear}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Sélectionnez les critères pour affiner le récapitulatif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Mois</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) =>
                  setSelectedMonth(Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner un mois" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Année</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) =>
                  setSelectedYear(Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner une année" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year.value} value={year.value.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Entreprise</label>
              <Select
                value={selectedEnterprise || "all"}
                onValueChange={(value) => {
                  setSelectedEnterprise(value === "all" ? null : value);
                  setSelectedCollaborateur(null); // Réinitialiser le collaborateur sélectionné
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les entreprises" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les entreprises</SelectItem>
                  {entreprises.map((entreprise) => (
                    <SelectItem
                      key={entreprise}
                      value={entreprise || `entreprise-${Date.now()}`}
                    >
                      {entreprise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Collaborateur</label>
              <Select
                value={selectedCollaborateur || "all"}
                onValueChange={(value) =>
                  setSelectedCollaborateur(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Tous les collaborateurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les collaborateurs</SelectItem>
                  {filteredCollaborateurs.map((collaborateur) => (
                    <SelectItem
                      key={collaborateur.id}
                      value={collaborateur.id || `collab-${Date.now()}`}
                    >
                      {collaborateur.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isDataLoading ? (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Chargement des données...
          </span>
        </div>
      ) : (
        <RecapTable
          events={evenements}
          collaborateurs={filteredCollaborateurs}
          selectedCollaborateur={selectedCollaborateur}
          month={selectedMonth}
          year={selectedYear}
        />
      )}
    </div>
  );
}
