import { getServerSession, hasRole } from "@/lib/auth-server";
import { redirect } from "next/navigation";

// Page serveur qui utilise l'authentification côté serveur
export default async function ExampleServerPage() {
  // Récupérer la session utilisateur
  const session = await getServerSession();

  // Rediriger si l'utilisateur n'est pas authentifié
  if (!session.isAuthenticated) {
    redirect("/login");
  }

  // Vérifier si l'utilisateur a le rôle requis
  const isAdmin = hasRole(session, "admin");
  const isManagerOrAdmin = hasRole(session, ["manager", "admin"]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Page Serveur Sécurisée</h1>

      <div className="bg-muted p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Informations de session</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">ID utilisateur:</span>{" "}
            {session.userId}
          </p>
          <p>
            <span className="font-medium">Rôle:</span> {session.role}
          </p>
          <p>
            <span className="font-medium">ID collaborateur:</span>{" "}
            {session.collaborateurId || "Aucun"}
          </p>
          <p>
            <span className="font-medium">Collaborateurs gérés:</span>{" "}
            {session.collaborateursGeres.length > 0
              ? session.collaborateursGeres.join(", ")
              : "Aucun"}
          </p>
        </div>
      </div>

      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Autorisations</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Est administrateur:</span>{" "}
            <span className={isAdmin ? "text-green-600" : "text-red-600"}>
              {isAdmin ? "Oui" : "Non"}
            </span>
          </p>
          <p>
            <span className="font-medium">Est manager ou administrateur:</span>{" "}
            <span
              className={isManagerOrAdmin ? "text-green-600" : "text-red-600"}
            >
              {isManagerOrAdmin ? "Oui" : "Non"}
            </span>
          </p>
        </div>
      </div>

      {session.role === "admin" && (
        <div className="mt-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
          <h3 className="font-semibold text-yellow-800">Zone Admin</h3>
          <p className="text-yellow-800">
            Ce contenu n'est visible que par les administrateurs.
          </p>
        </div>
      )}
    </div>
  );
}
