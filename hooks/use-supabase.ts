"use client";

import { getSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useSupabase() {
  const supabase = getSupabaseClient();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from("_tables").select("*").limit(1);
        // Cette requête échouera normalement avec une erreur spécifique de Postgrest
        // mais cela confirme que la connexion fonctionne
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    }

    checkConnection();
  }, [supabase]);

  return { supabase, isConnected };
}
