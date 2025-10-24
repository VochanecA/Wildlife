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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { bs } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface GenerateReportDialogProps {
  children?: React.ReactNode
}

export function GenerateReportDialog({ children }: GenerateReportDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportType, setReportType] = useState("")
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const generateReport = async () => {
    if (!reportType || !title) {
      toast({
        title: "Greška",
        description: "Molimo popunite sva obavezna polja",
        variant: "destructive",
      })
      return
    }

    if (reportType === 'custom' && (!startDate || !endDate)) {
      toast({
        title: "Greška",
        description: "Za prilagođeni izvještaj morate odabrati period",
        variant: "destructive",
      })
      return
    }

    if (reportType === 'custom' && startDate && endDate && startDate > endDate) {
      toast({
        title: "Greška",
        description: "Datum početka ne može biti nakon datuma završetka",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Niste prijavljeni")

      // Calculate dates based on report type
      let periodStart = startDate
      let periodEnd = endDate

      if (reportType !== 'custom') {
        const today = new Date()
        switch (reportType) {
          case 'daily':
            periodStart = new Date(today)
            periodEnd = new Date(today)
            break
          case 'weekly':
            periodStart = new Date(today.setDate(today.getDate() - 7))
            periodEnd = new Date()
            break
          case 'monthly':
            periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
            periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            break
          case 'quarterly':
            const quarter = Math.floor(today.getMonth() / 3)
            periodStart = new Date(today.getFullYear(), quarter * 3, 1)
            periodEnd = new Date(today.getFullYear(), (quarter + 1) * 3, 0)
            break
          case 'yearly':
            periodStart = new Date(today.getFullYear(), 0, 1)
            periodEnd = new Date(today.getFullYear(), 11, 31)
            break
          default:
            periodStart = new Date(today)
            periodEnd = new Date(today)
        }
      }

      // Ensure dates are defined
      if (!periodStart || !periodEnd) {
        throw new Error("Datumi nisu definisani")
      }

      // Fetch data for the report
      const { data: sightings } = await supabase
        .from("wildlife_sightings")
        .select("*")
        .gte("created_at", periodStart.toISOString())
        .lte("created_at", periodEnd.toISOString())

      const { data: hazards } = await supabase
        .from("hazard_reports")
        .select("*")
        .gte("created_at", periodStart.toISOString())
        .lte("created_at", periodEnd.toISOString())

      // Calculate statistics
      const totalSightings = sightings?.length || 0
      const totalHazards = hazards?.length || 0
      const totalAnimals = sightings?.reduce((sum, sighting) => sum + (sighting.count || 0), 0) || 0
      const uniqueSpecies = [...new Set(sightings?.map(s => s.species) || [])].length

      // Fix TypeScript issues in reduce and sort functions
      const sightingsBySeverity = sightings?.reduce((acc: Record<string, number>, sighting) => {
        acc[sighting.severity] = (acc[sighting.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const hazardsByPriority = hazards?.reduce((acc: Record<string, number>, hazard) => {
        acc[hazard.priority] = (acc[hazard.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const speciesCount = sightings?.reduce((acc: Record<string, number>, sighting) => {
        acc[sighting.species] = (acc[sighting.species] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const topSpecies = Object.entries(speciesCount)
        .sort((a, b) => {
          const countA = a[1]
          const countB = b[1]
          return countB - countA
        })
        .slice(0, 5)
        .map(([species, count]) => ({ species, count }))

      const reportData = {
        totalSightings,
        totalHazards,
        totalAnimals,
        uniqueSpecies,
        sightingsBySeverity,
        hazardsByPriority,
        topSpecies,
        period: {
          start: periodStart.toISOString().split('T')[0],
          end: periodEnd.toISOString().split('T')[0]
        }
      }

      // Save report to database
      const { error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          title,
          report_type: reportType,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          data: reportData,
        })

      if (error) throw error

      toast({
        title: "Izvještaj generisan",
        description: "Izvještaj je uspješno generisan i sačuvan",
      })

      setOpen(false)
      setReportType("")
      setTitle("")
      setStartDate(undefined)
      setEndDate(undefined)
      router.refresh()

    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri generisanju izvještaja",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generiši Novi Izvještaj</DialogTitle>
          <DialogDescription>
            Kreirajte izvještaj o aktivnostima upravljanja divljim životinjama
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Naziv Izvještaja *</Label>
            <Input
              id="title"
              placeholder="npr. Mjesečni izvještaj - Januar 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">Tip Izvještaja *</Label>
            <Select value={reportType} onValueChange={setReportType} required>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Odaberite tip izvještaja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Dnevni</SelectItem>
                <SelectItem value="weekly">Nedeljni</SelectItem>
                <SelectItem value="monthly">Mjesečni</SelectItem>
                <SelectItem value="quarterly">Kvartalni</SelectItem>
                <SelectItem value="yearly">Godišnji</SelectItem>
                <SelectItem value="custom">Prilagođeni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum početka *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: bs }) : "Odaberite datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={bs}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Datum završetka *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: bs }) : "Odaberite datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={bs}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Otkaži
          </Button>
          <Button onClick={generateReport} disabled={isGenerating}>
            {isGenerating ? "Generisanje..." : "Generiši Izvještaj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}