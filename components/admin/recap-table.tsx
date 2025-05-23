"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Collaborateur, Evenement } from "@/lib/types";
import { useMemo } from "react";

interface RecapTableProps {
  events: Evenement[];
  collaborateurs: Collaborateur[];
  selectedCollaborateur: string | null;
  month: number;
  year: number;
}

export default function RecapTable({
  events,
  collaborateurs,
  selectedCollaborateur,
  month,
  year,
}: RecapTableProps) {
  // Filtrer les collaborateurs si un collaborateur spécifique est sélectionné
  const filteredCollaborateurs = useMemo(() => {
    if (selectedCollaborateur) {
      return collaborateurs.filter((c) => c.id === selectedCollaborateur);
    }
    return collaborateurs;
  }, [collaborateurs, selectedCollaborateur]);

  // Modifier la fonction pour calculer les statistiques avec la nouvelle logique de zones
  // et ajouter le comptage des tickets restaurant

  // Dans la fonction useMemo qui calcule collaborateurStats
  const collaborateurStats = useMemo(() => {
    return filteredCollaborateurs.map((collaborateur) => {
      // Filtrer les événements pour ce collaborateur
      const collaborateurEvents = events.filter(
        (event) => event.collaborateurId === collaborateur.id
      );

      // Initialiser les compteurs
      const heuresSupp = collaborateurEvents.reduce(
        (sum, event) => sum + (event.heuresSupplementaires || 0),
        0
      );
      const panierRepas = collaborateurEvents.filter(
        (event) => event.panierRepas
      ).length;
      const ticketRestaurant = collaborateurEvents.filter(
        (event) => event.ticketRestaurant
      ).length;

      // Compteurs pour chaque zone de trajet avec la nouvelle logique
      const zones: Record<string, number> = {
        "1A": 0,
        "1B": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
      };

      // Utiliser les données de décomposition déjà calculées par l'API
      collaborateurEvents.forEach((event) => {
        if (event.decomposedZone) {
          // Ajouter les zones décomposées
          if (event.decomposedZone.zone5 > 0) {
            zones["5"] += event.decomposedZone.zone5;
          }

          if (event.decomposedZone.zoneAutre) {
            // Extraire le numéro de zone
            const zoneKey = event.decomposedZone.zoneAutre.replace("zone ", "");
            if (zoneKey in zones) {
              zones[zoneKey] += event.decomposedZone.quantiteZoneAutre;
            }
          }
        } else if (event.zoneTrajet) {
          // Fallback pour les événements sans décomposition
          const zone = event.zoneTrajet;
          if (zone in zones) {
            zones[zone]++;
          }
        }
      });

      // Compteurs pour GD et PRGD
      const grandDeplacement = collaborateurEvents.filter(
        (event) => event.grandDeplacement
      ).length;
      const prgd = collaborateurEvents.filter((event) => event.prgd).length;

      // Compteur pour les absences
      const absences = collaborateurEvents.filter(
        (event) => event.typeEvenement === "absence"
      );
      const absencesByType: Record<string, number> = {};

      absences.forEach((absence) => {
        if (absence.typeAbsence) {
          absencesByType[absence.typeAbsence] =
            (absencesByType[absence.typeAbsence] || 0) + 1;
        }
      });

      return {
        collaborateur,
        heuresSupp,
        panierRepas,
        ticketRestaurant,
        zones,
        grandDeplacement,
        prgd,
        absences: absencesByType,
        totalEvents: collaborateurEvents.length,
      };
    });
  }, [filteredCollaborateurs, events]);

  // Obtenir le nom du mois
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Récapitulatif par collaborateur</CardTitle>
        <CardDescription>
          Données pour {monthNames[month]} {year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            {/* Modifier le tableau pour afficher les tickets restaurant et supprimer la colonne Nombre PRGD */}
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Collaborateur</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Heures Supp.</TableHead>
                <TableHead>Paniers Repas</TableHead>
                <TableHead>Tickets Restaurant</TableHead>
                <TableHead>Zone 1A</TableHead>
                <TableHead>Zone 1B</TableHead>
                <TableHead>Zone 2</TableHead>
                <TableHead>Zone 3</TableHead>
                <TableHead>Zone 4</TableHead>
                <TableHead>Zone 5</TableHead>
                <TableHead>GD</TableHead>
                <TableHead>PRGD</TableHead>
                <TableHead>Absences</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborateurStats.length > 0 ? (
                collaborateurStats.map((stat) => (
                  <TableRow key={stat.collaborateur.id}>
                    <TableCell className="font-medium">
                      {stat.collaborateur.nom}
                    </TableCell>
                    <TableCell>{stat.collaborateur.entreprise}</TableCell>
                    <TableCell>{stat.heuresSupp}h</TableCell>
                    <TableCell>{stat.panierRepas}</TableCell>
                    <TableCell>{stat.ticketRestaurant}</TableCell>
                    <TableCell>{stat.zones["1A"] || 0}</TableCell>
                    <TableCell>{stat.zones["1B"] || 0}</TableCell>
                    <TableCell>{stat.zones["2"] || 0}</TableCell>
                    <TableCell>{stat.zones["3"] || 0}</TableCell>
                    <TableCell>{stat.zones["4"] || 0}</TableCell>
                    <TableCell>{stat.zones["5"] || 0}</TableCell>
                    <TableCell>{stat.grandDeplacement}</TableCell>
                    <TableCell>{stat.prgd}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {Object.entries(stat.absences).map(([type, count]) => (
                          <Badge
                            key={type}
                            variant="outline"
                            className="text-xs"
                          >
                            {type}: {count}
                          </Badge>
                        ))}
                        {Object.keys(stat.absences).length === 0 && "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={14}
                    className="text-center py-4 text-muted-foreground"
                  >
                    Aucune donnée disponible pour cette période
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
