"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewTaskDialog } from "@/components/new-task-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "@/lib/types"

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Morning runway inspection",
    description: "Complete visual inspection of all active runways",
    type: "daily",
    assignedTo: "John Smith",
    dueDate: new Date("2025-01-21T08:00:00"),
    status: "pending",
    priority: "high",
    location: "All Runways",
    createdAt: new Date("2025-01-20T06:00:00"),
  },
  {
    id: "2",
    title: "Perimeter fence inspection",
    description: "Check perimeter fence for breaches and wildlife access points",
    type: "weekly",
    assignedTo: "Sarah Johnson",
    dueDate: new Date("2025-01-22T10:00:00"),
    status: "in_progress",
    priority: "medium",
    location: "Perimeter - All Sections",
    createdAt: new Date("2025-01-15T09:00:00"),
  },
  {
    id: "3",
    title: "Habitat management - North field",
    description: "Grass cutting and vegetation management in north field area",
    type: "monthly",
    assignedTo: "Mike Chen",
    dueDate: new Date("2025-01-25T09:00:00"),
    status: "pending",
    priority: "medium",
    location: "North Field",
    createdAt: new Date("2025-01-01T10:00:00"),
  },
  {
    id: "4",
    title: "Wildlife hazard assessment report",
    description: "Compile and submit quarterly wildlife hazard assessment to authorities",
    type: "yearly",
    assignedTo: "John Smith",
    dueDate: new Date("2025-01-31T17:00:00"),
    status: "pending",
    priority: "high",
    createdAt: new Date("2025-01-01T08:00:00"),
  },
  {
    id: "5",
    title: "Equipment maintenance check",
    description: "Inspect and maintain wildlife dispersal equipment",
    type: "weekly",
    assignedTo: "Mike Chen",
    dueDate: new Date("2025-01-20T14:00:00"),
    status: "completed",
    priority: "low",
    location: "Equipment Storage",
    createdAt: new Date("2025-01-13T10:00:00"),
    completedAt: new Date("2025-01-20T13:45:00"),
  },
]

export default function TasksPage() {
  const [tasks] = useState<Task[]>(mockTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "daily" && task.type === "daily") ||
      (activeTab === "weekly" && task.type === "weekly") ||
      (activeTab === "monthly" && task.type === "monthly") ||
      (activeTab === "yearly" && task.type === "yearly")

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-muted text-muted-foreground border-border"
      case "in_progress":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "completed":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "overdue":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const handleToggleComplete = (taskId: string) => {
    console.log("[v0] Toggle task completion:", taskId)
    // In real implementation, this would update the task status
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">Schedule and track wildlife management tasks</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
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
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => handleToggleComplete(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle
                            className={task.status === "completed" ? "line-through text-muted-foreground" : ""}
                          >
                            {task.title}
                          </CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 ml-9">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Due:</span>
                        <span className="font-medium">{task.dueDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{task.type}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Assigned to:</span>
                        <span className="font-medium">{task.assignedTo}</span>
                      </div>
                      {task.location && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{task.location}</span>
                        </div>
                      )}
                    </div>
                    {task.completedAt && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="font-medium">{task.completedAt.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <NewTaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
