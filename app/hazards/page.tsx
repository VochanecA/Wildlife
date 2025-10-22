import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewHazardDialog } from "@/components/new-hazard-dialog"
import { HazardStatusDropdown } from "@/components/hazard-status-dropdown"
import { Plus, Search, Filter, Clock, User, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function HazardsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const searchQuery = typeof params.search === 'string' ? params.search : ''
  const activeTab = typeof params.tab === 'string' ? params.tab : 'all'

  // Fetch hazard reports without joins first to avoid relationship errors
  const { data: hazards, error } = await supabase
    .from("hazard_reports")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching hazards:", error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Izvještaji o Opasnostima</h1>
            <p className="text-muted-foreground">Pratite i upravljajte opasnostima od divljači</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2 text-destructive">Greška pri učitavanju podataka</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no data, show empty state
  if (!hazards || hazards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Izvještaji o Opasnostima</h1>
            <p className="text-muted-foreground">Pratite i upravljajte opasnostima od divljači</p>
          </div>
          <NewHazardDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novi Izvještaj o Opasnosti
            </Button>
          </NewHazardDialog>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2">Nema izvještaja o opasnostima</p>
            <p className="text-sm text-muted-foreground mb-4">Započnite prijavom prve opasnosti</p>
            <NewHazardDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Prijavi Prvu Opasnost
              </Button>
            </NewHazardDialog>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch user profiles separately to get names
  const userIds = [...new Set(hazards.map(h => [h.user_id, h.assigned_to]).flat().filter(Boolean))] as string[]
  let userProfiles: { [key: string]: { full_name: string } } = {}

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds)

    if (profiles) {
      userProfiles = profiles.reduce((acc, profile) => {
        acc[profile.id] = { full_name: profile.full_name }
        return acc
      }, {} as { [key: string]: { full_name: string } })
    }
  }

  // Filter hazards based on search query and active tab
  const filteredHazards = hazards.filter((hazard) => {
    const matchesSearch =
      hazard.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hazard.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hazard.title?.toLowerCase().includes(searchQuery.toLowerCase())

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
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
          <h1 className="text-3xl font-bold tracking-tight">Izvještaji o Opasnostima</h1>
          <p className="text-muted-foreground">Pratite i upravljajte opasnostima od divljači</p>
        </div>
        <NewHazardDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novi Izvještaj o Opasnosti
          </Button>
        </NewHazardDialog>
      </div>

      <div className="flex gap-4">
        <form className="relative flex-1" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Pretraži opasnosti..."
            defaultValue={searchQuery}
            className="pl-9"
          />
          <input type="hidden" name="tab" value={activeTab} />
        </form>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filteri
        </Button>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all" asChild>
            <a href="?tab=all">Svi</a>
          </TabsTrigger>
          <TabsTrigger value="open" asChild>
            <a href="?tab=open">Otvoreni</a>
          </TabsTrigger>
          <TabsTrigger value="in_progress" asChild>
            <a href="?tab=in_progress">U toku</a>
          </TabsTrigger>
          <TabsTrigger value="resolved" asChild>
            <a href="?tab=resolved">Riješeni</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredHazards.length > 0 ? (
              filteredHazards.map((hazard) => (
                <Card key={hazard.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{hazard.title}</CardTitle>
                        </div>
                        <CardDescription>{hazard.description}</CardDescription>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {hazard.location}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-col items-end">
                        <Badge className={getSeverityColor(hazard.severity)}>
                          {hazard.severity === "critical" && "Kritično"}
                          {hazard.severity === "high" && "Visoko"}
                          {hazard.severity === "medium" && "Srednje"}
                          {hazard.severity === "low" && "Nisko"}
                        </Badge>
                        <Badge className={getPriorityColor(hazard.priority)}>
                          {hazard.priority === "urgent" && "Hitan"}
                          {hazard.priority === "high" && "Visok"}
                          {hazard.priority === "medium" && "Srednji"}
                          {hazard.priority === "low" && "Nizak"}
                        </Badge>
                        <HazardStatusDropdown 
                          hazardId={hazard.id} 
                          currentStatus={hazard.status} 
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Prijavio:</span>
                          <span className="font-medium">
                            {userProfiles[hazard.user_id]?.full_name || "Nepoznato"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Prijavljeno:</span>
                          <span className="font-medium">{new Date(hazard.created_at).toLocaleString()}</span>
                        </div>
                        {hazard.latitude && hazard.longitude && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Koordinate:</span>
                            <span className="font-medium font-mono text-xs">
                              {hazard.latitude.toFixed(4)}, {hazard.longitude.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {hazard.assigned_to && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Dodijeljeno:</span>
                            <span className="font-medium">
                              {userProfiles[hazard.assigned_to]?.full_name || "Nepoznato"}
                            </span>
                          </div>
                        )}
                        {hazard.resolved_at && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Riješeno:</span>
                            <span className="font-medium">{new Date(hazard.resolved_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg font-medium mb-2">Nema pronađenih izvještaja o opasnostima</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? "Pokušajte sa drugim pojmovima pretrage" : "Započnite prijavom prve opasnosti"}
                  </p>
                  <NewHazardDialog>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Prijavi Prvu Opasnost
                    </Button>
                  </NewHazardDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}