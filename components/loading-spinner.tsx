import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  message?: string
}

export default function LoadingSpinner({ size = "md", message = "Chargement..." }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={`${sizeClass[size]} text-primary animate-spin mb-2`} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
