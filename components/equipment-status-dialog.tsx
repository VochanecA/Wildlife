"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateEquipmentStatus } from "@/lib/actions/equipment-actions"
import { useToast } from "@/hooks/use-toast"

interface Equipment {
  id: string
  name: string
  type: string
  status: string
  location?: string | null
  last_maintenance?: string | null
  next_maintenance?: string | null
  notes?: string | null
  created_at: string
}

interface EquipmentStatusDialogProps {
  equipment: Equipment
  children: React.ReactNode
}

export function EquipmentStatusDialog({ equipment, children }: EquipmentStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(equipment.status)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleStatusUpdate = async () => {
    try {
      setLoading(true)
      
      const result = await updateEquipmentStatus(equipment.id, status)
      
      if (result.success) {
        toast({
          title: "Status ažuriran",
          description: "Status opreme je uspješno ažuriran",
        })
        setOpen(false)
      } else {
        toast({
          title: "Greška",
          description: result.error || "Greška pri ažuriranju statusa opreme",
          variant: "destructive",
          
        })
      }
    } catch (error) {
      console.error("Error updating equipment status:", error)
      toast({
        title: "Greška",
        description: "Došlo je do neočekivane greške",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusOptions = () => [
    { value: 'available', label: 'Dostupno' },
    { value: 'in_use', label: 'U upotrebi' },
    { value: 'maintenance', label: 'Na održavanju' },
    { value: 'retired', label: 'Povučeno' }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ažuriraj Status Opreme</DialogTitle>
          <DialogDescription>
            Promijenite status za: <strong>{equipment.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Otkaži
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={loading || status === equipment.status}
            >
              {loading ? "Ažuriranje..." : "Sačuvaj Promjene"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}