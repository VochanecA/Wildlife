import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { NewSightingDialog } from "@/components/new-sighting-dialog"
import { SightingsSearch } from "@/components/sightings-search"
import { Bird } from "@/components/bird-icon" // Declare the Bird variable

export default async function SightingsPage() {
  const supabase = await createClient()

  // Fetch all sightings with user profiles
  const { data: sightings } = await supabase
    .from("wildlife_sightings")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wildlife Sightings</h1>
          <p className="text-muted-foreground">Record and track wildlife observations</p>
        </div>
        <NewSightingDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Sighting
          </Button>
        </NewSightingDialog>
      </div>

      <SightingsSearch />

      <div className="grid gap-4">
        {sightings && sightings.length > 0 ? (
          sightings.map((sighting) => (
            <Card key={sighting.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{sighting.species}</CardTitle>
                    <CardDescription>{sighting.location}</CardDescription>
                  </div>
                  <Badge className={getSeverityColor(sighting.severity)}>{sighting.severity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Count:</span>
                      <span className="font-medium">{sighting.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reported by:</span>
                      <span className="font-medium">{sighting.profiles?.full_name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{new Date(sighting.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {sighting.latitude && sighting.longitude && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Coordinates:</span>
                        <span className="font-medium">
                          {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {sighting.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm">{sighting.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bird className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No sightings recorded yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start by recording your first wildlife sighting</p>
              <NewSightingDialog>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Record First Sighting
                </Button>
              </NewSightingDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
