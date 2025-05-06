"use client";

import Planning from "@/components/planning-alternative";

export default function PlanningPage() {
  // État de chargement amélioré

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Planning des Collaborateurs</h1>
      <Planning />
    </div>
  );
}
