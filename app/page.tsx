'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Plane, 
  Shield, 
  MapPin, 
  BarChart3, 
  Sparkles,
  Zap,
  ChevronRight,
  Bird,
  Eye,
  Radio,
  Satellite,
  Brain,
  Activity,
  User,
  LogOut,
  Home,
  AlertTriangle,
  CheckSquare,
  Volume2,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Clock,
  Map,
  WifiOff
} from "lucide-react"
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

// Type definitions for better TypeScript support
type IconName = 
  | 'Plane' | 'Shield' | 'MapPin' | 'BarChart3' | 'Sparkles' 
  | 'Zap' | 'ChevronRight' | 'Bird' | 'Eye' | 'Radio' 
  | 'Satellite' | 'Brain' | 'Activity' | 'User' | 'LogOut'
  | 'Home' | 'AlertTriangle' | 'CheckSquare' | 'Volume2' | 'Calendar'
  | 'MessageSquare' | 'FileText' | 'Settings' | 'Clock' | 'Map' | 'WifiOff'

interface LucideIcon extends React.FC<React.SVGProps<SVGSVGElement>> {}

// Koristimo Supabase User tip direktno
type UserData = SupabaseUser | null

interface ColorStyle {
  bg: string;
  text: string;
  border: string;
}

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
  color: string;
  items: string[];
}

interface Benefit {
  icon: JSX.Element;
  title: string;
  description: string;
  gradient: string;
}

interface Stat {
  number: string;
  label: string;
}

interface MenuItem {
  title: string;
  icon: LucideIcon;
  url: string;
  isLive?: boolean;
  altText?: string;
}

export default function ModernLandingPage() {
  const [scrolled, setScrolled] = useState<boolean>(false)
  const [colorIndex, setColorIndex] = useState<number>(0)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [imageError, setImageError] = useState<boolean>(false)
  const [user, setUser] = useState<UserData>(null)
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const supabase = useMemo(() => createClient(), [])

  // Menu items data
  const menuItems: MenuItem[] = useMemo(() => [
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
      isLive: true,
      altText: "View live info on TIV Wildlife Information Display System"
    },
  ], [])

  // Optimized colors array with TypeScript interface
  const colors: ColorStyle[] = useMemo(() => [
    { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
    { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
    { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
    { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
    { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' }
  ], [])

  // Optimized scroll handler with useCallback and throttling
  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > 50
    // Only update state if the value actually changes
    if (isScrolled !== scrolled) {
      setScrolled(isScrolled)
    }
  }, [scrolled])

  // Scroll event listener with cleanup
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Optimized intervals with cleanup
  useEffect(() => {
    setIsLoaded(true)
    
    const colorInterval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length)
    }, 5000)

    return () => clearInterval(colorInterval)
  }, [colors.length])

  // Check user authentication with Supabase
  const checkUser = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error fetching user:', error)
        setUser(null)
        return
      }

      setUser(authUser)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase.auth])

  // Initial auth check and auth state listener
  useEffect(() => {
    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user)
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user)
        } else if (event === 'INITIAL_SESSION') {
          setUser(session?.user || null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [checkUser, supabase.auth])

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      } else {
        setUser(null)
        setShowUserMenu(false)
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [supabase.auth])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false)
    }

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  // Get user display name
  const getUserDisplayName = useCallback((user: UserData): string => {
    if (!user) return ''
    
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'User'
  }, [])

  // Memoized icons for better performance
  const IconPlane = useMemo(() => Plane, [])
  const IconShield = useMemo(() => Shield, [])
  const IconMapPin = useMemo(() => MapPin, [])
  const IconBarChart3 = useMemo(() => BarChart3, [])
  const IconSparkles = useMemo(() => Sparkles, [])
  const IconZap = useMemo(() => Zap, [])
  const IconChevronRight = useMemo(() => ChevronRight, [])
  const IconBird = useMemo(() => Bird, [])
  const IconEye = useMemo(() => Eye, [])
  const IconRadio = useMemo(() => Radio, [])
  const IconSatellite = useMemo(() => Satellite, [])
  const IconBrain = useMemo(() => Brain, [])
  const IconActivity = useMemo(() => Activity, [])
  const IconUser = useMemo(() => User, [])
  const IconLogOut = useMemo(() => LogOut, [])
  const IconHome = useMemo(() => Home, [])
  const IconAlertTriangle = useMemo(() => AlertTriangle, [])
  const IconCheckSquare = useMemo(() => CheckSquare, [])
  const IconVolume2 = useMemo(() => Volume2, [])
  const IconCalendar = useMemo(() => Calendar, [])
  const IconMessageSquare = useMemo(() => MessageSquare, [])
  const IconFileText = useMemo(() => FileText, [])
  const IconSettings = useMemo(() => Settings, [])
  const IconClock = useMemo(() => Clock, [])
  const IconMap = useMemo(() => Map, [])
  const IconWifiOff = useMemo(() => WifiOff, [])

  // Optimized features data with useMemo
  const features: Feature[] = useMemo(() => [
    {
      icon: <IconBird className="w-6 h-6" aria-hidden="true" />,
      title: "Real-time Bird Detection",
      description: "Instant notification system for bird activity within airport perimeter",
      color: "from-blue-500 to-cyan-500",
      items: ["Live tracking", "Automated alerts", "Species identification"]
    },
    {
      icon: <IconMapPin className="w-6 h-6" aria-hidden="true" />,
      title: "Precise Location Mapping",
      description: "GPS-enabled wildlife sightings with exact coordinates on airport map",
      color: "from-emerald-500 to-teal-500",
      items: ["Interactive maps", "Hotspot analysis", "Movement patterns"]
    },
    {
      icon: <IconRadio className="w-6 h-6" aria-hidden="true" />,
      title: "Acoustic Repellent Control",
      description: "Remote activation of bird deterrent systems across airport areas",
      color: "from-purple-500 to-pink-500",
      items: ["Zone control", "Schedule management", "Effectiveness tracking"]
    },
    {
      icon: <IconBrain className="w-6 h-6" aria-hidden="true" />,
      title: "AI-Powered Analytics",
      description: "Advanced machine learning for wildlife behavior prediction and risk assessment",
      color: "from-orange-500 to-red-500",
      items: ["Pattern recognition", "Risk forecasting", "Predictive modeling"]
    },
    {
      icon: <IconBarChart3 className="w-6 h-6" aria-hidden="true" />,
      title: "Comprehensive Reporting",
      description: "Detailed analytics and automated reporting for wildlife management decisions",
      color: "from-rose-500 to-pink-600",
      items: ["Custom reports", "Trend analysis", "Export capabilities"]
    },
    {
      icon: <IconSatellite className="w-6 h-6" aria-hidden="true" />,
      title: "WIDS Live Display",
      description: "Public information system for real-time wildlife activity monitoring",
      color: "from-indigo-500 to-purple-600",
      items: ["TV dashboard", "Public alerts", "Live data feed"]
    }
  ], [IconBird, IconMapPin, IconRadio, IconBrain, IconBarChart3, IconSatellite])

  // Memoized benefits data
  const benefits: Benefit[] = useMemo(() => [
    {
      icon: <IconShield className="w-5 h-5" aria-hidden="true" />,
      title: "Enhanced Flight Safety",
      description: "Reduce bird strike risks during takeoff and landing operations through proactive monitoring",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <IconActivity className="w-5 h-5" aria-hidden="true" />,
      title: "Intelligent Wildlife Monitoring",
      description: "Advanced analytics and real-time tracking for comprehensive wildlife management",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <IconBarChart3 className="w-5 h-5" aria-hidden="true" />,
      title: "Data-Driven Wildlife Analysis",
      description: "Make informed wildlife management decisions based on comprehensive analytics and insights",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <IconShield className="w-5 h-5" aria-hidden="true" />,
      title: "ICAO Compliance & Standards",
      description: "Meet international aviation safety standards for wildlife hazard management",
      gradient: "from-orange-500 to-red-500"
    }
  ], [IconShield, IconActivity, IconBarChart3])

  // Memoized stats data
  const stats: Stat[] = useMemo(() => [
    { number: "99.7%", label: "System Uptime" },
    { number: "24/7", label: "Live Monitoring" },
    { number: "<30s", label: "Alert Response" },
    { number: "AI", label: "Powered Analytics" }
  ], [])

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700' : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative" aria-hidden="true">
                <div className="absolute inset-0  bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75"></div>
                <div className="relative bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <IconPlane className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-bold  bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Tivat Airport WIDS
              </span>
            </div>
            <div className="flex items-center gap-4">
              {loading ? (
                // Loading state
                <div className="hidden sm:block px-4 py-2">
                  <div className="w-20 h-4 bg-slate-700 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                // User is logged in - show user menu
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                    }}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="User menu"
                  >
                    <IconUser className="w-4 h-4" aria-hidden="true" />
                    <span className="max-w-[120px] truncate">{getUserDisplayName(user)}</span>
                  </button>
                  
                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl backdrop-blur-sm z-50 max-h-[80vh] overflow-y-auto">
                      <div className="p-4 border-b border-slate-700">
                        <p className="text-sm font-medium text-white truncate">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {user.email || 'No email'}
                        </p>
                        <p className="text-xs text-cyan-400 mt-2 bg-cyan-400/10 px-2 py-1 rounded-full inline-block">
                          Airport Staff
                        </p>
                      </div>
                      
                      {/* Navigation Links */}
                      <div className="p-2 border-b border-slate-700">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                          Navigacija
                        </h3>
                        <div className="space-y-1">
                          {menuItems.map((item, index) => {
                            const IconComponent = item.icon
                            return (
                              <a
                                key={index}
                                href={item.url}
                                onClick={() => setShowUserMenu(false)}
                                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                                  item.isLive 
                                    ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/20' 
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                }`}
                                aria-label={item.altText || item.title}
                              >
                                <IconComponent className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span className="flex-1">{item.title}</span>
                                {item.isLive && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-red-400">LIVE</span>
                                  </span>
                                )}
                              </a>
                            )
                          })}
                        </div>
                      </div>

                      {/* Logout Section */}
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                        >
                          <IconLogOut className="w-4 h-4" aria-hidden="true" />
                          Odjavi se
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // User is not logged in - show login button
                <a 
                  href="/auth/login" 
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label="Staff login"
                >
                  Staff Login
                </a>
              )}
              <a 
                href="/tv-display" 
                className="group relative px-6 py-2  bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg font-medium text-sm overflow-hidden transition-all hover:scale-105 border border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="View live WIDS dashboard"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Live WIDS <IconChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        {/* Background Wildlife Image with Blur and Overlay */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-10"></div>
          {!imageError ? (
            <Image
              src="/wildlife-hero.jpg"
              alt="Wildlife monitoring at Tivat Airport"
              fill
              className="object-cover opacity-50"
              priority
              quality={75}
              sizes="100vw"
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback gradient background if image fails to load
            <div className="absolute inset-0  bg-linear-to-br from-slate-800 via-slate-900 to-blue-900 opacity-70"></div>
          )}
        </div>
        
        <div className="max-w-7xl mx-auto relative z-20">
          <div className="text-center bg-slate-900/30 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-slate-700/50">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-8 backdrop-blur-sm">
              <IconSparkles className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span className="text-sm text-slate-300">Aerodrom Tivat - ICAO: LYTV</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className=" bg-linear-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Wildlife Monitoring, Intelligence & 
              </span>
              <br />
              <span className="text-white">Analytics Platform</span>
            </h1>
            
            {isLoaded && (
              <div className="flex justify-center mb-6" aria-hidden="true">
                <span 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xl sm:text-[3rem] font-bold transform -rotate-6 transition-all duration-500 ${
                    colors[colorIndex].bg
                  } ${colors[colorIndex].text} ${colors[colorIndex].border} border shadow-lg`}
                >
                  Tivat Airport
                </span>
              </div>
            )}
            
            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-powered platform combining real-time wildlife monitoring with comprehensive analytics. 
              Protecting aviation safety through intelligent wildlife management and predictive risk assessment at Tivat International Airport.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto mb-16">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm"
                  role="figure"
                  aria-label={`${stat.number} ${stat.label}`}
                >
                  <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a 
                href="/tv-display" 
                className="group relative px-6 sm:px-8 py-3 sm:py-4  bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-base sm:text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="View live wildlife information display system"
              >
                <div className="absolute inset-0  bg-linear-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <IconEye className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  View Live WIDS
                  <IconChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </a>
              
              <a 
                href="/auth/login" 
                className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-800/50 border border-slate-700 rounded-xl font-semibold text-base sm:text-lg hover:bg-slate-800 hover:border-slate-600 transition-all backdrop-blur-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Access analytics portal"
              >
                <IconBarChart3 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                Analytics Portal
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-6">
              <IconZap className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span className="text-sm text-slate-300">Integrated System Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className=" bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Monitoring & Analytics Combined
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              Comprehensive wildlife management platform integrating real-time monitoring with advanced analytical capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-slate-800/50 border border-slate-700 rounded-2xl p-4 sm:p-6 hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:border-slate-600 backdrop-blur-sm focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900"
                tabIndex={0}
                role="article"
                aria-label={`Feature: ${feature.title}`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14  bg-linear-to-br ${feature.color} rounded-xl mb-4 sm:mb-5 shadow-lg group-hover:shadow-2xl transition-shadow border border-white/10`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 mb-3 sm:mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-1 sm:space-y-2" role="list">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" aria-hidden="true"></span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32  bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-6">
              <IconShield className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span className="text-sm text-slate-300">Comprehensive Benefits</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className=" bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Aviation Safety Through Intelligence
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Protecting aircraft, passengers, and wildlife through integrated monitoring and analytical solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-slate-800/50 border border-slate-700 rounded-2xl p-4 sm:p-6 hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:border-slate-600 backdrop-blur-sm text-center focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900"
                tabIndex={0}
                role="article"
                aria-label={`Benefit: ${benefit.title}`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16  bg-linear-to-br ${benefit.gradient} rounded-2xl mb-3 sm:mb-4 shadow-lg group-hover:shadow-2xl transition-shadow border border-white/10 mx-auto`}>
                  {benefit.icon}
                </div>
                
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white group-hover:text-cyan-400 transition-colors">
                  {benefit.title}
                </h3>
                
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {benefit.description}
                </p>

                <div className="mt-3 sm:mt-4">
                  <IconChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-hover:text-cyan-400 transition-colors mx-auto" aria-hidden="true" />
                </div>

                <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24  bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-700" role="contentinfo">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <div className="relative" aria-hidden="true">
                  <div className="absolute inset-0  bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75"></div>
                  <div className="relative bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <IconPlane className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  </div>
                </div>
                <span className="text-lg sm:text-xl font-bold">Tivat Airport WIDS</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                Wildlife Monitoring & Analytics Platform
              </p>
            </div>
            
            <div className="text-slate-400 text-xs sm:text-sm">
              <p>&copy; {new Date().getFullYear()} Tivat International Airport. Idea, Design & Development by Alen. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}