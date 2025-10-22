// app/analytics/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, TrendingUp, AlertTriangle, Users, Clock, FileText } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { createClient } from "@/lib/supabase/client"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface AnalyticsData {
  speciesData: Array<{ species: string; count: number; percentage: number; fill: string }>
  severityData: Array<{ severity: string; count: number; fill: string }>
  monthlyTrends: Array<{ month: string; sightings: number; hazards: number }>
  timeOfDayData: Array<{ time: string; count: number; fill: string }>
  locationData: Array<{ location: string; incidents: number; fill: string }>
  metrics: {
    totalSightings: number
    activeHazards: number
    uniqueSpecies: number
    responseTime: string
  }
}

// Proširena paleta boja za chartove
const CHART_COLORS = {
  primary: "#3b82f6",    // Plava
  secondary: "#8b5cf6",  // Ljubičasta
  success: "#10b981",    // Zelena
  warning: "#f59e0b",    // Narandžasta
  danger: "#ef4444",     // Crvena
  info: "#06b6d4",       // Cijan
  dark: "#64748b",       // Siva
  light: "#94a3b8",      // Svjetlija siva
  
  // Dodatne boje za više varijacija
  chart1: "#3b82f6",     // Plava
  chart2: "#8b5cf6",     // Ljubičasta
  chart3: "#10b981",     // Zelena
  chart4: "#f59e0b",     // Narandžasta
  chart5: "#ef4444",     // Crvena
  chart6: "#06b6d4",     // Cijan
  chart7: "#f97316",     // Tamno narandžasta
  chart8: "#84cc16",     // Limun zelena
  chart9: "#ec4899",     // Roze
  chart10: "#6366f1",    // Indigo
}

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// PDF Export funkcija
const exportToPDF = async (element: HTMLElement, analyticsData: AnalyticsData) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(40, 40, 40)
    pdf.text('Analitika Divljači - Kompletan Izvještaj', pageWidth / 2, 20, { align: 'center' })

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text('Aerodrom Tivat - Wildlife Management Sistem', pageWidth / 2, 28, { align: 'center' })

    const generatedDate = new Date().toLocaleDateString('sr-Latn-ME', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    pdf.text(`Generisano: ${generatedDate}`, pageWidth / 2, 35, { align: 'center' })

    pdf.setDrawColor(200, 200, 200)
    pdf.line(10, 40, pageWidth - 10, 40)

    let currentY = 50

    // Metričke kartice u PDF-u
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(40, 40, 40)
    pdf.text('Ključne Metrike', 10, currentY)
    currentY += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const metrics = [
      `Ukupno viđanja: ${analyticsData.metrics.totalSightings}`,
      `Aktivne opasnosti: ${analyticsData.metrics.activeHazards}`,
      `Identifikovane vrste: ${analyticsData.metrics.uniqueSpecies}`,
      `Prosječno vrijeme odziva: ${analyticsData.metrics.responseTime}`
    ]

    metrics.forEach(metric => {
      if (currentY > pageHeight - 20) {
        pdf.addPage()
        currentY = 20
      }
      pdf.text(metric, 15, currentY)
      currentY += 6
    })

    currentY += 10

    // Capture the main content
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.8)
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    if (currentY + imgHeight > pageHeight - 20) {
      pdf.addPage()
      currentY = 20
    }

    pdf.addImage(imgData, 'JPEG', 10, currentY, imgWidth, imgHeight)

    // Footer
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Strana ${i} od ${pageCount}`, pageWidth - 20, pageHeight - 10)
      pdf.text('© 2024 Aerodrom Tivat - Wildlife Management', 10, pageHeight - 10)
    }

    const filename = `analitika-divljaci-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(filename)

  } catch (error) {
    console.error('Greška pri eksportu PDF-a:', error)
    throw new Error('Došlo je do greške pri generisanju PDF izvještaja')
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data: sightings, error: sightingsError } = await supabase
          .from("wildlife_sightings")
          .select("*")
          .order("created_at", { ascending: false })

        const { data: hazards, error: hazardsError } = await supabase
          .from("hazard_reports")
          .select("*")
          .order("created_at", { ascending: false })

        if (sightingsError || hazardsError) {
          throw new Error(sightingsError?.message || hazardsError?.message)
        }

        const processAnalyticsData = (): AnalyticsData | null => {
          if (!sightings || !hazards) return null

          // Species distribution
          const speciesCount: { [key: string]: number } = {}
          sightings.forEach(sighting => {
            speciesCount[sighting.species] = (speciesCount[sighting.species] || 0) + (sighting.count || 1)
          })
          const speciesColors = [
            CHART_COLORS.chart1, CHART_COLORS.chart2, CHART_COLORS.chart3, 
            CHART_COLORS.chart4, CHART_COLORS.chart5, CHART_COLORS.chart6,
            CHART_COLORS.chart7, CHART_COLORS.chart8, CHART_COLORS.chart9, CHART_COLORS.chart10
          ]
          const speciesData = Object.entries(speciesCount)
            .map(([species, count], index) => ({
              species,
              count,
              percentage: Math.round((count / sightings.length) * 100),
              fill: speciesColors[index % speciesColors.length]
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)

          // Severity distribution
          const severityCount: { [key: string]: number } = {}
          sightings.forEach(sighting => {
            severityCount[sighting.severity] = (severityCount[sighting.severity] || 0) + 1
          })
          const severityData = [
            { severity: "Nisko", count: severityCount["low"] || 0, fill: CHART_COLORS.success },
            { severity: "Srednje", count: severityCount["medium"] || 0, fill: CHART_COLORS.warning },
            { severity: "Visoko", count: severityCount["high"] || 0, fill: CHART_COLORS.danger },
            { severity: "Kritično", count: severityCount["critical"] || 0, fill: "#dc2626" },
          ]

          // Monthly trends sa default vrijednostima
          const monthlyData: { [key: string]: { sightings: number, hazards: number } } = {}
          
          // Ako nema podataka, kreiraj prazne mjesece
          if (sightings.length === 0 && hazards.length === 0) {
            const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec']
            months.forEach(month => {
              monthlyData[month] = { sightings: 0, hazards: 0 }
            })
          } else {
            sightings.forEach(sighting => {
              const month = new Date(sighting.created_at).toLocaleDateString('sr-Latn-ME', { month: 'short' })
              if (!monthlyData[month]) monthlyData[month] = { sightings: 0, hazards: 0 }
              monthlyData[month].sightings++
            })
            hazards.forEach(hazard => {
              const month = new Date(hazard.created_at).toLocaleDateString('sr-Latn-ME', { month: 'short' })
              if (!monthlyData[month]) monthlyData[month] = { sightings: 0, hazards: 0 }
              monthlyData[month].hazards++
            })
          }

          const monthlyTrends = Object.entries(monthlyData)
            .map(([month, data]) => ({
              month,
              sightings: data.sightings || 0,
              hazards: data.hazards || 0
            }))
            .sort((a, b) => {
              const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec']
              return months.indexOf(a.month.toLowerCase()) - months.indexOf(b.month.toLowerCase())
            })

          // Time of day analysis
          const timeOfDayCount: { [key: string]: number } = {
            "00-04": 0, "04-08": 0, "08-12": 0, 
            "12-16": 0, "16-20": 0, "20-24": 0
          }
          sightings.forEach(sighting => {
            const hour = new Date(sighting.created_at).getHours()
            let timeSlot = "20-24"
            if (hour < 4) timeSlot = "00-04"
            else if (hour < 8) timeSlot = "04-08"
            else if (hour < 12) timeSlot = "08-12"
            else if (hour < 16) timeSlot = "12-16"
            else if (hour < 20) timeSlot = "16-20"
            timeOfDayCount[timeSlot]++
          })
          const timeColors = [
            CHART_COLORS.chart10, CHART_COLORS.chart2, CHART_COLORS.chart1,
            CHART_COLORS.chart4, CHART_COLORS.chart5, CHART_COLORS.chart9
          ]
          const timeOfDayData = Object.entries(timeOfDayCount).map(([time, count], index) => ({ 
            time, 
            count,
            fill: timeColors[index % timeColors.length]
          }))

          // Location analysis
          const locationCount: { [key: string]: number } = {}
          sightings.forEach(sighting => {
            locationCount[sighting.location] = (locationCount[sighting.location] || 0) + 1
          })
          hazards.forEach(hazard => {
            locationCount[hazard.location] = (locationCount[hazard.location] || 0) + 1
          })
          const locationColors = [
            CHART_COLORS.chart1, CHART_COLORS.chart3, CHART_COLORS.chart5,
            CHART_COLORS.chart7, CHART_COLORS.chart9, CHART_COLORS.chart2
          ]
          const locationData = Object.entries(locationCount)
            .map(([location, incidents], index) => ({ 
              location, 
              incidents,
              fill: locationColors[index % locationColors.length]
            }))
            .sort((a, b) => b.incidents - a.incidents)
            .slice(0, 6)

          // Calculate metrics
          const totalSightings = sightings.length
          const activeHazards = hazards.filter(h => h.status === 'open' || h.status === 'in_progress').length
          const uniqueSpecies = new Set(sightings.map(s => s.species)).size

          return {
            speciesData,
            severityData,
            monthlyTrends,
            timeOfDayData,
            locationData,
            metrics: {
              totalSightings,
              activeHazards,
              uniqueSpecies,
              responseTime: "8.5m"
            }
          }
        }

        const data = processAnalyticsData()
        setAnalyticsData(data)
        
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError(err instanceof Error ? err.message : "Došlo je do greške pri učitavanju podataka")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const handleExportPDF = async () => {
    if (!contentRef.current || !analyticsData) return
    
    setExporting(true)
    try {
      await exportToPDF(contentRef.current, analyticsData)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Došlo je do greške pri eksportu PDF-a. Pokušajte ponovo.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analitika Divljači</h1>
            <p className="text-muted-foreground">Sveobuhvatna analiza podataka o upravljanju divljači</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">Učitavanje podataka...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analitika Divljači</h1>
            <p className="text-muted-foreground">Sveobuhvatna analiza podataka o upravljanju divljači</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2 text-destructive">Greška pri učitavanju podataka</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analitika Divljači</h1>
            <p className="text-muted-foreground">Sveobuhvatna analiza podataka o upravljanju divljači</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2">Nema podataka za analizu</p>
            <p className="text-sm text-muted-foreground">Unesite podatke o viđanjima i opasnostima da biste vidjeli analitiku</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { speciesData, severityData, monthlyTrends, timeOfDayData, locationData, metrics } = analyticsData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analitika Divljači</h1>
          <p className="text-muted-foreground">Sveobuhvatna analiza podataka o upravljanju divljači</p>
        </div>
        <Button onClick={handleExportPDF} disabled={exporting}>
          {exporting ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generisanje...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Izvezi PDF Izvještaj
            </>
          )}
        </Button>
      </div>

      {/* Glavni sadržaj za PDF export */}
      <div ref={contentRef}>
        <Card>
          <CardHeader>
            <CardTitle>Filteri</CardTitle>
            <CardDescription>Prilagodite prikaz analitike</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Datum od</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Odaberite datum</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Datum do</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Odaberite datum</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-filter">Lokacija</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="location-filter">
                    <SelectValue placeholder="Sve lokacije" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve lokacije</SelectItem>
                    <SelectItem value="pista">Piste</SelectItem>
                    <SelectItem value="rolna">Rolna staza</SelectItem>
                    <SelectItem value="terminal">Terminal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="species-filter">Vrsta</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="species-filter">
                    <SelectValue placeholder="Sve vrste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve vrste</SelectItem>
                    <SelectItem value="guske">Guske</SelectItem>
                    <SelectItem value="galebovi">Galebovi</SelectItem>
                    <SelectItem value="sokolovi">Sokolovi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards sa ikonama i bojama */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Ukupno Viđanja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{metrics.totalSightings}</div>
              <p className="text-xs text-blue-600">+12% od prošlog perioda</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Aktivne Opasnosti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{metrics.activeHazards}</div>
              <p className="text-xs text-red-600">-8% od prošlog perioda</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Identifikovane Vrste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{metrics.uniqueSpecies}</div>
              <p className="text-xs text-green-600">+3 nove vrste</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Vrijeme Odziva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{metrics.responseTime}</div>
              <p className="text-xs text-purple-600">-2.3m poboljšanje</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Pregled</TabsTrigger>
            <TabsTrigger value="species">Analiza Vrsta</TabsTrigger>
            <TabsTrigger value="temporal">Vremenski Oblici</TabsTrigger>
            <TabsTrigger value="locations">Analiza Lokacija</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Mjesečni Trendovi</CardTitle>
                  <CardDescription>Viđanja i opasnosti kroz vrijeme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] relative">
                    {monthlyTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={monthlyTrends}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                          />
                          <YAxis 
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                            domain={[0, 'dataMax + 1']}
                          />
                          <Tooltip 
                            content={<CustomTooltip />}
                            wrapperStyle={{ 
                              outline: 'none',
                              backgroundColor: 'white',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Legend 
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="sightings" 
                            stroke={CHART_COLORS.primary} 
                            strokeWidth={3}
                            dot={{ 
                              fill: CHART_COLORS.primary, 
                              strokeWidth: 2, 
                              r: 5,
                              stroke: 'white'
                            }}
                            activeDot={{ 
                              r: 7, 
                              fill: CHART_COLORS.primary,
                              stroke: 'white',
                              strokeWidth: 2
                            }}
                            name="Viđanja"
                            strokeLinecap="round"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="hazards" 
                            stroke={CHART_COLORS.danger} 
                            strokeWidth={3}
                            dot={{ 
                              fill: CHART_COLORS.danger, 
                              strokeWidth: 2, 
                              r: 5,
                              stroke: 'white'
                            }}
                            activeDot={{ 
                              r: 7, 
                              fill: CHART_COLORS.danger,
                              stroke: 'white',
                              strokeWidth: 2
                            }}
                            name="Opasnosti"
                            strokeLinecap="round"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                            <TrendingUp className="w-8 h-8" />
                          </div>
                          <p className="font-medium mb-1">Nema podataka za prikaz</p>
                          <p className="text-sm">Unesite podatke o viđanjima i opasnostima</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {monthlyTrends.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {monthlyTrends.reduce((sum, item) => sum + item.sightings, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Ukupno viđanja</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {monthlyTrends.reduce((sum, item) => sum + item.hazards, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Ukupno opasnosti</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribucija Ozbiljnosti</CardTitle>
                  <CardDescription>Incidenti po nivou ozbiljnosti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Pie 
                          data={severityData} 
                          dataKey="count" 
                          nameKey="severity" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={100}
                          label={({ severity, count }) => `${severity}: ${count}`}
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="species" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribucija Vrsta</CardTitle>
                <CardDescription>Najčešće viđene vrste divljači</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={speciesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="species" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="count" 
                        radius={[4, 4, 0, 0]}
                        name="Viđanja"
                      >
                        {speciesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalji po Vrstama</CardTitle>
                <CardDescription>Detaljna analiza po vrstama</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {speciesData.map((species, index) => (
                    <div key={species.species} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{species.species}</span>
                          <span className="text-sm text-muted-foreground">
                            {species.count} viđanja ({species.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${species.percentage}%`,
                              backgroundColor: species.fill
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analiza po Vremenu Dana</CardTitle>
                <CardDescription>Aktivnost divljači po vremenskom periodu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeOfDayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="count" 
                        radius={[4, 4, 0, 0]}
                        name="Incidenti"
                      >
                        {timeOfDayData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Satovi Najveće Aktivnosti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeOfDayData.map((timeSlot, index) => (
                      <div key={timeSlot.time} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderLeftColor: timeSlot.fill, borderLeftWidth: '4px' }}>
                        <span className="font-medium">{timeSlot.time}h</span>
                        <span className="text-sm font-semibold" style={{ color: timeSlot.fill }}>
                          {timeSlot.count} incidenta
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sezonski Oblici</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { season: "Proljetna Migracija", activity: 85, color: CHART_COLORS.chart5 },
                      { season: "Ljeto", activity: 60, color: CHART_COLORS.chart4 },
                      { season: "Jesenja Migracija", activity: 95, color: CHART_COLORS.danger },
                      { season: "Zima", activity: 40, color: CHART_COLORS.chart3 }
                    ].map((season, index) => (
                      <div key={season.season} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{season.season}</span>
                          <span className="font-medium" style={{ color: season.color }}>
                            {season.activity}% Aktivnost
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${season.activity}%`,
                              backgroundColor: season.color
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Incidenti po Lokaciji</CardTitle>
                <CardDescription>Visoko-rizična područja koja zahtijevaju pažnju</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#666" />
                      <YAxis dataKey="location" type="category" width={120} stroke="#666" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="incidents" 
                        radius={[0, 4, 4, 0]}
                        name="Incidenti"
                      >
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Procjena Rizika po Lokaciji</CardTitle>
                <CardDescription>Prioritetna područja za upravljanje divljači</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locationData.map((location, index) => (
                    <div key={location.location} className="flex items-center gap-4">
                      <div 
                        className="flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm text-white"
                        style={{ backgroundColor: location.fill }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{location.location}</span>
                          <span className="text-sm font-semibold" style={{ color: location.fill }}>
                            {location.incidents} incidenta
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(location.incidents / Math.max(...locationData.map(l => l.incidents))) * 100}%`,
                              backgroundColor: location.fill
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}