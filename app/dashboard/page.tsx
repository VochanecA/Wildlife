import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bird, AlertTriangle, CheckSquare, TrendingUp, Brain, User, Calendar, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { WildlifeAIChatCard } from "@/components/wildlife-ai-chat-card"
import { DailyAnalysisCard } from "@/components/daily-analysis-card"
import { NewHazardDialog } from "@/components/new-hazard-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { NewSightingDialog } from "@/components/new-sighting-dialog"
import Link from "next/link"
import { WeatherCard } from "@/components/weather-card"
import { ExtendedForecast } from "@/components/extended-forecast"
import { getWeatherData, getExtendedForecast } from "@/lib/weather"


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

  // Fetch weather data na serveru
  const weatherData = await getWeatherData()
  const forecastData = await getExtendedForecast()

  const stats = [
    {
      title: "Posmatranja Divljih Životinja",
      value: sightingsCount?.toString() || "0",
      change: "Ukupno zabilježeno",
      icon: Bird,
      color: "text-blue-600",
      bgGradient: "from-blue-500 to-blue-600",
      href: "/sightings"
    },
    {
      title: "Aktivne Opasnosti",
      value: activeHazardsCount?.toString() || "0",
      change: "Zahtijeva pažnju",
      icon: AlertTriangle,
      color: "text-red-600",
      bgGradient: "from-red-500 to-orange-600",
      href: "/hazards"
    },
    {
      title: "Neodrađeni Zadaci",
      value: pendingTasksCount?.toString() || "0",
      change: "Čeka izvršenje",
      icon: CheckSquare,
      color: "text-green-600",
      bgGradient: "from-green-500 to-emerald-600",
      href: "/tasks"
    },
    {
      title: "AI Asistent",
      value: "Dostupan",
      change: "Spreman za pomoć",
      icon: Brain,
      color: "text-purple-600",
      bgGradient: "from-purple-500 to-indigo-600",
      href: "#"
    },
  ]

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Dobrodošao nazad, {profile?.full_name || user?.email} 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Evo pregleda aktivnosti upravljanja divljim životinjama na Aerodromu Tivat
            </p>
          </div>
          <div className="flex items-center space-x-3">
        
            <div className="bg-white/20 p-3 rounded-full">
              <User className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid sa Weather */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <WeatherCard initialData={weatherData} />
        </div>
        
        {stats.map((stat) => (
          <Link 
            key={stat.title} 
            href={stat.href}
            className="block"
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.bgGradient} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.bgGradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Skorašnja Aktivnost */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <div>
                <CardTitle className="text-white">Skorašnja Aktivnost</CardTitle>
                <CardDescription className="text-blue-100">
                  Najnoviji događaji upravljanja divljim životinjama
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {recentSightings && recentSightings.length > 0 ? (
                recentSightings.map((sighting) => (
                  <div key={sighting.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-3 h-3 mt-1.5 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-800">
                        {sighting.species} zabilježeno na {sighting.location}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {sighting.severity}
                        </span>
                        <span>{new Date(sighting.created_at).toLocaleString()}</span>
                      </div>
                      {sighting.notes && (
                        <p className="text-xs text-gray-600 mt-1">{sighting.notes}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bird className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nema skorašnje aktivnosti</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link 
                href="/sightings" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center"
              >
                Pogledaj sva zapažanja →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Uskoro Započeti Zadaci */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <div>
                <CardTitle className="text-white">Uskoro Započeti Zadaci</CardTitle>
                <CardDescription className="text-green-100">
                  Zadaci koji će uskoro početi
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {upcomingTasks && upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      task.priority === 'high' 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                        : task.priority === 'medium'
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      <CheckSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {task.due_date ? `Rok: ${new Date(task.due_date).toLocaleDateString()}` : "Bez roka"}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-700' 
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nema nadolazećih zadataka</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link 
                href="/tasks" 
                className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center justify-center"
              >
                Pogledaj sve zadatke →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* AI Asistent Card */}
        <Card className="border-0 shadow-lg p-0 overflow-hidden">
          <WildlifeAIChatCard />
        </Card>
      </div>

      {/* Daily Analysis i Extended Forecast */}
      <div className="grid gap-6 md:grid-cols-2">
        <DailyAnalysisCard />
        <ExtendedForecast initialData={forecastData} />
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Brze akcije</h3>
            <p className="text-sm text-gray-600">Odmah pristupi najvažnijim funkcijama</p>
          </div>
          <div className="flex space-x-3">
            <NewSightingDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Zapažanje
              </Button>
            </NewSightingDialog>
            <NewHazardDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novi Izvještaj o Opasnosti
              </Button>
            </NewHazardDialog>
          </div>
        </div>
      </div>
    </div>
  )
}