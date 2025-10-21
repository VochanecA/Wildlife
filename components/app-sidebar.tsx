"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  Home,
  Bird,
  AlertTriangle,
  CheckSquare,
  Calendar,
  MessageSquare,
  BarChart3,
  Map,
  LogOut,
  WifiOff,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

const menuItems = [
  { title: "Kontrolna Tabla", icon: Home, url: "/dashboard" },
  { title: "Posmatranja Divljih Životinja", icon: Bird, url: "/sightings" },
  { title: "Izvještaji o Opasnostima", icon: AlertTriangle, url: "/hazards" },
  { title: "Zadaci", icon: CheckSquare, url: "/tasks" },
  { title: "Planiranje Aktivnosti", icon: Calendar, url: "/planning" },
  { title: "Poruke", icon: MessageSquare, url: "/messages" },
  { title: "Analitika", icon: BarChart3, url: "/analytics" },
  { title: "Pregled Karte", icon: Map, url: "/map" },
  { title: "Offline Režim", icon: WifiOff, url: "/offline" },
]

interface AppSidebarProps {
  user: User
  profile: {
    full_name: string
    role: string
  } | null
}

export function AppSidebar({ user, profile }: AppSidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center">
            <Bird className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">A/D TIVAT :: Upravljanje Divljim Životinjama</span>
            <span className="text-xs text-muted-foreground">Kontrola Aerodroma</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigacija</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          <div className="text-sm">
            <div className="font-medium">{profile?.full_name || user.email}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {profile?.role?.replace("_", " ") || "Službenik"}
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Odjava
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
