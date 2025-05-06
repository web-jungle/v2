import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cette fonction peut être marquée comme `async` si elle utilise `await`
export function middleware(request: NextRequest) {
  // Nous ne pouvons pas utiliser le contexte d'authentification ici car c'est côté serveur
  // Nous devons donc vérifier le cookie directement

  const path = request.nextUrl.pathname

  // Définir les chemins publics (accessibles sans authentification)
  const isPublicPath = path === "/login"

  // Vérifier si l'utilisateur est connecté via les cookies
  // Note: Dans cette implémentation, nous utilisons localStorage et non des cookies
  // Donc ce middleware ne fonctionnera pas correctement
  // Pour l'instant, nous allons le désactiver

  return NextResponse.next()
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [], // Désactivé pour l'instant
  // matcher: ["/", "/login", "/admin/:path*", "/gestion/:path*"],
}
