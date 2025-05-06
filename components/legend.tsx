"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function Legend() {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-2">Légende</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Présences</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">GD</span>
                <span className="text-sm">Grand déplacement</span>
              </div>
              <div className="flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">PR</span>
                <span className="text-sm">Panier repas</span>
              </div>
              <div className="flex items-center">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-2">PRGD</span>
                <span className="text-sm">PRGD</span>
              </div>
              <div className="flex items-center">
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs mr-2">HS</span>
                <span className="text-sm">Heures supplémentaires</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Absences</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <span className="bg-orange-500 px-2 py-1 rounded text-xs text-white mr-2">RTT</span>
                <span className="text-sm">RTT</span>
              </div>
              <div className="flex items-center">
                <span className="bg-green-500 px-2 py-1 rounded text-xs text-white mr-2">CP</span>
                <span className="text-sm">Congés payés</span>
              </div>
              <div className="flex items-center">
                <span className="bg-red-500 px-2 py-1 rounded text-xs text-white mr-2">AT</span>
                <span className="text-sm">Arrêt/Accident travail</span>
              </div>
              <div className="flex items-center">
                <span className="bg-purple-500 px-2 py-1 rounded text-xs text-white mr-2">Autre</span>
                <span className="text-sm">Autres absences</span>
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Statuts</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <span className="border border-gray-400 px-2 py-1 rounded text-xs mr-2 flex items-center">
                  <Lock className="h-3 w-3 mr-1 text-red-500" />
                  Verrouillé
                </span>
                <span className="text-sm">Événement verrouillé par un administrateur</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
