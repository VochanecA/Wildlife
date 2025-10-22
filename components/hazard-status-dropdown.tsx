// components/hazard-status-dropdown.tsx
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
import { Check, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface HazardStatusDropdownProps {
  hazardId: string
  currentStatus: string
}

const statusOptions = [
  { value: "open", label: "Otvoreno", color: "bg-destructive/10 text-destructive border-destructive/20" },
  { value: "in_progress", label: "U toku", color: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
  { value: "resolved", label: "Riješeno", color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  { value: "closed", label: "Zatvoreno", color: "bg-muted text-muted-foreground border-border" },
]

export function HazardStatusDropdown({ hazardId, currentStatus }: HazardStatusDropdownProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus)

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    
    try {
      const supabase = createClient()
      
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      }
      
      // Ako se status mijenja na "resolved" ili "closed", postavi resolved_at
      if (newStatus === "resolved" || newStatus === "closed") {
        updateData.resolved_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("hazard_reports")
        .update(updateData)
        .eq("id", hazardId)

      if (error) {
        throw error
      }

      toast({
        title: "Status ažuriran",
        description: `Status opasnosti je promijenjen na "${statusOptions.find(opt => opt.value === newStatus)?.label}"`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri ažuriranju statusa",
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
          <Badge variant="outline" className={currentStatusOption?.color}>
            {currentStatusOption?.label}
          </Badge>
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => updateStatus(status.value)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
              <span>{status.label}</span>
            </div>
            {currentStatus === status.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}