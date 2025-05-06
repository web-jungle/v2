"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type AuthState = {
  isAuthenticated: boolean;
  userId: string | null;
  role: string | null;
  collaborateurId: string | null;
  collaborateursGeres: string[];
  isLoading: boolean;
};

/**
 * Hook personnalisé pour gérer l'authentification par token
 */
export function useAuthToken() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    role: null,
    collaborateurId: null,
    collaborateursGeres: [],
    isLoading: true,
  });
  const router = useRouter();

  // Vérifie le token au chargement
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Vérifier d'abord le localStorage, puis le cookie comme fallback
        const token =
          localStorage.getItem("auth_token") || Cookies.get("auth_token");

        if (!token) {
          setAuthState({
            isAuthenticated: false,
            userId: null,
            role: null,
            collaborateurId: null,
            collaborateursGeres: [],
            isLoading: false,
          });
          return;
        }

        // Vérifier le token côté serveur
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Récupérer les informations stockées associées au token
          const userInfo = JSON.parse(
            localStorage.getItem("user_info") || "{}"
          );

          setAuthState({
            isAuthenticated: true,
            userId: data.userId,
            role: data.role,
            collaborateurId: userInfo.collaborateur_id || null,
            collaborateursGeres: userInfo.collaborateurs_geres || [],
            isLoading: false,
          });
        } else {
          // Token invalide, supprimer du localStorage et des cookies
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_info");
          Cookies.remove("auth_token");
          setAuthState({
            isAuthenticated: false,
            userId: null,
            role: null,
            collaborateurId: null,
            collaborateursGeres: [],
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        setAuthState({
          isAuthenticated: false,
          userId: null,
          role: null,
          collaborateurId: null,
          collaborateursGeres: [],
          isLoading: false,
        });
      }
    };

    checkToken();
  }, []);

  // Fonction de connexion
  const login = async (
    identifiant: string,
    motDePasse: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifiant, motDePasse }),
      });

      if (!response.ok) {
        return false;
      }

      const { token, userId, role, collaborateur_id, collaborateurs_geres } =
        await response.json();

      // Stocker le token dans localStorage
      localStorage.setItem("auth_token", token);

      // Stocker le token dans un cookie
      Cookies.set("auth_token", token, {
        expires: 8 / 24, // 8 heures (le même que JWT_EXPIRATION)
        path: "/",
        secure: window.location.protocol === "https:",
      });

      // Stocker les informations utilisateur associées au token
      localStorage.setItem(
        "user_info",
        JSON.stringify({
          collaborateur_id,
          collaborateurs_geres,
        })
      );

      // Mettre à jour l'état d'authentification
      setAuthState({
        isAuthenticated: true,
        userId,
        role,
        collaborateurId: collaborateur_id,
        collaborateursGeres: collaborateurs_geres || [],
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    Cookies.remove("auth_token");

    setAuthState({
      isAuthenticated: false,
      userId: null,
      role: null,
      collaborateurId: null,
      collaborateursGeres: [],
      isLoading: false,
    });
    router.push("/login");
  };

  // Récupérer le token
  const getToken = (): string | null => {
    return (
      localStorage.getItem("auth_token") || Cookies.get("auth_token") || null
    );
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (requiredRole: string | string[]): boolean => {
    if (!authState.isAuthenticated || !authState.role) {
      return false;
    }

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(authState.role);
    }

    return authState.role === requiredRole;
  };

  return {
    ...authState,
    login,
    logout,
    getToken,
    hasRole,
  };
}
