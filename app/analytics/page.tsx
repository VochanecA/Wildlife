"use client"

import { useState } from "react"
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
import { Bar, BarChart, Line, LineChart, Pie, PieChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const speciesData = [
  { species: "Kanadske guske", count: 145, percentage: 32 },
  { species: "Galebovi", count: 98, percentage: 22 },
  { species: "Čvorci", count: 87, percentage: 19 },
  { species: "Jastrebovi", count: 56, percentage: 12 },
  { species: "Vrane", count: 43, percentage: 10 },
  { species: "Ostalo", count: 23, percentage: 5 },
]

const monthlyTrends = [
  { month: "Jul", sightings: 45, hazards: 8 },
  { month: "Avg", sightings: 52, hazards: 12 },
  { month: "Sep", sightings: 68, hazards: 15 },
  { month: "Okt", sightings: 89, hazards: 18 },
  { month: "Nov", sightings: 95, hazards: 22 },
  { month: "Dec", sightings: 78, hazards: 16 },
  { month: "Jan", sightings: 72, hazards: 14 },
]

const severityData = [
  { severity: "Nisko", count: 125, fill: "hsl(var(--chart-3))" },
  { severity: "Srednje", count: 178, fill: "hsl(var(--chart-4))" },
  { severity: "Visoko", count: 89, fill: "hsl(var(--chart-5))" },
  { severity: "Kritično", count: 32, fill: "hsl(var(--destructive))" },
]

const timeOfDayData = [
  { time: "00-04", count: 12 },
  { time: "04-08", count: 45 },
  { time: "08-12", count: 89 },
  { time: "12-16", count: 76 },
  { time: "16-20", count: 54 },
  { time: "20-24", count: 23 },
]

const locationData = [
  { location: "Pista 27", incidents: 45 },
  { location: "Taksi staza B", incidents: 32 },
  { location: "Terminal", incidents: 28 },
  { location: "Sjeverno polje", incidents: 25 },
  { location: "Perimetar", incidents: 18 },
]

export default function AnalyticsPage() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analitika divljih životinja</h1>
          <p className="text-muted-foreground">Detaljna analiza upravljanja divljim životinjama</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Izvezi izvještaj
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filteri</CardTitle>
          <CardDescription>Podesi prikaz analitike</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Od datuma</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : <span>Izaberi datum</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Do datuma</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : <span>Izaberi datum</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-filter">Lokacija</Label>
              <Select>
                <SelectTrigger id="location-filter">
                  <SelectValue placeholder="Sve lokacije" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve lokacije</SelectItem>
                  <SelectItem value="runway">Piste</SelectItem>
                  <SelectItem value="taxiway">Taksi staze</SelectItem>
                  <SelectItem value="terminal">Terminal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="species-filter">Vrste</Label>
              <Select>
                <SelectTrigger id="species-filter">
                  <SelectValue placeholder="Sve vrste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve vrste</SelectItem>
                  <SelectItem value="geese">Kanadske guske</SelectItem>
                  <SelectItem value="gulls">Galebovi</SelectItem>
                  <SelectItem value="hawks">Jastrebovi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Pregled</TabsTrigger>
          <TabsTrigger value="species">Analiza vrsta</TabsTrigger>
          <TabsTrigger value="temporal">Vremenski obrasci</TabsTrigger>
          <TabsTrigger value="locations">Analiza lokacija</TabsTrigger>
        </TabsList>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="species">Species Analysis</TabsTrigger>
          <TabsTrigger value="temporal">Temporal Patterns</TabsTrigger>
          <TabsTrigger value="locations">Location Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sightings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">452</div>
                <p className="text-xs text-muted-foreground">+12% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Hazards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">-8% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Species Identified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">34</div>
                <p className="text-xs text-muted-foreground">+3 new species</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5m</div>
                <p className="text-xs text-muted-foreground">-2.3m improvement</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Sightings and hazards over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sightings: {
                      label: "Sightings",
                      color: "hsl(var(--chart-1))",
                    },
                    hazards: {
                      label: "Hazards",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="sightings" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    <Line type="monotone" dataKey="hazards" stroke="hsl(var(--chart-5))" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Incidents by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Count",
                    },
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={severityData} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={100}>
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="species" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Species Distribution</CardTitle>
              <CardDescription>Most frequently observed species</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Sightings",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[400px]"
              >
                <BarChart data={speciesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="species" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Species Details</CardTitle>
              <CardDescription>Detailed breakdown by species</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {speciesData.map((species) => (
                  <div key={species.species} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{species.species}</span>
                        <span className="text-sm text-muted-foreground">
                          {species.count} sightings ({species.percentage}%)
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
              <CardTitle>Time of Day Analysis</CardTitle>
              <CardDescription>Wildlife activity by time period</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Incidents",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <BarChart data={timeOfDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Morning Peak</span>
                    <span className="text-sm text-muted-foreground">08:00 - 12:00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Afternoon Peak</span>
                    <span className="text-sm text-muted-foreground">12:00 - 16:00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Low Activity</span>
                    <span className="text-sm text-muted-foreground">00:00 - 04:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spring Migration</span>
                      <span className="font-medium">High Activity</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-chart-5 h-2 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Summer</span>
                      <span className="font-medium">Moderate Activity</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-chart-4 h-2 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fall Migration</span>
                      <span className="font-medium">Very High Activity</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-destructive h-2 rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Winter</span>
                      <span className="font-medium">Low Activity</span>
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
              <CardTitle>Incidents by Location</CardTitle>
              <CardDescription>High-risk areas requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  incidents: {
                    label: "Incidents",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="location" type="category" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="incidents" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Risk Assessment</CardTitle>
              <CardDescription>Priority areas for wildlife management</CardDescription>
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
                        <span className="text-sm text-muted-foreground">{location.incidents} incidents</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(location.incidents / 45) * 100}%` }}
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
