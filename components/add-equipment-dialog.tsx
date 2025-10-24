"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AddEquipmentDialogProps {
  children?: React.ReactNode
}

export function AddEquipmentDialog({ children }: AddEquipmentDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [location, setLocation] = useState("")
  const [lastMaintenance, setLastMaintenance] = useState("")
  const [nextMaintenance, setNextMaintenance] = useState("")
  const [notes, setNotes] = useState("")

  const addEquipment = async () => {
    if (!name || !type) {
      toast({
        title: "Greška",
        description: "Molimo popunite obavezna polja",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Niste prijavljeni")

      // Save equipment to database
      const { error } = await supabase
        .from("equipment")
        .insert({
          name,
          type,
          location: location || null,
          last_maintenance: lastMaintenance || null,
          next_maintenance: nextMaintenance || null,
          notes: notes || null,
          status: 'available'
        })

      if (error) throw error

      toast({
        title: "Oprema dodana",
        description: "Nova oprema je uspješno dodana",
      })

      setOpen(false)
      setName("")
      setType("")
      setLocation("")
      setLastMaintenance("")
      setNextMaintenance("")
      setNotes("")
      router.refresh()

    } catch (error) {
      console.error("Error adding equipment:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri dodavanju opreme",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dodaj Novu Opremu</DialogTitle>
          <DialogDescription>
            Dodajte novu jedinicu opreme za kontrolu divljih životinja
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Naziv Opreme *</Label>
            <Input
              id="name"
              placeholder="npr. Audio repelent sistem Pista 14"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tip Opreme *</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Odaberite tip opreme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repellent">Repelent</SelectItem>
                <SelectItem value="camera">Kamera</SelectItem>
                <SelectItem value="vehicle">Vozilo</SelectItem>
                <SelectItem value="trap">Zamka</SelectItem>
                <SelectItem value="sensor">Senzor</SelectItem>
                <SelectItem value="other">Ostalo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokacija</Label>
            <Input
              id="location"
              placeholder="npr. Pista 14 - Sjeverni kraj"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastMaintenance">Zadnji Servis</Label>
              <Input
                id="lastMaintenance"
                type="date"
                value={lastMaintenance}
                onChange={(e) => setLastMaintenance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextMaintenance">Sljedeći Servis</Label>
              <Input
                id="nextMaintenance"
                type="date"
                value={nextMaintenance}
                onChange={(e) => setNextMaintenance(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Napomene</Label>
            <Textarea
              id="notes"
              placeholder="Dodatne napomene o opremi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Otkaži
          </Button>
          <Button onClick={addEquipment} disabled={isSubmitting}>
            {isSubmitting ? "Dodavanje..." : "Dodaj Opremu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}