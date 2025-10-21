"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewHazardDialog } from "@/components/new-hazard-dialog"
import type { HazardReport } from "@/lib/types"

const mockHazards: HazardReport[] = [
  {
    id: "1",
    type: "wildlife",
    description: "Nesting birds observed in hangar roof structure",
    location: "Hangar 3",
    coordinates: { lat: 40.6415, lng: -73.7788 },
    severity: "high",
    status: "in_progress",
    reportedBy: "John Smith",
    assignedTo: "Mike Chen",
    timestamp: new Date("2025-01-19T14:30:00"),
    actions: ["Inspection scheduled", "Nest removal planned for off-season"],
  },
  {
    id: "2",
    type: "habitat",
    description: "Standing water creating attractant for waterfowl",
    location: "North Field - Drainage Area",
    coordinates: { lat: 40.6435, lng: -73.7802 },
    severity: "medium",
    status: "open",
    reportedBy: "Sarah Johnson",
    timestamp: new Date("2025-01-20T09:15:00"),
    actions: [],
  },
  {
    id: "3",
    type: "attractant",
    description: "Food waste near terminal attracting gulls and crows",
    location: "Terminal 2 - Loading Area",
    coordinates: { lat: 40.6398, lng: -73.7758 },
    severity: "critical",
    status: "open",
    reportedBy: "Mike Chen",
    timestamp: new Date("2025-01-20T11:00:00"),
    actions: [],
  },
  {
    id: "4",
    type: "wildlife",
    description: "Deer tracks observed near perimeter fence",
    location: "East Perimeter - Section 7",
    coordinates: { lat: 40.6442, lng: -73.7745 },
    severity: "high",
    status: "resolved",
    reportedBy: "Sarah Johnson",
    assignedTo: "John Smith",
    timestamp: new Date("2025-01-18T16:20:00"),
    resolvedAt: new Date("2025-01-19T10:00:00"),
    actions: ["Fence inspection completed", "Breach repaired", "Additional monitoring scheduled"],
  },
]

export default function HazardsPage() {
  const [hazards] = useState<HazardReport[]>(mockHazards)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const filteredHazards = hazards.filter((hazard) => {
    const matchesSearch =
      hazard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hazard.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "open" && hazard.status === "open") ||
      (activeTab === "in_progress" && hazard.status === "in_progress") ||
      (activeTab === "resolved" && (hazard.status === "resolved" || hazard.status === "closed"))

    return matchesSearch && matchesTab
  })

  const getSeverityColor = (severity: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "in_progress":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20"
      case "resolved":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "closed":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hazard Reports</h1>
          <p className="text-muted-foreground">Track and manage wildlife hazards</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Hazard Report
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search hazards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredHazards.map((hazard) => (
              <Card key={hazard.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{hazard.description}</CardTitle>
                      </div>
                      <CardDescription>{hazard.location}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(hazard.severity)}>{hazard.severity}</Badge>
                      <Badge variant="outline" className={getStatusColor(hazard.status)}>
                        {hazard.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{hazard.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reported by:</span>
                        <span className="font-medium">{hazard.reportedBy}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reported:</span>
                        <span className="font-medium">{hazard.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {hazard.assignedTo && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Assigned to:</span>
                          <span className="font-medium">{hazard.assignedTo}</span>
                        </div>
                      )}
                      {hazard.resolvedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Resolved:</span>
                          <span className="font-medium">{hazard.resolvedAt.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {hazard.actions && hazard.actions.length > 0 && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-2">Actions Taken:</p>
                      <ul className="text-sm space-y-1">
                        {hazard.actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <NewHazardDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
