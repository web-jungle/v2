import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { ConnectionStatus } from "@/components/connection-status"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Planning Interactif",
  description: "Gestion des plannings pour les collaborateurs",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen bg-muted/10">
              <Navigation />
              <main className="flex-1 lg:ml-64 transition-all duration-300">
                <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center mb-4">
                    <div></div>
                    <Link href="/diagnostic" className="flex items-center gap-2">
                      <ConnectionStatus />
                    </Link>
                  </div>
                  {children}
                </div>
              </main>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
