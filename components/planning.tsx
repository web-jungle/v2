"use client";

import { Role } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PlanningProps {
  userRole: Role;
  userCollaborateurId?: string;
  user?: any;
}

// Ce composant a été remplacé par planning-alternative.tsx
// On conserve l'interface pour maintenir la compatibilité mais on redirige
export default function Planning({
  userRole,
  userCollaborateurId,
  user,
}: PlanningProps) {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la nouvelle page de planning-alternative
    router.push("/planning-alternative");
  }, [router]);

  // Afficher un message de chargement pendant la redirection
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirection vers le planning...</p>
      </div>
    </div>
  );
}
