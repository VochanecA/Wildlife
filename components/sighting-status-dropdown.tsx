// components/sighting-status-dropdown.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronDown, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SightingStatusDropdownProps {
  sightingId: string
  currentSeverity: string
}

const severityOptions = [
  { value: "low", label: "Nisko", color: "bg-chart-3 text-white" },
  { value: "medium", label: "Srednje", color: "bg-chart-4 text-white" },
  { value: "high", label: "Visoko", color: "bg-chart-5 text-white" },
  { value: "critical", label: "Kritično", color: "bg-destructive text-destructive-foreground" },
]

export function SightingStatusDropdown({ sightingId, currentSeverity }: SightingStatusDropdownProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const currentSeverityOption = severityOptions.find(option => option.value === currentSeverity)

  const updateSeverity = async (newSeverity: string) => {
    setIsUpdating(true)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from("wildlife_sightings")
        .update({ 
          severity: newSeverity,
          updated_at: new Date().toISOString()
        })
        .eq("id", sightingId)

      if (error) {
        throw error
      }

      toast({
        title: "Ozbiljnost ažurirana",
        description: `Ozbiljnost zapažanja je promijenjena na "${severityOptions.find(opt => opt.value === newSeverity)?.label}"`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating severity:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri ažuriranju ozbiljnosti",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-2" disabled={isUpdating}>
          <Badge className={currentSeverityOption?.color}>
            {currentSeverityOption?.label}
          </Badge>
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {severityOptions.map((severity) => (
          <DropdownMenuItem
            key={severity.value}
            onClick={() => updateSeverity(severity.value)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${severity.color.split(' ')[0]}`} />
              <span>{severity.label}</span>
            </div>
            {currentSeverity === severity.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}