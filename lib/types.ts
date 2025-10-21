export type UserRole = "admin" | "wildlife_officer" | "operations_staff" | "viewer"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  airport?: string
  createdAt: Date
}

export interface WildlifeSighting {
  id: string
  species: string
  count: number
  location: string
  coordinates?: { lat: number; lng: number }
  timestamp: Date
  reportedBy: string
  severity: "low" | "medium" | "high" | "critical"
  notes?: string
  images?: string[]
  weather?: string
  visibility?: string
}

export interface HazardReport {
  id: string
  type: "wildlife" | "habitat" | "attractant" | "other"
  description: string
  location: string
  coordinates?: { lat: number; lng: number }
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "resolved" | "closed"
  reportedBy: string
  assignedTo?: string
  timestamp: Date
  resolvedAt?: Date
  actions?: string[]
  images?: string[]
}

export interface Task {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "monthly" | "yearly"
  assignedTo: string
  dueDate: Date
  status: "pending" | "in_progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high"
  location?: string
  createdAt: Date
  completedAt?: Date
}

export interface ActivityPlan {
  id: string
  season: "summer" | "winter"
  year: number
  startDate: Date
  endDate: Date
  activities: Activity[]
  status: "draft" | "active" | "completed"
  createdBy: string
  approvedBy?: string
}

export interface Activity {
  id: string
  title: string
  description: string
  type: "habitat_management" | "dispersal" | "monitoring" | "training" | "other"
  scheduledDate: Date
  duration: number
  assignedTo: string[]
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  notes?: string
}

export interface Message {
  id: string
  from: string
  to: string
  subject: string
  content: string
  timestamp: Date
  read: boolean
  priority: "normal" | "high" | "urgent"
}
