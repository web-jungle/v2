"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock } from "lucide-react"

interface EventTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectType: (type: "presence" | "absence") => void
  date: Date
}

export default function EventTypeSelector({ isOpen, onClose, onSelectType, date }: EventTypeSelectorProps) {
  const formattedDate = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const handlePresenceClick = () => {
    onSelectType("presence");
  };

  const handleAbsenceClick = () => {
    onSelectType("absence");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvel événement</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-muted-foreground mb-6">
            <Calendar className="inline-block mr-2 h-4 w-4" />
            {formattedDate}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handlePresenceClick}
              className="h-32 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <span className="font-medium">Présence</span>
              <span className="text-xs text-muted-foreground">Chantier, déplacement, etc.</span>
            </Button>
            <Button
              onClick={handleAbsenceClick}
              className="h-32 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
              <span className="font-medium">Absence</span>
              <span className="text-xs text-muted-foreground">RTT, congés, arrêt, etc.</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
