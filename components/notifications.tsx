"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { notificationsInitiales } from "@/lib/conges-data"
import type { Notification } from "@/lib/conges-types"

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Filtrer les notifications pour l'utilisateur connecté
      const userNotifications = notificationsInitiales.filter((notification) => notification.utilisateurId === user.id)
      setNotifications(userNotifications)

      // Compter les notifications non lues
      const unread = userNotifications.filter((notification) => !notification.lue).length
      setUnreadCount(unread)
    }
  }, [user])

  const handleNotificationClick = (notification: Notification) => {
    // Marquer la notification comme lue
    const updatedNotifications = notifications.map((n) => (n.id === notification.id ? { ...n, lue: true } : n))
    setNotifications(updatedNotifications)

    // Mettre à jour le compteur
    setUnreadCount(updatedNotifications.filter((n) => !n.lue).length)

    // Fermer le menu
    setIsOpen(false)

    // Si la notification concerne une demande de congé, stocker l'ID dans le localStorage
    if (notification.type === "conge" && notification.demandeId) {
      localStorage.setItem("selectedDemandeId", notification.demandeId)
    }

    // Naviguer vers le lien
    router.push(notification.lien)
  }

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest(".notifications-container")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative notifications-container">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-auto left-full ml-2 top-0 w-80 z-50 p-2 shadow-lg">
          <div className="font-medium p-2 border-b">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 cursor-pointer hover:bg-muted ${!notification.lue ? "bg-muted/50" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${!notification.lue ? "bg-blue-500" : "bg-gray-300"}`}
                      ></div>
                      <div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.dateCreation).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">Aucune notification</div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
