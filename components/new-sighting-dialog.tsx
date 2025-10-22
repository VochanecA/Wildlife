// components/new-sighting-dialog.tsx
"use client"

import type React from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NewSightingDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewSightingDialog({ children, open: externalOpen, onOpenChange: externalOnOpenChange }: NewSightingDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const [species, setSpecies] = useState("")
  const [count, setCount] = useState("")
  const [location, setLocation] = useState("")
  const [severity, setSeverity] = useState("")
  const [notes, setNotes] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        toast({
          title: "Greška",
          description: "Morate biti prijavljeni da biste evidentirali zapažanja",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Insert sighting
      const { error } = await supabase.from("wildlife_sightings").insert({
        user_id: user.id,
        species: species,
        count: Number.parseInt(count),
        location: location,
        latitude: latitude ? Number.parseFloat(latitude) : null,
        longitude: longitude ? Number.parseFloat(longitude) : null,
        severity: severity,
        notes: notes,
      })

      if (error) {
        console.error("Error inserting sighting:", error)
        toast({
          title: "Greška",
          description: "Došlo je do greške pri evidentiranju zapažanja",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Zapažanje evidentirano",
        description: "Zapažanje divljači je uspješno zabeleženo.",
      })

      // Reset form
      setSpecies("")
      setCount("")
      setLocation("")
      setSeverity("")
      setNotes("")
      setLatitude("")
      setLongitude("")
      
      setIsSubmitting(false)
      setOpen(false)
      
      // Refresh the page to show new data
      router.refresh()

    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Greška",
        description: "Došlo je do neočekivane greške",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evidentiraj Zapažanje Divljači</DialogTitle>
          <DialogDescription>Unesite detalje opažanja divljači</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="species">Vrsta *</Label>
                <Input 
                  id="species" 
                  placeholder="npr. Kanadske guske" 
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Broj *</Label>
                <Input 
                  id="count" 
                  type="number" 
                  min="1" 
                  placeholder="Broj životinja" 
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokacija *</Label>
              <Input 
                id="location" 
                placeholder="npr. Pista 27 - Sjeverni kraj" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Geografska širina</Label>
                <Input 
                  id="latitude" 
                  type="number" 
                  step="0.000001" 
                  placeholder="npr. 40.6413" 
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Geografska dužina</Label>
                <Input 
                  id="longitude" 
                  type="number" 
                  step="0.000001" 
                  placeholder="npr. -73.7781" 
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Ozbiljnost *</Label>
              <Select value={severity} onValueChange={setSeverity} required>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Odaberite ozbiljnost" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Nisko</SelectItem>
                  <SelectItem value="medium">Srednje</SelectItem>
                  <SelectItem value="high">Visoko</SelectItem>
                  <SelectItem value="critical">Kritično</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Napomene</Label>
              <Textarea 
                id="notes" 
                placeholder="Dodatna zapažanja, ponašanje životinja, preduzete akcije, itd." 
                rows={4} 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Otkaži
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Evidentiranje..." : "Evidentiraj Zapažanje"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}