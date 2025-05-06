"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Collaborateur } from "@/lib/types";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MultiSelectCollaborateursProps {
  collaborateurs: Collaborateur[];
  selectedCollaborateurs: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export default function MultiSelectCollaborateurs({
  collaborateurs,
  selectedCollaborateurs,
  onChange,
  disabled = false,
}: MultiSelectCollaborateursProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);

  useEffect(() => {
    console.log("MultiSelect: collaborateurs reçus:", collaborateurs.length);
    console.log(
      "MultiSelect: selectedCollaborateurs:",
      selectedCollaborateurs.length
    );
  }, [collaborateurs, selectedCollaborateurs]);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const handleSelect = (collaborateurId: string) => {
    if (selectedCollaborateurs.includes(collaborateurId)) {
      onChange(selectedCollaborateurs.filter((id) => id !== collaborateurId));
    } else {
      onChange([...selectedCollaborateurs, collaborateurId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCollaborateurs.length === collaborateurs.length) {
      onChange([]);
    } else {
      onChange(collaborateurs.map((c) => c.id));
    }
  };

  const handleClear = () => {
    onChange([]);
    setOpen(false);
  };

  const selectedCollaborateursNames = selectedCollaborateurs
    .map((id) => collaborateurs.find((c) => c.id === id)?.nom)
    .filter(Boolean);

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
            {selectedCollaborateurs.length === 0 ? (
              <span className="text-muted-foreground">
                Sélectionner des collaborateurs
              </span>
            ) : selectedCollaborateurs.length === collaborateurs.length ? (
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
      <PopoverContent
        className="p-0"
        style={{ width: Math.max(300, triggerWidth) }}
      >
        <Command>
          <CommandInput placeholder="Rechercher un collaborateur..." />
          <CommandList>
            <CommandEmpty>Aucun collaborateur trouvé.</CommandEmpty>
          </CommandList>
          <div className="border-t px-2 py-2 flex justify-between">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedCollaborateurs.length === collaborateurs.length
                ? "Désélectionner tout"
                : "Sélectionner tout"}
            </Button>
            {selectedCollaborateurs.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            <CommandList>
              <CommandGroup>
                {collaborateurs.map((collaborateur) => {
                  const isSelected = selectedCollaborateurs.includes(
                    collaborateur.id
                  );
                  return (
                    <CommandItem
                      key={collaborateur.id}
                      value={collaborateur.nom}
                      onSelect={() => handleSelect(collaborateur.id)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox checked={isSelected} />
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: collaborateur.couleur }}
                        ></div>
                        {collaborateur.nom}
                      </div>
                      <Check
                        className={`h-4 w-4 ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
