"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  Home,
  Volume2,
  Bird,
  Clock,
  AlertTriangle,
  CheckSquare,
  Calendar,
  MessageSquare,
  BarChart3,
  Map,
  LogOut,
  WifiOff,
  Plane,
  Brain,
  FileText,
  User as UserIcon,
  Settings,
  Satellite,
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
import Link from "next/link"
import { useEffect, useState } from "react"

const menuItems = [
  { title: "Kontrolna Tabla", icon: Home, url: "/dashboard" },
  { title: "Posmatranja Divljih Životinja", icon: Bird, url: "/sightings" },
  { title: "Izvještaji o Opasnostima", icon: AlertTriangle, url: "/hazards" },
  { title: "Zadaci", icon: CheckSquare, url: "/tasks" },
  { title: "Repelent Zvukovi", icon: Volume2, url: "/bird-sounds" },
  { title: "Planiranje Aktivnosti", icon: Calendar, url: "/planning" },
  { title: "Poruke", icon: MessageSquare, url: "/messages" },
  { title: "Analitika", icon: BarChart3, url: "/analytics" },
  { title: "Predikcije Rizika", icon: Brain, url: "/predictions" },
  { title: "Izvještaji", icon: FileText, url: "/reports" },
  { title: "Oprema", icon: Settings, url: "/equipment" },
  { title: "Obračun satnica", icon: Clock, url: "/plate" },
  { title: "Pregled Karte", icon: Map, url: "/map" },
  { title: "Offline Režim", icon: WifiOff, url: "/offline" },
  { 
    title: "LIVE WIDS", 
    icon: Satellite, 
    url: "/tv-display",
    isLive: true, // Dodajemo flag za LIVE item
     altText: "View live info on TIV Wildlife Information Display System"
  },
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
  const [isMobile, setIsMobile] = useState(false)

  // Detektuj da li je mobilni uređaj
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const getIconColor = (url: string, isLive?: boolean) => {
    const isActive = pathname === url
    if (isLive && !isActive) {
      return "text-red-500"
    }
    return isActive ? "text-white" : "text-blue-600"
  }

  const getButtonStyle = (url: string, isLive?: boolean) => {
    const isActive = pathname === url
    return cn(
      "w-full transition-all duration-200 relative",
      isActive 
        ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg" 
        : isLive
        ? "text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 hover:shadow-md border border-red-200/50"
        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:text-blue-700 hover:shadow-md"
    )
  }

  // Funkcija za rukovanje klikom na link - zatvara sidebar na mobilnim
  const handleLinkClick = () => {
    if (isMobile) {
      // Pronađi i zatvori sidebar klikom na close button ili trigger
      const sidebar = document.querySelector('[data-sidebar="sidebar"]') as HTMLElement
      const closeButton = document.querySelector('[data-sidebar="trigger"]') as HTMLElement
      
      if (sidebar && closeButton) {
        closeButton.click() // Simuliraj klik na close button
      }
    }
  }

  return (
    <Sidebar 
      className="border-r-0 bg-linear-to-b from-gray-50 to-white shadow-xl"
      data-sidebar="sidebar"
    >
      <SidebarHeader className="border-b border-gray-200/50 p-6 bg-linear-to-r from-blue-600 to-green-600">
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
      <SidebarMenuButton asChild className={getButtonStyle(item.url, item.isLive)}>
        <Link 
          href={item.url} 
          className="flex items-center gap-3 p-3 rounded-xl relative"
          scroll={false}
          onClick={handleLinkClick}
          title={item.altText || item.title} // DODAJ OVO
        >
          {/* Pulsirajući efekt za LIVE WIDS kada nije aktivan */}
          {item.isLive && pathname !== item.url && (
            <div className="absolute -left-1 -top-1">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
                <div className="w-3 h-3 bg-red-600 rounded-full relative"></div>
              </div>
            </div>
          )}
          
          <div className={cn(
            "p-2 rounded-lg transition-all duration-200 relative",
            pathname === item.url 
              ? "bg-white/20" 
              : item.isLive
              ? "bg-red-50 animate-pulse"
              : "bg-blue-50"
          )}>
            <item.icon 
              className={cn(
                "w-4 h-4", 
                getIconColor(item.url, item.isLive)
              )} 
              aria-label={item.altText ? undefined : item.title} // DODAJ OVO
            />
            
            {/* Dodatni pulsirajući efekt unutar ikonice za LIVE */}
            {item.isLive && pathname !== item.url && (
              <div className="absolute inset-0 rounded-lg bg-red-200 animate-ping opacity-75"></div>
            )}
          </div>
          
          <span className={cn(
            "font-medium text-sm",
            item.isLive && pathname !== item.url && "text-red-700 font-semibold"
          )}>
            {item.title}
          </span>
          
          {/* LIVE badge za aktivan item */}
          {item.isLive && pathname === item.url && (
            <div className="ml-auto">
              <div className="bg-white/30 px-2 py-1 rounded-full text-xs font-bold text-white animate-pulse">
                LIVE
              </div>
            </div>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))}
</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats Section */}
        <SidebarGroup className="mt-8">
          <SidebarGroupContent>
            <div className="space-y-2">
              {/* Quick stats content */}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200/50 p-4 bg-white/50 backdrop-blur-sm">
        <div className="space-y-3">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 bg-linear-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200/50">
            <div className="w-10 h-10 bg-linear-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
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

// "use client"

// import { Button } from "@/components/ui/button"
// import { createClient } from "@/lib/supabase/client"
// import {
//   Home,
//   Volume2,
//   Bird,
//   Clock,
//   AlertTriangle,
//   CheckSquare,
//   Calendar,
//   MessageSquare,
//   BarChart3,
//   Map,
//   LogOut,
//   WifiOff,
//   Plane,
//   Brain,
//   FileText,
//   User as UserIcon,
//   Settings,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"
// import { useRouter, usePathname } from "next/navigation"
// import type { User } from "@supabase/supabase-js"
// import { cn } from "@/lib/utils"
// import Link from "next/link"
// import { useState } from "react"

// const menuItems = [
//   { title: "Kontrolna Tabla", icon: Home, url: "/dashboard" },
//   { 
//     title: "Operativne Aktivnosti", 
//     icon: Bird, 
//     children: [
//       { title: "Posmatranja\nDivljih Životinja", icon: Bird, url: "/sightings" },
//       { title: "Izvještaji o\nOpasnostima", icon: AlertTriangle, url: "/hazards" },
//       { title: "Repelent\nZvukovi", icon: Volume2, url: "/bird-sounds" },
//     ]
//   },
//   { 
//     title: "Planiranje i Zadaci", 
//     icon: Calendar, 
//     children: [
//       { title: "Zadaci", icon: CheckSquare, url: "/tasks" },
//       { title: "Planiranje\nAktivnosti", icon: Calendar, url: "/planning" },
//       { title: "Obračun\nsatnica", icon: Clock, url: "/plate" },
//     ]
//   },
//   { 
//     title: "Analitika i Izvještaji", 
//     icon: BarChart3, 
//     children: [
//       { title: "Analitika", icon: BarChart3, url: "/analytics" },
//       { title: "Predikcije\nRizika", icon: Brain, url: "/predictions" },
//       { title: "Izvještaji", icon: FileText, url: "/reports" },
//     ]
//   },
//   { title: "Poruke", icon: MessageSquare, url: "/messages" },
//   { 
//     title: "Alati i Mape", 
//     icon: Map, 
//     children: [
//       { title: "Pregled\nKarte", icon: Map, url: "/map" },
//       { title: "Oprema", icon: Settings, url: "/equipment" },
//       { title: "Offline\nRežim", icon: WifiOff, url: "/offline" },
//     ]
//   },
// ]

// interface AppSidebarProps {
//   user: User
//   profile: {
//     full_name: string
//     role: string
//   } | null
// }

// interface MenuItemProps {
//   item: any
//   level?: number
// }

// function MenuItem({ item, level = 0 }: MenuItemProps) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const [isOpen, setIsOpen] = useState(false)

//   const hasChildren = item.children && item.children.length > 0
//   const isActive = pathname === item.url || 
//     (hasChildren && item.children.some((child: any) => pathname === child.url))

//   const getIconColor = (url: string) => {
//     const isActive = pathname === url
//     return isActive ? "text-white" : "text-blue-600"
//   }

//   const getButtonStyle = (url: string) => {
//     const isActive = pathname === url
//     return cn(
//       "w-full transition-all duration-200",
//       isActive 
//         ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg" 
//         : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:text-blue-700 hover:shadow-md"
//     )
//   }

//   const getParentButtonStyle = () => {
//     return cn(
//       "w-full transition-all duration-200",
//       isActive
//         ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md"
//         : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:text-blue-700"
//     )
//   }

//   // Funkcija za formatiranje teksta sa novim redovima
//   const formatText = (text: string) => {
//     return text.split('\n').map((line, index) => (
//       <span key={index} className="block leading-tight">
//         {line}
//       </span>
//     ))
//   }

//   if (hasChildren) {
//     return (
//       <div className={cn("rounded-xl mb-2", level > 0 && "ml-4 border-l-2 border-gray-200 pl-2")}>
//         <SidebarMenuButton 
//           className={getParentButtonStyle()}
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           <div className="flex items-center justify-between w-full p-4">
//             <div className="flex items-center gap-3 flex-1 min-w-0">
//               <div className={cn(
//                 "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
//                 isActive 
//                   ? "bg-white/20" 
//                   : "bg-blue-50"
//               )}>
//                 <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-blue-600")} />
//               </div>
//               <span className="font-medium text-sm leading-tight min-w-0">
//                 {formatText(item.title)}
//               </span>
//             </div>
//             {isOpen ? (
//               <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
//             ) : (
//               <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
//             )}
//           </div>
//         </SidebarMenuButton>
        
//         {isOpen && (
//           <div className="mt-2 space-y-2">
//             {item.children.map((child: any) => (
//               <MenuItem key={child.title} item={child} level={level + 1} />
//             ))}
//           </div>
//         )}
//       </div>
//     )
//   }

//   return (
//     <SidebarMenuItem className={cn("mb-2", level > 0 && "ml-4")}>
//       <SidebarMenuButton asChild className={getButtonStyle(item.url)}>
//         <Link 
//           href={item.url} 
//           className="flex items-start gap-3 p-4 rounded-xl min-h-[64px]" // promijenjeno na items-start i min-height
//           scroll={false}
//         >
//           <div className={cn(
//             "p-2 rounded-lg transition-all duration-200 flex-shrink-0 mt-1", // dodan mt-1 za bolju vertikalnu poravnavu
//             pathname === item.url 
//               ? "bg-white/20" 
//               : "bg-blue-50"
//           )}>
//             <item.icon className={cn("w-4 h-4", getIconColor(item.url))} />
//           </div>
//           <div className="flex-1 min-w-0">
//             <span className="font-medium text-sm leading-tight text-left block">
//               {formatText(item.title)}
//             </span>
//           </div>
//         </Link>
//       </SidebarMenuButton>
//     </SidebarMenuItem>
//   )
// }

// export function AppSidebar({ user, profile }: AppSidebarProps) {
//   const router = useRouter()
//   const pathname = usePathname()

//   const handleLogout = async () => {
//     const supabase = createClient()
//     await supabase.auth.signOut()
//     router.push("/auth/login")
//     router.refresh()
//   }

//   return (
//     <Sidebar className="border-r-0 bg-gradient-to-b from-gray-50 to-white shadow-xl">
//       <SidebarHeader className="border-b border-gray-200/50 p-6 bg-gradient-to-r from-blue-600 to-green-600">
//         <div className="flex items-center gap-3">
//           <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
//             <Plane className="w-6 h-6 text-white" />
//           </div>
//           <div className="flex flex-col">
//             <span className="text-lg font-bold text-white">Aerodrom Tivat</span>
//             <span className="text-sm text-blue-100">Upravljanje Divljim Životinjama</span>
//           </div>
//         </div>
//       </SidebarHeader>
      
//       <SidebarContent className="p-4">
//         <SidebarGroup>
//           <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
//             Glavni Meni
//           </SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu className="space-y-3">
//               {menuItems.map((item) => (
//                 <MenuItem key={item.title} item={item} />
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         {/* Quick Stats Section */}
//         <SidebarGroup className="mt-8">
//           <SidebarGroupContent>
//             <div className="space-y-2">
//               {/* Quick stats content */}
//             </div>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
      
//       <SidebarFooter className="border-t border-gray-200/50 p-4 bg-white/50 backdrop-blur-sm">
//         <div className="space-y-3">
//           {/* User Profile */}
//           <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200/50">
//             <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
//               <UserIcon className="w-5 h-5 text-white" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="font-semibold text-sm text-gray-900 truncate">
//                 {profile?.full_name || user.email}
//               </div>
//               <div className="text-xs text-gray-600 capitalize truncate">
//                 {profile?.role?.replace("_", " ") || "Službenik"}
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="icon"
//               className="w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-white/50"
//             >
//               <Settings className="w-4 h-4" />
//             </Button>
//           </div>

//           {/* Logout Button */}
//           <Button 
//             variant="outline" 
//             size="sm" 
//             className="w-full bg-white border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all duration-200 shadow-sm"
//             onClick={handleLogout}
//           >
//             <LogOut className="w-4 h-4 mr-2" />
//             Odjava
//           </Button>

//           {/* System Status */}
//           <div className="text-center">
//             <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//               <span>Sistem aktivan</span>
//             </div>
//           </div>
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   )
// }