import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TestConnection from "./test-connection"
import SqlScript from "./sql-script"

export default function TestSupabasePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test de connexion Supabase</h1>

      <Tabs defaultValue="test">
        <TabsList className="mb-4">
          <TabsTrigger value="test">Tester la connexion</TabsTrigger>
          <TabsTrigger value="sql">Script SQL</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <TestConnection />
        </TabsContent>

        <TabsContent value="sql">
          <SqlScript />
        </TabsContent>
      </Tabs>
    </div>
  )
}
