"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { SessionUtilisateur, Evenement } from "@/lib/types"

interface AuthContextType {
  user: SessionUtilisateur | null
  login: (identifiant: string, motDePasse: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  globalEvents: Evenement[]
  updateEvents: (events: Evenement[]) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUtilisateur | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [globalEvents, setGlobalEvents] = useState<Evenement[]>([])
  const router = useRouter()

  // Vérifier s'il y a un utilisateur en session au chargement
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Charger les événements
          await loadEvents()
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }

    // Exécuter uniquement côté client
    if (typeof window !== "undefined") {
      checkUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadEvents = async () => {
    try {
      const response = await fetch("/api/evenements")
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des événements")
      }

      const events = await response.json()

      // Convertir les dates string en objets Date
      const formattedEvents = events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))

      setGlobalEvents(formattedEvents)
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error)
    }
  }

  const login = async (identifiant: string, motDePasse: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifiant, motDePasse }),
      })

      if (!response.ok) {
        return false
      }

      const userData = await response.json()

      // Stocker l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      // Charger les événements
      await loadEvents()

      return true
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      return false
    }
  }

  const updateEvents = async (events: Evenement[]) => {
    setGlobalEvents(events)
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, globalEvents, updateEvents }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}
