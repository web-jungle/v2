"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Collaborateur } from "@/lib/types"

interface CollaborateurSelectorProps {
  collaborateurs: Collaborateur[]
  selectedCollaborateurs: string[]
  onChange: (selectedIds: string[]) => void
  disabled?: boolean
  currentUserId?: string
  userRole?: string
}

export default function CollaborateurSelector({
  collaborateurs,
  selectedCollaborateurs,
  onChange,
  disabled = false,
  currentUserId,
  userRole = "collaborateur",
}: CollaborateurSelectorProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = useState<number>(0)

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth)
    }
  }, [open])

  const handleSelect = (collaborateurId: string) => {
    // Si l'utilisateur est un collaborateur, il ne peut s'affecter que lui-même
    if (userRole === "collaborateur" && currentUserId !== collaborateurId) {
      return
    }

    // Vérifier si le collaborateur est déjà sélectionné
    if (selectedCollaborateurs.includes(collaborateurId)) {
      // Le retirer de la sélection
      onChange(selectedCollaborateurs.filter((id) => id !== collaborateurId))
    } else {
      // L'ajouter à la sélection
      onChange([...selectedCollaborateurs, collaborateurId])
    }
  }

  const handleSelectAll = () => {
    // Seuls les admins et managers peuvent sélectionner tous les collaborateurs
    if (userRole === "collaborateur") {
      return
    }

    if (selectedCollaborateurs.length === collaborateurs.length) {
      onChange([])
    } else {
      onChange(collaborateurs.map((c) => c.id))
    }
  }

  const handleClear = () => {
    onChange([])
    setOpen(false)
  }

  // S'assurer que selectedCollaborateurs est toujours un tableau
  const safeSelectedCollaborateurs = Array.isArray(selectedCollaborateurs) ? selectedCollaborateurs : []

  const selectedCollaborateursNames = safeSelectedCollaborateurs
    .map((id) => collaborateurs.find((c) => c.id === id)?.nom)
    .filter(Boolean)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between min-w-[200px] h-auto min-h-10"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {safeSelectedCollaborateurs.length === 0 ? (
              <span className="text-muted-foreground">Sélectionner des collaborateurs</span>
            ) : safeSelectedCollaborateurs.length === collaborateurs.length ? (
              <span>Tous les collaborateurs</span>
            ) : (
              selectedCollaborateursNames.map((name) => (
                <Badge variant="secondary" key={name} className="mr-1">
                  {name}
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: Math.max(300, triggerWidth) }}>
        <Command>
          <CommandInput placeholder="Rechercher un collaborateur..." />
          <CommandList>
            <CommandEmpty>Aucun collaborateur trouvé.</CommandEmpty>
          </CommandList>
          {userRole !== "collaborateur" && (
            <div className="border-t px-2 py-2 flex justify-between">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {safeSelectedCollaborateurs.length === collaborateurs.length
                  ? "Désélectionner tout"
                  : "Sélectionner tout"}
              </Button>
              {safeSelectedCollaborateurs.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <X className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              )}
            </div>
          )}
          <ScrollArea className="h-[300px]">
            <CommandList>
              <CommandGroup>
                {collaborateurs.map((collaborateur) => {
                  const isSelected = safeSelectedCollaborateurs.includes(collaborateur.id)
                  const isCurrentUser = collaborateur.id === currentUserId
                  const isDisabled = userRole === "collaborateur" && !isCurrentUser

                  return (
                    <CommandItem
                      key={collaborateur.id}
                      value={collaborateur.nom}
                      onSelect={() => handleSelect(collaborateur.id)}
                      disabled={isDisabled}
                      className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox checked={isSelected} disabled={isDisabled} />
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: collaborateur.couleur }}></div>
                        {collaborateur.nom} {isCurrentUser && "(Vous)"}
                      </div>
                      <Check className={`h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
