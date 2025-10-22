// components/new-activity-plan-dialog.tsx
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NewActivityPlanDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewActivityPlanDialog({ children, open: externalOpen, onOpenChange: externalOnOpenChange }: NewActivityPlanDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [season, setSeason] = useState("")
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear())
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

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
          description: "Morate biti prijavljeni da biste kreirali plan aktivnosti",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!startDate || !endDate) {
        toast({
          title: "Greška",
          description: "Morate odabrati datume početka i završetka",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Insert activity plan
      const { error } = await supabase
        .from("activity_plans")
        .insert({
          user_id: user.id,
          title: title,
          description: description,
          season: season,
          season_year: seasonYear,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: "draft", // Default status
        })

      if (error) {
        console.error("Error inserting activity plan:", error)
        toast({
          title: "Greška",
          description: "Došlo je do greške pri kreiranju plana aktivnosti",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Plan aktivnosti kreiran",
        description: "Sezonski plan aktivnosti je uspješno kreiran.",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setSeason("")
      setSeasonYear(new Date().getFullYear())
      setStartDate(undefined)
      setEndDate(undefined)
      
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
          <DialogTitle>Kreiraj Plan Aktivnosti</DialogTitle>
          <DialogDescription>Kreirajte novi IATA sezonski plan upravljanja divljači</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Naslov Plana *</Label>
              <Input 
                id="title" 
                placeholder="npr. Ljetni plan upravljanja divljači 2025" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea 
                id="description" 
                placeholder="Opis sezonskog plana aktivnosti..." 
                rows={3} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season">Sezona *</Label>
                <Select value={season} onValueChange={setSeason} required>
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Odaberite sezonu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summer">Ljeto (IATA)</SelectItem>
                    <SelectItem value="winter">Zima (IATA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Godina *</Label>
                <Input 
                  id="year" 
                  type="number" 
                  min="2024" 
                  max="2030" 
                  value={seasonYear}
                  onChange={(e) => setSeasonYear(parseInt(e.target.value))}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum početka *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Odaberite datum</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Datum završetka *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Odaberite datum</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">IATA Smjernice za sezone</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ljetna sezona: Posljednja nedjelja u martu do posljednje subote u oktobru</li>
                <li>• Zimska sezona: Posljednja nedjelja u oktobru do posljednje subote u martu</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Otkaži
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kreiranje..." : "Kreiraj Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}