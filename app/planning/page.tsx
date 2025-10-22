// app/planning/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewActivityPlanDialog } from "@/components/new-activity-plan-dialog"
import { Plus, CalendarIcon, Users, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const activeTab = typeof params.tab === 'string' ? params.tab : 'current'

  // Fetch activity plans
  const { data: plans, error } = await supabase
    .from("activity_plans")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching activity plans:", error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planiranje Aktivnosti</h1>
            <p className="text-muted-foreground">IATA sezonsko planiranje upravljanja divljači</p>
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

  // Fetch plan items for each plan
  let plansWithActivities: any[] = []
  
  if (plans && plans.length > 0) {
    const planIds = plans.map(plan => plan.id)
    const { data: planItems } = await supabase
      .from("activity_plan_items")
      .select("*")
      .in("plan_id", planIds)

    // Fetch user profiles for assigned_to
    const userIds = [...new Set([
      ...plans.map(p => p.user_id),
      ...(planItems ? planItems.map(item => item.assigned_to).filter(Boolean) : [])
    ].filter(Boolean))] as string[]

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

    // Combine plans with their activities
    plansWithActivities = plans.map(plan => ({
      ...plan,
      created_by: userProfiles[plan.user_id]?.full_name || "Nepoznato",
      activities: planItems?.filter(item => item.plan_id === plan.id).map(item => ({
        ...item,
        assigned_user: item.assigned_to ? userProfiles[item.assigned_to] : undefined
      })) || []
    }))
  }

  // Filter plans based on active tab
  const currentPlans = plansWithActivities.filter((plan) => plan.status === "active" || plan.status === "draft")
  const completedPlans = plansWithActivities.filter((plan) => plan.status === "completed")

  const getSeasonColor = (season: string) => {
    return season === "summer" ? "bg-chart-4 text-white" : "bg-chart-1 text-white"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-muted text-muted-foreground border-border"
      case "active":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "completed":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  // If no data, show empty state
  if (!plans || plans.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planiranje Aktivnosti</h1>
            <p className="text-muted-foreground">IATA sezonsko planiranje upravljanja divljači</p>
          </div>
          <NewActivityPlanDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novi Plan Aktivnosti
            </Button>
          </NewActivityPlanDialog>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2">Nema planova aktivnosti</p>
            <p className="text-sm text-muted-foreground mb-4">Započnite kreiranjem prvog sezonskog plana</p>
            <NewActivityPlanDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Kreiraj Prvi Plan
              </Button>
            </NewActivityPlanDialog>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planiranje Aktivnosti</h1>
          <p className="text-muted-foreground">IATA sezonsko planiranje upravljanja divljači</p>
        </div>
        <NewActivityPlanDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novi Plan Aktivnosti
          </Button>
        </NewActivityPlanDialog>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList>
          <TabsTrigger value="current" asChild>
            <a href="?tab=current">Trenutni Planovi</a>
          </TabsTrigger>
          <TabsTrigger value="completed" asChild>
            <a href="?tab=completed">Završeni Planovi</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <div className="grid gap-6">
            {currentPlans.length > 0 ? (
              currentPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-2xl capitalize">
                            {plan.season === "summer" ? "Ljetna" : "Zimska"} Sezona {plan.season_year}
                          </CardTitle>
                          <Badge className={getSeasonColor(plan.season)}>
                            {plan.season === "summer" ? "Ljeto" : "Zima"}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={getStatusColor(plan.status)}>
                        {plan.status === "draft" && "Nacrt"}
                        {plan.status === "active" && "Aktivan"}
                        {plan.status === "completed" && "Završen"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Trajanje:</span>
                        <span className="font-medium">
                          {Math.ceil((new Date(plan.end_date).getTime() - new Date(plan.start_date).getTime()) / (1000 * 60 * 60 * 24))} dana
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Aktivnosti:</span>
                        <span className="font-medium">{plan.activities.length}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Kreirao:</span>
                        <span className="font-medium">{plan.created_by}</span>
                      </div>
                    </div>

                    {plan.activities.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Aktivnosti</h4>
                        <div className="space-y-3">
                          {plan.activities.map((activity: any) => (
                            <div key={activity.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium mb-1">{activity.activity}</h5>
                                  {activity.notes && (
                                    <p className="text-sm text-muted-foreground">{activity.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="grid gap-2 md:grid-cols-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Dodijeljeno:</span>
                                  <span className="font-medium">
                                    {activity.assigned_user?.full_name || "Nije dodijeljeno"}
                                  </span>
                                </div>
                                {activity.duration && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Trajanje:</span>
                                    <span className="font-medium">{activity.duration}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Kreirano:</span>
                                  <span className="font-medium">{new Date(activity.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg font-medium mb-2">Nema trenutnih planova</p>
                  <p className="text-sm text-muted-foreground mb-4">Kreirajte novi sezonski plan aktivnosti</p>
                  <NewActivityPlanDialog>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Kreiraj Novi Plan
                    </Button>
                  </NewActivityPlanDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6">
            {completedPlans.length > 0 ? (
              completedPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-2xl capitalize">
                            {plan.season === "summer" ? "Ljetna" : "Zimska"} Sezona {plan.season_year}
                          </CardTitle>
                          <Badge className={getSeasonColor(plan.season)}>
                            {plan.season === "summer" ? "Ljeto" : "Zima"}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={getStatusColor(plan.status)}>
                        Završen
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ukupno Aktivnosti:</span>
                        <span className="font-medium">{plan.activities.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kreirano:</span>
                        <span className="font-medium">{new Date(plan.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kreirao:</span>
                        <span className="font-medium">{plan.created_by}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg font-medium mb-2">Nema završenih planova</p>
                  <p className="text-sm text-muted-foreground">Završeni sezonski planovi će se pojaviti ovdje</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}