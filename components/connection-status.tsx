"use client"

import { useSupabase } from "@/hooks/use-supabase"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Database, AlertCircle } from "lucide-react"

export function ConnectionStatus() {
  const { isConnected } = useSupabase()

  if (isConnected === null) {
    return (
      <Badge variant="outline" className="gap-1">
        <Database className="h-3 w-3 animate-pulse" />
        <span>Vérification...</span>
      </Badge>
    )
  }

  if (isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 gap-1 cursor-help">
              <Database className="h-3 w-3" />
              <span>Connecté</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connexion à Supabase établie</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 gap-1 cursor-help">
            <AlertCircle className="h-3 w-3" />
            <span>Non connecté</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Problème de connexion à Supabase</p>
          <p className="text-xs mt-1">Vérifiez la page de diagnostic</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
