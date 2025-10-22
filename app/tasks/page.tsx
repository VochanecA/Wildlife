import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewTaskDialog } from "@/components/new-task-dialog"
import { TaskStatusDropdown } from "@/components/task-status-dropdown"
import { Plus, Search, Filter, CalendarIcon, User, MapPin, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const searchQuery = typeof params.search === 'string' ? params.search : ''
  const activeTab = typeof params.tab === 'string' ? params.tab : 'all'

  // Fetch tasks from Supabase
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upravljanje Zadacima</h1>
            <p className="text-muted-foreground">Planirajte i pratite zadatke upravljanja divljači</p>
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
  if (!tasks || tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upravljanje Zadacima</h1>
            <p className="text-muted-foreground">Planirajte i pratite zadatke upravljanja divljači</p>
          </div>
          <NewTaskDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novi Zadatak
            </Button>
          </NewTaskDialog>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nema zadataka</p>
            <p className="text-sm text-muted-foreground mb-4">Započnite kreiranjem prvog zadatka</p>
            <NewTaskDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Kreiraj Prvi Zadatak
              </Button>
            </NewTaskDialog>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch user profiles separately to get names
  const userIds = [...new Set(tasks.map(t => [t.user_id, t.assigned_to]).flat().filter(Boolean))] as string[]
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

  // Filter tasks based on search query and active tab
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "daily" && task.task_type === "daily") ||
      (activeTab === "weekly" && task.task_type === "weekly") ||
      (activeTab === "monthly" && task.task_type === "monthly") ||
      (activeTab === "yearly" && task.task_type === "yearly")

    return matchesSearch && matchesTab
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
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
          <h1 className="text-3xl font-bold tracking-tight">Upravljanje Zadacima</h1>
          <p className="text-muted-foreground">Planirajte i pratite zadatke upravljanja divljači</p>
        </div>
        <NewTaskDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novi Zadatak
          </Button>
        </NewTaskDialog>
      </div>

      <div className="flex gap-4">
        <form className="relative flex-1" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Pretraži zadatke..."
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
            <a href="?tab=all">Svi Zadaci</a>
          </TabsTrigger>
          <TabsTrigger value="daily" asChild>
            <a href="?tab=daily">Dnevni</a>
          </TabsTrigger>
          <TabsTrigger value="weekly" asChild>
            <a href="?tab=weekly">Nedjeljni</a>
          </TabsTrigger>
          <TabsTrigger value="monthly" asChild>
            <a href="?tab=monthly">Mjesečni</a>
          </TabsTrigger>
          <TabsTrigger value="yearly" asChild>
            <a href="?tab=yearly">Godišnji</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                            {task.title}
                          </CardTitle>
                        </div>
                        <CardDescription>{task.description}</CardDescription>
                        {task.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {task.location}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-col items-end">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === "high" && "Visok"}
                          {task.priority === "medium" && "Srednji"}
                          {task.priority === "low" && "Nizak"}
                        </Badge>
                        <TaskStatusDropdown 
                          taskId={task.id} 
                          currentStatus={task.status} 
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Rok:</span>
                          <span className="font-medium">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "Nije postavljen"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Tip:</span>
                          <span className="font-medium capitalize">
                            {task.task_type === "daily" && "Dnevni"}
                            {task.task_type === "weekly" && "Nedjeljni"}
                            {task.task_type === "monthly" && "Mjesečni"}
                            {task.task_type === "yearly" && "Godišnji"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Kreirao:</span>
                          <span className="font-medium">
                            {userProfiles[task.user_id]?.full_name || "Nepoznato"}
                          </span>
                        </div>
                        {task.assigned_to && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Dodijeljeno:</span>
                            <span className="font-medium">
                              {userProfiles[task.assigned_to]?.full_name || "Nepoznato"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {task.completed_at && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Završeno:</span>
                            <span className="font-medium">{new Date(task.completed_at).toLocaleString()}</span>
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
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Nema pronađenih zadataka</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? "Pokušajte sa drugim pojmovima pretrage" : "Započnite kreiranjem prvog zadatka"}
                  </p>
                  <NewTaskDialog>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Kreiraj Prvi Zadatak
                    </Button>
                  </NewTaskDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}