import LoadingSpinner from "@/components/loading-spinner"

export default function CongesLoading() {
  return (
    <div className="container py-6 flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" message="Chargement de la gestion des congés..." />
    </div>
  )
}
