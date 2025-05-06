import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken } from "./auth-utils";
import { prisma } from "./prisma";

export type ServerSession = {
  isAuthenticated: boolean;
  userId: string | null;
  role: string | null;
  collaborateurId: string | null;
  collaborateursGeres: string[];
};

/**
 * Vérifie l'authentification pour les Server Components de Next.js
 */
export async function getServerSession(): Promise<ServerSession> {
  // Session par défaut non authentifiée
  const defaultSession: ServerSession = {
    isAuthenticated: false,
    userId: null,
    role: null,
    collaborateurId: null,
    collaborateursGeres: [],
  };

  try {
    // Récupérer le token depuis les cookies
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return defaultSession;
    }

    // Vérifier le token
    const payload = await verifyToken(token);
    if (!payload) {
      return defaultSession;
    }

    // Récupérer les informations associées à l'utilisateur depuis la base de données
    const user = await prisma.compte.findUnique({
      where: { id: payload.userId },
      include: {
        collaborateursGeres: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return defaultSession;
    }

    // Retourner la session avec les données utilisateur
    return {
      isAuthenticated: true,
      userId: user.id,
      role: user.role,
      collaborateurId: user.collaborateurId,
      collaborateursGeres: user.collaborateursGeres.map((c) => c.id),
    };
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de la session côté serveur:",
      error
    );
    return defaultSession;
  }
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export function hasRole(
  session: ServerSession,
  requiredRole: string | string[]
): boolean {
  if (!session.isAuthenticated || !session.role) {
    return false;
  }

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(session.role);
  }

  return session.role === requiredRole;
}

/**
 * Récupère le token JWT depuis les cookies ou les headers d'une requête
 * Utile pour les Route Handlers
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Récupérer depuis les cookies
  const token = request.cookies.get("auth_token")?.value;
  if (token) return token;

  // Récupérer depuis les headers Authorization
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Vérifie l'authentification pour les API Routes
 */
export async function verifyRequestAuth(
  request: NextRequest
): Promise<ServerSession> {
  const defaultSession: ServerSession = {
    isAuthenticated: false,
    userId: null,
    role: null,
    collaborateurId: null,
    collaborateursGeres: [],
  };

  try {
    const token = getTokenFromRequest(request);
    if (!token) return defaultSession;

    const payload = await verifyToken(token);
    if (!payload) return defaultSession;

    const user = await prisma.compte.findUnique({
      where: { id: payload.userId },
      include: {
        collaborateursGeres: {
          select: { id: true },
        },
      },
    });

    if (!user) return defaultSession;

    return {
      isAuthenticated: true,
      userId: user.id,
      role: user.role,
      collaborateurId: user.collaborateurId,
      collaborateursGeres: user.collaborateursGeres.map((c) => c.id),
    };
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error
    );
    return defaultSession;
  }
}
