"use client"

import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface EnterpriseSelectorProps {
  enterprises: string[]
  selectedEnterprise: string | null
  onChange: (enterprise: string | null) => void
}

export default function EnterpriseSelector({ enterprises, selectedEnterprise, onChange }: EnterpriseSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between min-w-[200px]">
          {selectedEnterprise || "Toutes les entreprises"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandInput placeholder="Rechercher une entreprise..." />
          <CommandList>
            <CommandEmpty>Aucune entreprise trouvée.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className="cursor-pointer"
              >
                <Check className={cn("mr-2 h-4 w-4", selectedEnterprise === null ? "opacity-100" : "opacity-0")} />
                Toutes les entreprises
              </CommandItem>
              {enterprises.map((enterprise) => (
                <CommandItem
                  key={enterprise}
                  onSelect={() => {
                    onChange(enterprise)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedEnterprise === enterprise ? "opacity-100" : "opacity-0")}
                  />
                  {enterprise}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
