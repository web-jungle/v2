"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  CalendarIcon,
  Users,
  Settings,
  LogOut,
  LayoutDashboard,
  Home,
  UserCircle,
  Truck,
  UserCog,
  Menu,
  X,
} from "lucide-react"
import Image from "next/image"
import LoadingSpinner from "./loading-spinner"
import Notifications from "./notifications"
import { useTheme } from "next-themes"

export default function Navigation() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme } = useTheme()

  // Ne pas afficher la navigation si l'utilisateur n'est pas connecté
  if (!user) return null

  // Ne pas afficher la navigation sur la page de connexion
  if (pathname === "/login") return null

  const isCRM = pathname.startsWith("/crm")
  const isRH = pathname.startsWith("/rh")
  const isLogistique = pathname.startsWith("/logistique")

  // Gérer la navigation avec un état de chargement
  const handleNavigation = (path: string) => {
    if (pathname !== path) {
      setIsNavigating(true)
      setNavigatingTo(path)
      router.push(path)
      setIsMobileMenuOpen(false)

      // Réinitialiser l'état après un délai
      setTimeout(() => {
        setIsNavigating(false)
        setNavigatingTo(null)
      }, 1000)
    }
  }

  const navItems = [
    {
      name: "Accueil",
      path: "/home",
      icon: <Home className="h-5 w-5" />,
      isActive: pathname === "/home",
      showFor: ["admin", "manager", "user"],
    },
    {
      name: "Planning",
      path: "/planning",
      icon: <CalendarIcon className="h-5 w-5" />,
      isActive: pathname === "/planning",
      showFor: ["admin", "manager", "user"],
    },
    {
      name: "CRM",
      path: "/crm",
      icon: <UserCircle className="h-5 w-5" />,
      isActive: isCRM,
      showFor: ["admin", "manager", "user"],
    },
    {
      name: "RH",
      path: "/rh",
      icon: <UserCog className="h-5 w-5" />,
      isActive: isRH,
      showFor: ["admin", "manager", "user"],
    },
    {
      name: "Logistique",
      path: "/logistique",
      icon: <Truck className="h-5 w-5" />,
      isActive: isLogistique,
      showFor: ["admin", "manager", "user"],
    },
    {
      name: "Tableau de bord",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      isActive: pathname === "/dashboard",
      showFor: ["admin", "manager"],
    },
    {
      name: "Collaborateurs",
      path: "/collaborateurs",
      icon: <Users className="h-5 w-5" />,
      isActive: pathname === "/collaborateurs",
      showFor: ["admin", "manager"],
    },
    {
      name: "Administration",
      path: "/admin",
      icon: <Settings className="h-5 w-5" />,
      isActive: pathname === "/admin",
      showFor: ["admin"],
    },
  ]

  const filteredNavItems = navItems.filter((item) => item.showFor.includes(user.role))

  return (
    <>
      {/* Bouton de menu mobile */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation latérale */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r shadow-sm transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* En-tête avec logo, titre et notifications */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image src="/images/logo.png" alt="ORIZON GROUP" fill className="object-contain" />
                </div>
                <div className="font-bold text-xl">
                  {isCRM ? "CRM" : isRH ? "RH" : isLogistique ? "Logistique" : "Planning"}
                </div>
              </div>
              <Notifications />
            </div>
          </div>

          {/* Items de navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="space-y-2 px-3">
              {filteredNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    item.isActive ? "bg-primary/10 text-primary" : "hover:bg-muted hover:text-primary"
                  }`}
                >
                  <div className="flex items-center justify-center w-6">{item.icon}</div>
                  <span>{item.name}</span>
                  {isNavigating && navigatingTo === item.path && <LoadingSpinner size="sm" message="" />}
                </button>
              ))}
            </div>
          </nav>

          {/* Profil utilisateur et déconnexion */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium truncate">{user.nom}</div>
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              {user.role === "admin" ? "Administrateur" : user.role === "manager" ? "Manager" : "Collaborateur"}
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu sur mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}
