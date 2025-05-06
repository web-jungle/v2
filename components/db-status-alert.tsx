"use client"

import { useState, useEffect } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Database } from "lucide-react"
import { checkDatabaseSetup } from "@/lib/db-utils"
import { useRouter } from "next/navigation"

export function DbStatusAlert() {
  const [dbStatus, setDbStatus] = useState<{
    isSetup: boolean
    missingTables: string[]
    existingTables: string[]
    error?: any
  } | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkDb = async () => {
      setIsChecking(true)
      const status = await checkDatabaseSetup()
      setDbStatus(status)
      setIsChecking(false)
    }

    checkDb()
  }, [])

  if (isChecking || dbStatus?.isSetup) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuration de la base de données requise</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          La base de données n'est pas correctement configurée.
          {dbStatus?.missingTables.length > 0 && <span> Tables manquantes : {dbStatus.missingTables.join(", ")}</span>}
        </p>
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 bg-white text-red-600 hover:bg-red-50"
            onClick={() => router.push("/test-supabase")}
          >
            <Database className="h-4 w-4 mr-2" />
            Configurer la base de données
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
