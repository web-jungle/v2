"use client";

import { useAuthToken } from "@/hooks/useAuthToken";
import type { Evenement, Role, SessionUtilisateur } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: SessionUtilisateur | null;
  login: (identifiant: string, motDePasse: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  globalEvents: Evenement[];
  updateEvents: (events: Evenement[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUtilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalEvents, setGlobalEvents] = useState<Evenement[]>([]);
  const router = useRouter();
  const {
    isAuthenticated,
    userId,
    role,
    login: tokenLogin,
    logout: tokenLogout,
  } = useAuthToken();

  // Synchroniser user avec les données d'authentification du token
  useEffect(() => {
    if (isAuthenticated && userId) {
      // Créer un objet user compatible avec l'interface attendue
      const tokenUser: SessionUtilisateur = {
        id: userId,
        role: (role as Role) || "collaborateur",
        nom: `Utilisateur #${userId}`,
        identifiant: `user_${userId}`,
        collaborateur_id: userId,
        collaborateurs_geres: [],
      };
      setUser(tokenUser);
      setIsLoading(false);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, role]);

  // Charger les événements lorsque l'utilisateur est authentifié
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  const loadEvents = async () => {
    try {
      const response = await fetch("/api/evenements");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des événements");
      }

      const events = await response.json();

      // Convertir les dates string en objets Date
      const formattedEvents = events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setGlobalEvents(formattedEvents);
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
    }
  };

  const login = async (
    identifiant: string,
    motDePasse: string
  ): Promise<boolean> => {
    try {
      // Utiliser le login du nouveau système
      const success = await tokenLogin(identifiant, motDePasse);

      if (success) {
        // Les données utilisateur sont déjà mises à jour via l'effet ci-dessus
        // Charger les événements
        await loadEvents();
      }

      return success;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return false;
    }
  };

  const updateEvents = async (events: Evenement[]) => {
    setGlobalEvents(events);
  };

  const logout = () => {
    // Utiliser le logout du nouveau système
    tokenLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, globalEvents, updateEvents }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
}
