"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Layers, ZoomIn, ZoomOut, Locate } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface MapMarker {
  id: string
  type: "sighting" | "hazard" | "task"
  lat: number
  lng: number
  title: string
  severity?: string
  timestamp: Date
}

const mockMarkers: MapMarker[] = [
  {
    id: "1",
    type: "sighting",
    lat: 40.6413,
    lng: -73.7781,
    title: "Canada Geese - 15 birds",
    severity: "high",
    timestamp: new Date("2025-01-20T08:30:00"),
  },
  {
    id: "2",
    type: "hazard",
    lat: 40.6415,
    lng: -73.7788,
    title: "Nesting birds in hangar",
    severity: "high",
    timestamp: new Date("2025-01-19T14:30:00"),
  },
  {
    id: "3",
    type: "sighting",
    lat: 40.6425,
    lng: -73.7795,
    title: "Red-tailed Hawk",
    severity: "medium",
    timestamp: new Date("2025-01-20T10:15:00"),
  },
  {
    id: "4",
    type: "task",
    lat: 40.6435,
    lng: -73.7802,
    title: "Perimeter inspection",
    timestamp: new Date("2025-01-21T08:00:00"),
  },
]

export default function MapPage() {
  const [markers] = useState<MapMarker[]>(mockMarkers)
  const [showSightings, setShowSightings] = useState(true)
  const [showHazards, setShowHazards] = useState(true)
  const [showTasks, setShowTasks] = useState(true)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)

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
      case "critical":
        return "bg-destructive text-destructive-foreground"
      case "high":
        return "bg-chart-5 text-white"
      case "medium":
        return "bg-chart-4 text-white"
      case "low":
        return "bg-chart-3 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Map View</h1>
          <p className="text-muted-foreground">Geographic visualization of wildlife activity</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Map Layers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="sightings" checked={showSightings} onCheckedChange={setShowSightings} />
                <Label htmlFor="sightings" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-3 h-3 rounded-full bg-chart-1" />
                  Wildlife Sightings
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="hazards" checked={showHazards} onCheckedChange={setShowHazards} />
                <Label htmlFor="hazards" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  Hazard Reports
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="tasks" checked={showTasks} onCheckedChange={setShowTasks} />
                <Label htmlFor="tasks" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-3 h-3 rounded-full bg-chart-3" />
                  Scheduled Tasks
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Map Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom In
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom Out
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Locate className="w-4 h-4 mr-2" />
                Center Map
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Layers className="w-4 h-4 mr-2" />
                Change Base Layer
              </Button>
            </CardContent>
          </Card>

          {selectedMarker && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{selectedMarker.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">{selectedMarker.type}</p>
                </div>
                {selectedMarker.severity && (
                  <Badge className={getSeverityColor(selectedMarker.severity)}>{selectedMarker.severity}</Badge>
                )}
                <div className="text-sm">
                  <p className="text-muted-foreground">Coordinates:</p>
                  <p className="font-mono text-xs">
                    {selectedMarker.lat.toFixed(4)}, {selectedMarker.lng.toFixed(4)}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Time:</p>
                  <p>{selectedMarker.timestamp.toLocaleString()}</p>
                </div>
                <Button className="w-full" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card className="h-[700px]">
            <CardContent className="p-0 h-full relative">
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <MapPin className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">OpenStreetMap Integration</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Interactive map showing wildlife sightings, hazard locations, and scheduled tasks across the
                      airport. In production, this would display a full OpenStreetMap interface with markers for each
                      location.
                    </p>
                  </div>
                  <div className="grid gap-4 max-w-2xl mx-auto mt-8">
                    {filteredMarkers.map((marker) => (
                      <div
                        key={marker.id}
                        className="flex items-center gap-3 p-3 bg-background rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setSelectedMarker(marker)}
                      >
                        <div className={`w-3 h-3 rounded-full ${getMarkerColor(marker)}`} />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm">{marker.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                          </p>
                        </div>
                        {marker.severity && (
                          <Badge className={getSeverityColor(marker.severity)} variant="outline">
                            {marker.severity}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
