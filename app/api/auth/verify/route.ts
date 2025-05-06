import { verifyToken } from "@/lib/auth-utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Extraire le token du header Authorization
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token manquant ou invalide" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Enlever "Bearer " du début

    // Vérifier le token
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // Retourner les informations d'utilisateur extraites du token
    // Note: pour les informations plus détaillées comme collaborateur_id et collaborateurs_geres,
    // ces informations ne sont pas dans le token pour des raisons de sécurité,
    // mais sont stockées séparément côté client
    return NextResponse.json({
      userId: payload.userId,
      role: payload.role,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
