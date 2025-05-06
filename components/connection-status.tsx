"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Database } from "lucide-react";
import { useEffect, useState } from "react";

export function ConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">(
    "loading"
  );

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Simple appel à une API interne pour vérifier la connexion
        const response = await fetch("/api/health-check", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          setStatus("online");
        } else {
          setStatus("offline");
        }
      } catch (error) {
        setStatus("offline");
      }
    };

    checkApiStatus();

    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") {
    return (
      <Badge variant="outline" className="gap-1">
        <Database className="h-3 w-3 animate-pulse" />
        <span>Vérification...</span>
      </Badge>
    );
  }

  if (status === "online") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 hover:bg-green-100 gap-1 cursor-help"
            >
              <Database className="h-3 w-3" />
              <span>Connecté</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>API accessible</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 hover:bg-red-100 gap-1 cursor-help"
          >
            <AlertCircle className="h-3 w-3" />
            <span>Non connecté</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Problème de connexion API</p>
          <p className="text-xs mt-1">Vérifiez la page de diagnostic</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
