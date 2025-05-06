import { verifyToken } from "@/lib/auth-utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
  "/login",
  "/api/auth",
  "/api/admin/hash-passwords", // Route pour hasher les mots de passe ajoutée aux routes publiques
];

// Cette fonction est exécutée avant chaque requête
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Si la route est publique, on laisse passer
  if (publicRoutes.some((route) => path === route || path.startsWith(route))) {
    return NextResponse.next();
  }

  // Si la route est l'API de vérification du token, on laisse passer
  if (path === "/api/auth/verify") {
    return NextResponse.next();
  }

  // Récupérer le token depuis les cookies ou les headers Authorization
  const token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("Authorization")?.substring(7); // Enlever "Bearer "

  if (!token) {
    // Si la requête attend une réponse JSON (API)
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    // Sinon, rediriger vers la page de connexion
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "redirect",
      encodeURIComponent(request.nextUrl.pathname)
    );
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Vérifier le token
    const payload = await verifyToken(token);

    if (!payload) {
      // Si le token est invalide
      if (path.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Token invalide ou expiré" },
          { status: 401 }
        );
      }

      // Rediriger vers la page de connexion
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Token valide, on continue
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);

    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Erreur lors de l'authentification" },
        { status: 500 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    // Toutes les routes sauf les ressources statiques et les routes publiques explicites
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
