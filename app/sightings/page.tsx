import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { NewSightingDialog } from "@/components/new-sighting-dialog"
import { SightingStatusDropdown } from "@/components/sighting-status-dropdown"
import { SearchForm } from "./search-form"

interface SearchParams {
  search?: string
  location?: string
  species?: string
  date?: string
}

interface SightingsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function SightingsPage({ searchParams }: SightingsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Kreiraj query za pretragu
  let query = supabase
    .from("wildlife_sightings")
    .select("*")

  // Primjeni filtere ako postoje
  if (params.search) {
    query = query.or(`species.ilike.%${params.search}%,location.ilike.%${params.search}%,notes.ilike.%${params.search}%`)
  }
  
  if (params.location) {
    query = query.ilike('location', `%${params.location}%`)
  }
  
  if (params.date) {
    const startDate = new Date(params.date)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)
    
    query = query.gte('created_at', startDate.toISOString())
    query = query.lt('created_at', endDate.toISOString())
  }
  
  if (params.species) {
    query = query.ilike('species', `%${params.species}%`)
  }

  const { data: sightings, error } = await query
    .order("created_at", { ascending: false })

  // Dohvati sva zapažanja za statistiku (bez filtera)
  const { data: allSightings } = await supabase
    .from("wildlife_sightings")
    .select("*")

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

        {/* Search Form */}
        <SearchForm searchParams={params} />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">Nema pronađenih zapažanja</p>
            <p className="text-sm text-muted-foreground mb-4">Pokušajte da promijenite kriterijume pretrage</p>
            <NewSightingDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Evidentiraj Novo Zapažanje
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

  // Izračunaj statistiku za trenutne rezultate pretrage
  const statistics = calculateStatistics(sightings)

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

      {/* Search Form */}
      <SearchForm searchParams={params} />

      {/* Statistics Card */}
      <StatisticsCard statistics={statistics} totalSightings={allSightings?.length || 0} />

      <div className="grid gap-4">
        {sightings.map((sighting) => (
          <Card key={sighting.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{sighting.species}</CardTitle>
                    <Badge variant="outline">{sighting.severity}</Badge>
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

// Statistics Card komponenta
function StatisticsCard({ statistics, totalSightings }: { 
  statistics: ReturnType<typeof calculateStatistics>,
  totalSightings: number 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistika Zapažanja</CardTitle>
        <CardDescription>
          Pregled pronađenih zapažanja po kriterijumima pretrage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="text-2xl font-bold">{statistics.totalCount}</div>
            <div className="text-sm text-muted-foreground">Ukupno zapažanja</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{statistics.totalAnimals}</div>
            <div className="text-sm text-muted-foreground">Ukupno jedinki</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{statistics.uniqueSpecies}</div>
            <div className="text-sm text-muted-foreground">Različitih vrsta</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {totalSightings > 0 ? ((statistics.totalCount / totalSightings) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Od ukupnih zapažanja</div>
          </div>
        </div>

        {/* Top vrste */}
        {statistics.speciesBreakdown.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Raspodjela po vrstama:</h4>
            <div className="space-y-2">
              {statistics.speciesBreakdown.slice(0, 5).map((species, index) => (
                <div key={species.species} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <span className="text-sm">{species.species}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{species.count} zapaž.</span>
                    <span className="text-xs text-muted-foreground">
                      ({((species.count / statistics.totalCount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Funkcija za izračun statistike
function calculateStatistics(sightings: any[]) {
  const totalCount = sightings.length
  const totalAnimals = sightings.reduce((sum, sighting) => sum + (sighting.count || 0), 0)
  
  const uniqueSpecies = [...new Set(sightings.map(s => s.species))].length
  
  // Raspodjela po vrstama
  const speciesCount: { [key: string]: number } = {}
  sightings.forEach(sighting => {
    speciesCount[sighting.species] = (speciesCount[sighting.species] || 0) + 1
  })
  
  const speciesBreakdown = Object.entries(speciesCount)
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalCount,
    totalAnimals,
    uniqueSpecies,
    speciesBreakdown
  }
}