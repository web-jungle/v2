import DbStatus from "@/components/db-status"

export default function DiagnosticPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Diagnostic de la base de données</h1>
      <DbStatus />
    </div>
  )
}
