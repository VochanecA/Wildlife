"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, CalendarIcon, Users, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewActivityPlanDialog } from "@/components/new-activity-plan-dialog"
import type { ActivityPlan } from "@/lib/types"

const mockPlans: ActivityPlan[] = [
  {
    id: "1",
    season: "summer",
    year: 2025,
    startDate: new Date("2025-03-30"),
    endDate: new Date("2025-10-25"),
    status: "active",
    createdBy: "John Smith",
    approvedBy: "Airport Director",
    activities: [
      {
        id: "a1",
        title: "Grass height management",
        description: "Maintain grass height between 7-14 inches to reduce attractiveness to wildlife",
        type: "habitat_management",
        scheduledDate: new Date("2025-04-15"),
        duration: 120,
        assignedTo: ["Mike Chen", "Sarah Johnson"],
        status: "completed",
        notes: "Completed ahead of schedule",
      },
      {
        id: "a2",
        title: "Bird dispersal training",
        description: "Staff training on pyrotechnics and acoustic deterrents",
        type: "training",
        scheduledDate: new Date("2025-05-10"),
        duration: 240,
        assignedTo: ["John Smith"],
        status: "scheduled",
      },
      {
        id: "a3",
        title: "Wetland monitoring",
        description: "Survey and monitor wetland areas for waterfowl activity",
        type: "monitoring",
        scheduledDate: new Date("2025-06-01"),
        duration: 180,
        assignedTo: ["Sarah Johnson"],
        status: "scheduled",
      },
    ],
  },
  {
    id: "2",
    season: "winter",
    year: 2024,
    startDate: new Date("2024-10-27"),
    endDate: new Date("2025-03-29"),
    status: "completed",
    createdBy: "Sarah Johnson",
    approvedBy: "Airport Director",
    activities: [
      {
        id: "a4",
        title: "Snow goose dispersal program",
        description: "Implement enhanced dispersal measures during migration season",
        type: "dispersal",
        scheduledDate: new Date("2024-11-15"),
        duration: 480,
        assignedTo: ["John Smith", "Mike Chen"],
        status: "completed",
      },
      {
        id: "a5",
        title: "Winter habitat assessment",
        description: "Evaluate winter habitat conditions and attractants",
        type: "habitat_management",
        scheduledDate: new Date("2024-12-10"),
        duration: 240,
        assignedTo: ["Sarah Johnson"],
        status: "completed",
      },
    ],
  },
]

export default function PlanningPage() {
  const [plans] = useState<ActivityPlan[]>(mockPlans)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("current")

  const currentPlans = plans.filter((plan) => plan.status === "active" || plan.status === "draft")
  const completedPlans = plans.filter((plan) => plan.status === "completed")

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

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20"
      case "in_progress":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "completed":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "cancelled":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Planning</h1>
          <p className="text-muted-foreground">IATA seasonal wildlife management planning</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Activity Plan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">Current Plans</TabsTrigger>
          <TabsTrigger value="completed">Completed Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <div className="grid gap-6">
            {currentPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl capitalize">
                          {plan.season} Season {plan.year}
                        </CardTitle>
                        <Badge className={getSeasonColor(plan.season)}>{plan.season}</Badge>
                      </div>
                      <CardDescription>
                        {plan.startDate.toLocaleDateString()} - {plan.endDate.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(plan.status)}>
                      {plan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {Math.ceil((plan.endDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Activities:</span>
                      <span className="font-medium">{plan.activities.length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created by:</span>
                      <span className="font-medium">{plan.createdBy}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Scheduled Activities</h4>
                    <div className="space-y-3">
                      {plan.activities.map((activity) => (
                        <div key={activity.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium">{activity.title}</h5>
                                <Badge variant="outline" className={getActivityStatusColor(activity.status)}>
                                  {activity.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                          </div>
                          <div className="grid gap-2 md:grid-cols-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Type:</span>
                              <span className="font-medium capitalize">{activity.type.replace("_", " ")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Scheduled:</span>
                              <span className="font-medium">{activity.scheduledDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">{activity.duration} min</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Assigned to:</span>
                            <span className="font-medium">{activity.assignedTo.join(", ")}</span>
                          </div>
                          {activity.notes && (
                            <div className="p-2 bg-muted rounded text-sm">
                              <span className="text-muted-foreground">Notes: </span>
                              {activity.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6">
            {completedPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl capitalize">
                          {plan.season} Season {plan.year}
                        </CardTitle>
                        <Badge className={getSeasonColor(plan.season)}>{plan.season}</Badge>
                      </div>
                      <CardDescription>
                        {plan.startDate.toLocaleDateString()} - {plan.endDate.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(plan.status)}>
                      {plan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Activities:</span>
                      <span className="font-medium">{plan.activities.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-medium">
                        {plan.activities.filter((a) => a.status === "completed").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approved by:</span>
                      <span className="font-medium">{plan.approvedBy}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <NewActivityPlanDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
