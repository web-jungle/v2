import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Vérifier si les variables d'environnement sont définies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pawzsbzcprgjqzzagvqj.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhd3pzYnpjcHJnanF6emFndnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDkwNDQsImV4cCI6MjA2MTQyNTA0NH0.J8xEIRPuBuxbiMqvPnfJolVI6SnS7-jJKqAv8KaAo2w"

// Créer un client Supabase côté client (singleton)
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Créer un client Supabase côté serveur
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)
}
