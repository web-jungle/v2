"use client";

export const runtime = "nodejs";

export default function HomePage() {
  // Page de chargement pendant la vérification de l'authentification
  return (
    <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
        <p className="text-muted-foreground">
          Veuillez patienter pendant la vérification de votre session.
        </p>
      </div>
    </div>
  );
}
