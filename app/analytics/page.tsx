// app/analytics/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { createClient } from "@/lib/supabase/client"

interface AnalyticsData {
  speciesData: Array<{ species: string; count: number; percentage: number }>
  severityData: Array<{ severity: string; count: number; fill: string }>
  monthlyTrends: Array<{ month: string; sightings: number; hazards: number }>
  timeOfDayData: Array<{ time: string; count: number }>
  locationData: Array<{ location: string; incidents: number }>
  metrics: {
    totalSightings: number
    activeHazards: number
    uniqueSpecies: number
    responseTime: string
  }
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

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch wildlife sightings data
        const { data: sightings, error: sightingsError } = await supabase
          .from("wildlife_sightings")
          .select("*")
          .order("created_at", { ascending: false })

        // Fetch hazard reports data
        const { data: hazards, error: hazardsError } = await supabase
          .from("hazard_reports")
          .select("*")
          .order("created_at", { ascending: false })

        if (sightingsError || hazardsError) {
          throw new Error(sightingsError?.message || hazardsError?.message)
        }

        // Process data for analytics
        const processAnalyticsData = (): AnalyticsData | null => {
          if (!sightings || !hazards) return null

          // Species distribution
          const speciesCount: { [key: string]: number } = {}
          sightings.forEach(sighting => {
            speciesCount[sighting.species] = (speciesCount[sighting.species] || 0) + (sighting.count || 1)
          })
          const speciesData = Object.entries(speciesCount)
            .map(([species, count]) => ({
              species,
              count,
              percentage: Math.round((count / sightings.length) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)

          // Severity distribution
          const severityCount: { [key: string]: number } = {}
          sightings.forEach(sighting => {
            severityCount[sighting.severity] = (severityCount[sighting.severity] || 0) + 1
          })
          const severityData = [
            { severity: "Nisko", count: severityCount["low"] || 0, fill: "hsl(var(--chart-3))" },
            { severity: "Srednje", count: severityCount["medium"] || 0, fill: "hsl(var(--chart-4))" },
            { severity: "Visoko", count: severityCount["high"] || 0, fill: "hsl(var(--chart-5))" },
            { severity: "Kritično", count: severityCount["critical"] || 0, fill: "hsl(var(--destructive))" },
          ]

          // Monthly trends
          const monthlyData: { [key: string]: { sightings: number, hazards: number } } = {}
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
          const monthlyTrends = Object.entries(monthlyData)
            .map(([month, data]) => ({
              month,
              sightings: data.sightings,
              hazards: data.hazards
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
          const timeOfDayData = Object.entries(timeOfDayCount).map(([time, count]) => ({ time, count }))

          // Location analysis
          const locationCount: { [key: string]: number } = {}
          sightings.forEach(sighting => {
            locationCount[sighting.location] = (locationCount[sighting.location] || 0) + 1
          })
          hazards.forEach(hazard => {
            locationCount[hazard.location] = (locationCount[hazard.location] || 0) + 1
          })
          const locationData = Object.entries(locationCount)
            .map(([location, incidents]) => ({ location, incidents }))
            .sort((a, b) => b.incidents - a.incidents)
            .slice(0, 5)

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
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Izvezi Izvještaj
        </Button>
      </div>

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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Pregled</TabsTrigger>
          <TabsTrigger value="species">Analiza Vrsta</TabsTrigger>
          <TabsTrigger value="temporal">Vremenski Oblici</TabsTrigger>
          <TabsTrigger value="locations">Analiza Lokacija</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ukupno Viđanja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalSightings}</div>
                <p className="text-xs text-muted-foreground">+12% od prošlog perioda</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Aktivne Opasnosti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeHazards}</div>
                <p className="text-xs text-muted-foreground">-8% od prošlog perioda</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Identifikovane Vrste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.uniqueSpecies}</div>
                <p className="text-xs text-muted-foreground">+3 nove vrste</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vrijeme Odziva</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.responseTime}</div>
                <p className="text-xs text-muted-foreground">-2.3m poboljšanje</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mjesečni Trendovi</CardTitle>
                <CardDescription>Viđanja i opasnosti kroz vrijeme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sightings" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2}
                        name="Viđanja"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hazards" 
                        stroke="hsl(var(--chart-5))" 
                        strokeWidth={2}
                        name="Opasnosti"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="species" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--chart-1))" 
                      radius={[4, 4, 0, 0]}
                      name="Viđanja"
                    />
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
                {speciesData.map((species) => (
                  <div key={species.species} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{species.species}</span>
                        <span className="text-sm text-muted-foreground">
                          {species.count} viđanja ({species.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${species.percentage}%` }} />
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--chart-2))" 
                      radius={[4, 4, 0, 0]}
                      name="Incidenti"
                    />
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
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Jutarnji Vrhunac</span>
                    <span className="text-sm text-muted-foreground">08:00 - 12:00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Popodnevni Vrhunac</span>
                    <span className="text-sm text-muted-foreground">12:00 - 16:00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Niska Aktivnost</span>
                    <span className="text-sm text-muted-foreground">00:00 - 04:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sezonski Oblici</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Proljetna Migracija</span>
                      <span className="font-medium">Visoka Aktivnost</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-chart-5 h-2 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ljeto</span>
                      <span className="font-medium">Umjerena Aktivnost</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-chart-4 h-2 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Jesenja Migracija</span>
                      <span className="font-medium">Veoma Visoka Aktivnost</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-destructive h-2 rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Zima</span>
                      <span className="font-medium">Niska Aktivnost</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-chart-3 h-2 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="location" type="category" width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="incidents" 
                      fill="hsl(var(--chart-3))" 
                      radius={[0, 4, 4, 0]}
                      name="Incidenti"
                    />
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
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{location.location}</span>
                        <span className="text-sm text-muted-foreground">{location.incidents} incidenta</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(location.incidents / Math.max(...locationData.map(l => l.incidents))) * 100}%` }}
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
  )
}