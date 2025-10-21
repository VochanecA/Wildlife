import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bird, AlertTriangle, CheckSquare, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  // Fetch statistics
  const { count: sightingsCount } = await supabase
    .from("wildlife_sightings")
    .select("*", { count: "exact", head: true })

  const { count: activeHazardsCount } = await supabase
    .from("hazard_reports")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "in_progress"])

  const { count: pendingTasksCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Fetch recent sightings
  const { data: recentSightings } = await supabase
    .from("wildlife_sightings")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(3)

  // Fetch upcoming tasks
  const { data: upcomingTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "pending")
    .order("due_date", { ascending: true })
    .limit(3)

const stats = [
  {
    title: "Posmatranja Divljih Životinja",
    value: sightingsCount?.toString() || "0",
    change: "Ukupno zabilježeno",
    icon: Bird,
    color: "text-chart-1",
  },
  {
    title: "Aktivne Opasnosti",
    value: activeHazardsCount?.toString() || "0",
    change: "Zahtijeva pažnju",
    icon: AlertTriangle,
    color: "text-destructive",
  },
  {
    title: "Neodrađeni Zadaci",
    value: pendingTasksCount?.toString() || "0",
    change: "Čeka izvršenje",
    icon: CheckSquare,
    color: "text-chart-2",
  },
  {
    title: "Odgovor Sistema",
    value: "94%",
    change: "Performanse sistema",
    icon: TrendingUp,
    color: "text-chart-3",
  },
]


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Dobrodošao nazad, {profile?.full_name || user?.email}
        </h1>
        <p className="text-muted-foreground">Evo pregleda aktivnosti upravljanja divljim životinjama</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skorašnja Aktivnost</CardTitle>
            <CardDescription>Najnoviji događaji upravljanja divljim životinjama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSightings && recentSightings.length > 0 ? (
                recentSightings.map((sighting) => (
                  <div key={sighting.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-chart-1" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {sighting.species} spotted at {sighting.location}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(sighting.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nema skorašnje aktivnosti</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uskoro Započeti Zadaci</CardTitle>
            <CardDescription>Zadaci koji će uskoro početi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks && upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <CheckSquare className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : "No due date"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nema nadolazećih zadataka</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
