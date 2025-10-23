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
  Plane,
  User as UserIcon,
  Settings,
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
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

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
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const getIconColor = (url: string) => {
    const isActive = pathname === url
    return isActive ? "text-white" : "text-blue-600"
  }

  const getButtonStyle = (url: string) => {
    const isActive = pathname === url
    return cn(
      "w-full transition-all duration-200",
      isActive 
        ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg" 
        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:text-blue-700 hover:shadow-md"
    )
  }

  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-gray-50 to-white shadow-xl">
      <SidebarHeader className="border-b border-gray-200/50 p-6 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">Aerodrom Tivat</span>
            <span className="text-sm text-blue-100">Upravljanje Divljim Životinjama</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Glavni Meni
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getButtonStyle(item.url)}>
                    <a href={item.url} className="flex items-center gap-3 p-3 rounded-xl">
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        pathname === item.url 
                          ? "bg-white/20" 
                          : "bg-blue-50"
                      )}>
                        <item.icon className={cn("w-4 h-4", getIconColor(item.url))} />
                      </div>
                      <span className="font-medium text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats Section */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Brzi Pregled
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 p-3 rounded-xl border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Aktivni dan</span>
                  <Bird className="w-3 h-3 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-gray-900 mt-1">16°C</div>
                <div className="text-xs text-gray-500">Oblačno, sa povremenom kišom</div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-3 rounded-xl border border-orange-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Rizik od ptica</span>
                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                </div>
                <div className="text-lg font-bold text-gray-900 mt-1">Srednji</div>
                <div className="text-xs text-gray-500">Povećana aktivnost</div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200/50 p-4 bg-white/50 backdrop-blur-sm">
        <div className="space-y-3">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200/50">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900 truncate">
                {profile?.full_name || user.email}
              </div>
              <div className="text-xs text-gray-600 capitalize truncate">
                {profile?.role?.replace("_", " ") || "Službenik"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-white/50"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Logout Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-white border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all duration-200 shadow-sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Odjava
          </Button>

          {/* System Status */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistem aktivan</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}