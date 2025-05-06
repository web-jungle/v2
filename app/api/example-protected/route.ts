import { hasRole, verifyRequestAuth } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

// Route API protégée qui vérifie l'authentification
export async function GET(request: NextRequest) {
  // Vérifier l'authentification
  const session = await verifyRequestAuth(request);

  // Vérifier si l'utilisateur est authentifié
  if (!session.isAuthenticated) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  // Exemple de vérification de rôle
  if (!hasRole(session, ["admin", "manager"])) {
    return NextResponse.json(
      { error: "Vous n'avez pas les droits nécessaires" },
      { status: 403 }
    );
  }

  // Retourner les données protégées
  return NextResponse.json({
    message: "Accès autorisé",
    user: {
      id: session.userId,
      role: session.role,
      collaborateurId: session.collaborateurId,
    },
    timestamp: new Date().toISOString(),
  });
}
