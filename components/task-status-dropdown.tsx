// components/task-status-dropdown.tsx
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

interface TaskStatusDropdownProps {
  taskId: string
  currentStatus: string
}

const statusOptions = [
  { value: "pending", label: "Na čekanju", color: "bg-muted text-muted-foreground border-border" },
  { value: "in_progress", label: "U toku", color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
  { value: "completed", label: "Završeno", color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
]

export function TaskStatusDropdown({ taskId, currentStatus }: TaskStatusDropdownProps) {
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
      
      // Ako se status mijenja na "completed", postavi completed_at
      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskId)

      if (error) {
        throw error
      }

      toast({
        title: "Status ažuriran",
        description: `Status zadatka je promijenjen na "${statusOptions.find(opt => opt.value === newStatus)?.label}"`,
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