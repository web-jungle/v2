export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      collaborateurs: {
        Row: {
          id: string
          nom: string
          couleur: string
          entreprise: string
          created_at: string
        }
        Insert: {
          id?: string
          nom: string
          couleur: string
          entreprise: string
          created_at?: string
        }
        Update: {
          id?: string
          nom?: string
          couleur?: string
          entreprise?: string
          created_at?: string
        }
      }
      utilisateurs: {
        Row: {
          id: string
          identifiant: string
          mot_de_passe: string
          nom: string
          role: "admin" | "manager" | "collaborateur"
          collaborateur_id?: string
          collaborateurs_geres?: string[]
          created_at: string
        }
        Insert: {
          id?: string
          identifiant: string
          mot_de_passe: string
          nom: string
          role: "admin" | "manager" | "collaborateur"
          collaborateur_id?: string
          collaborateurs_geres?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          identifiant?: string
          mot_de_passe?: string
          nom?: string
          role?: "admin" | "manager" | "collaborateur"
          collaborateur_id?: string
          collaborateurs_geres?: string[]
          created_at?: string
        }
      }
      evenements: {
        Row: {
          id: string
          title: string
          start: string
          end: string
          collaborateur_id: string
          type_evenement: string
          lieu_chantier?: string
          zone_trajet?: string
          panier_repas: boolean
          ticket_restaurant: boolean
          heures_supplementaires: number
          grand_deplacement: boolean
          prgd: boolean
          nombre_prgd: number
          type_absence?: string
          verrouille: boolean
          latitude?: number
          longitude?: number
          adresse_complete?: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          start: string
          end: string
          collaborateur_id: string
          type_evenement: string
          lieu_chantier?: string
          zone_trajet?: string
          panier_repas?: boolean
          ticket_restaurant?: boolean
          heures_supplementaires?: number
          grand_deplacement?: boolean
          prgd?: boolean
          nombre_prgd?: number
          type_absence?: string
          verrouille?: boolean
          latitude?: number
          longitude?: number
          adresse_complete?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          start?: string
          end?: string
          collaborateur_id?: string
          type_evenement?: string
          lieu_chantier?: string
          zone_trajet?: string
          panier_repas?: boolean
          ticket_restaurant?: boolean
          heures_supplementaires?: number
          grand_deplacement?: boolean
          prgd?: boolean
          nombre_prgd?: number
          type_absence?: string
          verrouille?: boolean
          latitude?: number
          longitude?: number
          adresse_complete?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
