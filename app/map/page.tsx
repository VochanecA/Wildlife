// app/map/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Layers, ZoomIn, ZoomOut, Locate, Eye, Navigation, Calendar, User, Clock, AlertTriangle, FileText } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import dynamic from 'next/dynamic'

// Use the simple map component instead
const SimpleMap = dynamic(() => import('./SimpleMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-semibold">Učitavanje mape...</p>
      </div>
    </div>
  )
})

interface MapMarker {
  id: string
  type: "sighting" | "hazard" | "task"
  lat: number
  lng: number
  title: string
  description?: string
  severity?: string
  priority?: string
  location?: string
  species?: string
  count?: number
  timestamp: Date
  status?: string
  created_by?: string
  originalData?: any // Store original data for detailed view
}

export default function MapPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSightings, setShowSightings] = useState(true)
  const [showHazards, setShowHazards] = useState(true)
  const [showTasks, setShowTasks] = useState(true)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.6413, -73.7781])
  const [userProfiles, setUserProfiles] = useState<{[key: string]: string}>({})

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch data from Supabase
        const { data: sightings, error: sightingsError } = await supabase
          .from("wildlife_sightings")
          .select("*")
          .order("created_at", { ascending: false })

        const { data: hazards, error: hazardsError } = await supabase
          .from("hazard_reports")
          .select("*")
          .order("created_at", { ascending: false })

        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false })

        if (sightingsError || hazardsError || tasksError) {
          throw new Error(sightingsError?.message || hazardsError?.message || tasksError?.message)
        }

        // Get user profiles for created_by information
        const userIds = new Set<string>()
        sightings?.forEach(s => s.user_id && userIds.add(s.user_id))
        hazards?.forEach(h => h.user_id && userIds.add(h.user_id))
        tasks?.forEach(t => t.user_id && userIds.add(t.user_id))

        if (userIds.size > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", Array.from(userIds))

          if (profiles) {
            const profilesMap: {[key: string]: string} = {}
            profiles.forEach(profile => {
              profilesMap[profile.id] = profile.full_name || "Nepoznato"
            })
            setUserProfiles(profilesMap)
          }
        }

        // Transform data to map markers
        const mapMarkers: MapMarker[] = []

        // Add sightings markers
        sightings?.forEach(sighting => {
          if (sighting.latitude && sighting.longitude) {
            mapMarkers.push({
              id: `sighting-${sighting.id}`,
              type: "sighting",
              lat: Number(sighting.latitude),
              lng: Number(sighting.longitude),
              title: sighting.species,
              description: sighting.notes,
              severity: sighting.severity,
              species: sighting.species,
              count: sighting.count,
              location: sighting.location,
              timestamp: new Date(sighting.created_at),
              created_by: userProfiles[sighting.user_id] || "Nepoznato",
              originalData: sighting
            })
          } else if (sighting.location) {
            const approximateCoords = getApproximateCoordinates(sighting.location)
            if (approximateCoords) {
              mapMarkers.push({
                id: `sighting-${sighting.id}`,
                type: "sighting",
                lat: approximateCoords.lat,
                lng: approximateCoords.lng,
                title: sighting.species,
                description: sighting.notes,
                severity: sighting.severity,
                species: sighting.species,
                count: sighting.count,
                location: sighting.location,
                timestamp: new Date(sighting.created_at),
                created_by: userProfiles[sighting.user_id] || "Nepoznato",
                originalData: sighting
              })
            }
          }
        })

        // Add hazard markers
        hazards?.forEach(hazard => {
          if (hazard.latitude && hazard.longitude) {
            mapMarkers.push({
              id: `hazard-${hazard.id}`,
              type: "hazard",
              lat: Number(hazard.latitude),
              lng: Number(hazard.longitude),
              title: hazard.title,
              description: hazard.description,
              severity: hazard.severity,
              priority: hazard.priority,
              location: hazard.location,
              timestamp: new Date(hazard.created_at),
              created_by: userProfiles[hazard.user_id] || "Nepoznato",
              originalData: hazard
            })
          } else if (hazard.location) {
            const approximateCoords = getApproximateCoordinates(hazard.location)
            if (approximateCoords) {
              mapMarkers.push({
                id: `hazard-${hazard.id}`,
                type: "hazard",
                lat: approximateCoords.lat,
                lng: approximateCoords.lng,
                title: hazard.title,
                description: hazard.description,
                severity: hazard.severity,
                priority: hazard.priority,
                location: hazard.location,
                timestamp: new Date(hazard.created_at),
                created_by: userProfiles[hazard.user_id] || "Nepoznato",
                originalData: hazard
              })
            }
          }
        })

        // Add task markers
        tasks?.forEach(task => {
          const airportCoords = getAirportAreaCoordinates()
          mapMarkers.push({
            id: `task-${task.id}`,
            type: "task",
            lat: airportCoords.lat + (Math.random() - 0.5) * 0.02,
            lng: airportCoords.lng + (Math.random() - 0.5) * 0.02,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            timestamp: new Date(task.created_at),
            created_by: userProfiles[task.user_id] || "Nepoznato",
            originalData: task
          })
        })

        setMarkers(mapMarkers)

        if (mapMarkers.length > 0) {
          const firstMarker = mapMarkers[0]
          setMapCenter([firstMarker.lat, firstMarker.lng])
        }

      } catch (err) {
        console.error("Error fetching map data:", err)
        setError(err instanceof Error ? err.message : "Došlo je do greške pri učitavanju podataka")
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
  }, [])

  // Helper functions
  const getApproximateCoordinates = (location: string) => {
    const locationMap: { [key: string]: { lat: number; lng: number } } = {
      'pista 27': { lat: 40.6413, lng: -73.7781 },
      'pista 31': { lat: 40.6450, lng: -73.7750 },
      'rolna staza b': { lat: 40.6420, lng: -73.7800 },
      'terminal': { lat: 40.6430, lng: -73.7820 },
      'hangar 3': { lat: 40.6440, lng: -73.7760 },
      'sjeverno polje': { lat: 40.6470, lng: -73.7720 },
      'južno polje': { lat: 40.6380, lng: -73.7850 },
      'istočni perimetar': { lat: 40.6410, lng: -73.7700 },
      'zapadni perimetar': { lat: 40.6410, lng: -73.7900 },
    }
    const normalizedLocation = location.toLowerCase()
    return locationMap[normalizedLocation] || null
  }

  const getAirportAreaCoordinates = () => {
    return { lat: 40.6413, lng: -73.7781 }
  }

  const filteredMarkers = markers.filter((marker) => {
    if (marker.type === "sighting" && !showSightings) return false
    if (marker.type === "hazard" && !showHazards) return false
    if (marker.type === "task" && !showTasks) return false
    return true
  })

  const getMarkerColor = (marker: MapMarker) => {
    if (marker.type === "sighting") return "bg-chart-1"
    if (marker.type === "hazard") return "bg-destructive"
    if (marker.type === "task") return "bg-chart-3"
    return "bg-muted"
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground"
      case "high": return "bg-chart-5 text-white"
      case "medium": return "bg-chart-4 text-white"
      case "low": return "bg-chart-3 text-white"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive text-destructive-foreground"
      case "high": return "bg-chart-5 text-white"
      case "medium": return "bg-chart-4 text-white"
      case "low": return "bg-chart-3 text-white"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed": return "bg-chart-3 text-white"
      case "in_progress": return "bg-chart-4 text-white"
      case "pending": return "bg-chart-5 text-white"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker)
    setMapCenter([marker.lat, marker.lng])
  }

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "completed": return "Završeno"
      case "in_progress": return "U toku"
      case "pending": return "Na čekanju"
      case "open": return "Otvoreno"
      case "resolved": return "Riješeno"
      case "closed": return "Zatvoreno"
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pregled Mape</h1>
            <p className="text-muted-foreground">Geografska vizuelizacija aktivnosti divljači</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Pregled Mape</h1>
            <p className="text-muted-foreground">Geografska vizuelizacija aktivnosti divljači</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pregled Mape</h1>
          <p className="text-muted-foreground">Geografska vizuelizacija aktivnosti divljači</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>{filteredMarkers.length} lokacija prikazano</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Slojevi Mape</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sightings" 
                  checked={showSightings} 
                  onCheckedChange={(checked) => setShowSightings(checked as boolean)} 
                />
                <Label htmlFor="sightings" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-3 h-3 rounded-full bg-chart-1" />
                  Zapažanja Divljači ({markers.filter(m => m.type === 'sighting').length})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hazards" 
                  checked={showHazards} 
                  onCheckedChange={(checked) => setShowHazards(checked as boolean)} 
                />
                <Label htmlFor="hazards" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  Izvještaji o Opasnostima ({markers.filter(m => m.type === 'hazard').length})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tasks" 
                  checked={showTasks} 
                  onCheckedChange={(checked) => setShowTasks(checked as boolean)} 
                />
                <Label htmlFor="tasks" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-3 h-3 rounded-full bg-chart-3" />
                  Zadaci ({markers.filter(m => m.type === 'task').length})
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-1" />
                <span className="text-sm">Zapažanja Divljači</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-sm">Izvještaji o Opasnostima</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-3" />
                <span className="text-sm">Zakazani Zadaci</span>
              </div>
            </CardContent>
          </Card>

          {selectedMarker && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {selectedMarker.type === "sighting" && <FileText className="w-4 h-4" />}
                  {selectedMarker.type === "hazard" && <AlertTriangle className="w-4 h-4" />}
                  {selectedMarker.type === "task" && <Clock className="w-4 h-4" />}
                  Detalji Lokacije
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedMarker.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="capitalize">
                      {selectedMarker.type === "sighting" && "Zapažanje Divljači"}
                      {selectedMarker.type === "hazard" && "Izvještaj o Opasnosti"}
                      {selectedMarker.type === "task" && "Zadatak"}
                    </Badge>
                    {selectedMarker.severity && (
                      <Badge className={getSeverityColor(selectedMarker.severity)}>
                        {selectedMarker.severity === "critical" && "Kritično"}
                        {selectedMarker.severity === "high" && "Visoko"}
                        {selectedMarker.severity === "medium" && "Srednje"}
                        {selectedMarker.severity === "low" && "Nisko"}
                      </Badge>
                    )}
                    {selectedMarker.priority && (
                      <Badge className={getPriorityColor(selectedMarker.priority)}>
                        {selectedMarker.priority === "urgent" && "Hitan"}
                        {selectedMarker.priority === "high" && "Visok"}
                        {selectedMarker.priority === "medium" && "Srednji"}
                        {selectedMarker.priority === "low" && "Nizak"}
                      </Badge>
                    )}
                    {selectedMarker.status && (
                      <Badge className={getStatusColor(selectedMarker.status)}>
                        {getStatusText(selectedMarker.status)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="space-y-3">
                  {selectedMarker.description && (
                    <div>
                      <p className="text-sm font-medium mb-1">Opis:</p>
                      <p className="text-sm text-muted-foreground">{selectedMarker.description}</p>
                    </div>
                  )}

                  {selectedMarker.species && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Vrsta:</p>
                        <p className="text-sm text-muted-foreground">{selectedMarker.species}</p>
                      </div>
                    </div>
                  )}

                  {selectedMarker.count && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Broj jedinki:</p>
                        <p className="text-sm text-muted-foreground">{selectedMarker.count}</p>
                      </div>
                    </div>
                  )}

                  {selectedMarker.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Lokacija:</p>
                        <p className="text-sm text-muted-foreground">{selectedMarker.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Datum i vrijeme:</p>
                      <p className="text-sm text-muted-foreground">{selectedMarker.timestamp.toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedMarker.created_by && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Kreirao/la:</p>
                        <p className="text-sm text-muted-foreground">{selectedMarker.created_by}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Koordinate:</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {selectedMarker.lat.toFixed(6)}, {selectedMarker.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => openInGoogleMaps(selectedMarker.lat, selectedMarker.lng)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Google Maps
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Center map on this marker
                      setMapCenter([selectedMarker.lat, selectedMarker.lng])
                    }}
                  >
                    <Locate className="w-4 h-4 mr-2" />
                    Centriraj
                  </Button>
                </div>

                {/* Additional details for specific types */}
                {selectedMarker.type === "sighting" && selectedMarker.originalData && (
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">Dodatni podaci o zapažanju:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">ID:</span>
                        <p className="font-mono">{selectedMarker.originalData.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Kreirano:</span>
                        <p>{new Date(selectedMarker.originalData.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {filteredMarkers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lista Lokacija</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {filteredMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    className="flex items-center gap-3 p-2 bg-background rounded-lg border cursor-pointer hover:bg-accent transition-colors text-sm"
                    onClick={() => handleMarkerClick(marker)}
                  >
                    <div className={`w-2 h-2 rounded-full ${getMarkerColor(marker)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{marker.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {marker.type === 'sighting' && 'Zapažanje'}
                        {marker.type === 'hazard' && 'Opasnost'}
                        {marker.type === 'task' && 'Zadatak'}
                      </p>
                    </div>
                    {marker.severity && (
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(marker.severity)}`} />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card className="h-[700px]">
            <CardContent className="p-0 h-full">
              <SimpleMap 
                markers={filteredMarkers || []} 
                center={mapCenter}
                onMarkerClick={handleMarkerClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}