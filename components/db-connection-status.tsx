"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Database } from "lucide-react"
import Link from "next/link"

export default function DbConnectionStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from("collaborateurs").select("count()", { count: "exact", head: true })
        
        if (error) {
          setStatus("error")
          setErrorMessage(error.message)
        } else {
          setStatus("connected")
          setErrorMessage(null)
        }
      } catch (err) {
        setStatus("error")
        setErrorMessage(err instanceof Error ? err.message : "Erreur de connexion")
      }
    }

    checkConnection()
    
    // Vérifier la connexion toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [supabase])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/diagnostic/planning">
            <Badge 
              variant={status === "connected" ? "outline" : "destructive"}
              className="cursor-pointer flex items-center gap-1"
            >
              <Database className="h-3 w-3" />
              {status === "checking"

\
Créons un service de synchronisation pour le planning et les collaborateurs :
