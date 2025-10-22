import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { NewSightingDialog } from "@/components/new-sighting-dialog"
import { SightingStatusDropdown } from "@/components/sighting-status-dropdown"

export default async function SightingsPage() {
  const supabase = await createClient()

  // Preuzmi sva zapažanja bez join-ova
  const { data: sightings, error } = await supabase
    .from("wildlife_sightings")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching sightings:", error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Zapažanja Divljači</h1>
            <p className="text-muted-foreground">Evidentirajte i pratite opažanja divljači</p>
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
  if (!sightings || sightings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Zapažanja Divljači</h1>
            <p className="text-muted-foreground">Evidentirajte i pratite opažanja divljači</p>
          </div>
          <NewSightingDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Zapažanje
            </Button>
          </NewSightingDialog>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">Još uvijek nema zabeleženih zapažanja</p>
            <p className="text-sm text-muted-foreground mb-4">Započnite evidentiranjem vašeg prvog zapažanja divljači</p>
            <NewSightingDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Evidentiraj Prvo Zapažanje
              </Button>
            </NewSightingDialog>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch user profiles separately to get names
  const userIds = [...new Set(sightings.map(s => s.user_id).filter(Boolean))] as string[]
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zapažanja Divljači</h1>
          <p className="text-muted-foreground">Evidentirajte i pratite opažanja divljači</p>
        </div>
        <NewSightingDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Zapažanje
          </Button>
        </NewSightingDialog>
      </div>

      <div className="grid gap-4">
        {sightings.map((sighting) => (
          <Card key={sighting.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{sighting.species}</CardTitle>
                  </div>
                  <CardDescription>{sighting.location}</CardDescription>
                </div>
                <SightingStatusDropdown 
                  sightingId={sighting.id} 
                  currentSeverity={sighting.severity} 
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Broj:</span>
                    <span className="font-medium">{sighting.count} jedinki</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Prijavio:</span>
                    <span className="font-medium">
                      {userProfiles[sighting.user_id]?.full_name || "Nepoznato"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Vrijeme:</span>
                    <span className="font-medium">{new Date(sighting.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {sighting.latitude && sighting.longitude && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Koordinate:</span>
                      <span className="font-medium font-mono text-xs">
                        {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {sighting.notes && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Napomene:</p>
                  <p className="text-sm text-muted-foreground">{sighting.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}