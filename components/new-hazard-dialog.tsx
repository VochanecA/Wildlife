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
import { MediaUpload } from "./media-upload"

interface NewHazardDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewHazardDialog({ children, open: externalOpen, onOpenChange: externalOnOpenChange }: NewHazardDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [severity, setSeverity] = useState("")
  const [priority, setPriority] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [hazardId, setHazardId] = useState<string | null>(null)

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
          description: "Morate biti prijavljeni da biste prijavili opasnost",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Insert hazard report and get the ID
      const { data, error } = await supabase
        .from("hazard_reports")
        .insert({
          user_id: user.id,
          title: title,
          description: description,
          location: location,
          severity: severity,
          priority: priority,
          status: "open",
        })
        .select()
        .single()

      if (error) {
        console.error("Error inserting hazard:", error)
        toast({
          title: "Greška",
          description: "Došlo je do greške pri prijavljivanju opasnosti",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Set hazard ID for media upload
      setHazardId(data.id)

      toast({
        title: "Opasnost prijavljena",
        description: "Izvještaj o opasnosti je uspješno podnesen.",
      })

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

  const handleMediaUploadComplete = () => {
    // Reset form and close dialog after upload
    setTitle("")
    setSeverity("")
    setPriority("")
    setLocation("")
    setDescription("")
    setHazardId(null)
    setIsSubmitting(false)
    setOpen(false)
    router.refresh()
  }

  const handleSkipMediaUpload = () => {
    handleMediaUploadComplete()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prijavi Opasnost od Divljači</DialogTitle>
          <DialogDescription>
            {!hazardId 
              ? "Dokumentujte opasnost od divljači ili sigurnosni problem" 
              : "Dodajte dokumentaciju za prijavljenu opasnost"
            }
          </DialogDescription>
        </DialogHeader>
        
        {!hazardId ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Naslov Opasnosti *</Label>
                <Input 
                  id="title" 
                  placeholder="npr. Ptice u krovnoj konstrukciji" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="priority">Prioritet *</Label>
                  <Select value={priority} onValueChange={setPriority} required>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Odaberite prioritet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Nizak</SelectItem>
                      <SelectItem value="medium">Srednji</SelectItem>
                      <SelectItem value="high">Visok</SelectItem>
                      <SelectItem value="urgent">Hitan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokacija *</Label>
                <Input 
                  id="location" 
                  placeholder="npr. Hangar 3" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Detaljan opis opasnosti, uključujući vrstu divljači, ponašanje, i potencijalni uticaj na sigurnost" 
                  rows={4} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Otkaži
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Podnošenje..." : "Podnesi Izvještaj"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4">
            <h3 className="font-semibold mb-4">Dodajte dokumentaciju (opciono)</h3>
            <MediaUpload
              entityType="hazard"
              entityId={hazardId}
              onUploadComplete={handleMediaUploadComplete}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleSkipMediaUpload}
              >
                Preskoči
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}