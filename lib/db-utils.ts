import { getSupabaseClient } from "./supabase"

export async function checkDatabaseSetup() {
  const supabase = getSupabaseClient()

  try {
    // Vérifier si les tables existent
    const tables = ["collaborateurs", "utilisateurs", "evenements"]
    const results = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase.from(table).select("count()", { count: "exact", head: true })
        return { table, exists: !error }
      }),
    )

    const missingTables = results.filter((r) => !r.exists).map((r) => r.table)

    return {
      isSetup: missingTables.length === 0,
      missingTables,
      existingTables: results.filter((r) => r.exists).map((r) => r.table),
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de la base de données:", error)
    return {
      isSetup: false,
      missingTables: tables,
      existingTables: [],
      error,
    }
  }
}
