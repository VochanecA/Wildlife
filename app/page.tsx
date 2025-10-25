'use client'

import { useState, useEffect } from 'react'
import { 
  Plane, 
  Shield, 
  Camera, 
  MapPin, 
  Users, 
  BarChart3, 
  Smartphone,
  Wifi,
  Database,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  ChevronRight,
  Bird,
  Eye,
  AlertTriangle,
  Radio,
  Satellite
} from "lucide-react"

export default function ModernLandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [colorIndex, setColorIndex] = useState(0)

  const colors = [
    { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
    { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
    { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
    { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
    { bg: 'bg-black', text: 'text-white', border: 'border-gray-800' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 4000)

    const colorInterval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length)
    }, 5000)

    return () => {
      clearInterval(featureInterval)
      clearInterval(colorInterval)
    }
  }, [])

  const features = [
    {
      icon: <Bird className="w-6 h-6" />,
      title: "Real-time Bird Detection",
      description: "Instant notification system for bird activity within airport perimeter",
      color: "from-blue-500 to-cyan-500",
      items: ["Live tracking", "Automated alerts", "Species identification"]
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Precise Location Mapping",
      description: "GPS-enabled wildlife sightings with exact coordinates on airport map",
      color: "from-emerald-500 to-teal-500",
      items: ["Interactive maps", "Hotspot analysis", "Movement patterns"]
    },
    {
      icon: <Radio className="w-6 h-6" />,
      title: "Acoustic Repellent Control",
      description: "Remote activation of bird deterrent systems across airport areas",
      color: "from-purple-500 to-pink-500",
      items: ["Zone control", "Schedule management", "Effectiveness tracking"]
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "24/7 Wildlife Monitoring",
      description: "Continuous surveillance with automated reporting and analytics",
      color: "from-orange-500 to-red-500",
      items: ["Live camera feeds", "Activity logs", "Risk assessment"]
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Predictive Analytics",
      description: "AI-powered risk prediction and wildlife behavior analysis",
      color: "from-rose-500 to-pink-600",
      items: ["Risk forecasting", "Trend analysis", "Preventive measures"]
    },
    {
      icon: <Satellite className="w-6 h-6" />,
      title: "WIDS Live Display",
      description: "Public information system for real-time wildlife activity monitoring",
      color: "from-indigo-500 to-purple-600",
      items: ["TV dashboard", "Public alerts", "Live data feed"]
    }
  ]

  const benefits = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Enhanced Flight Safety",
      description: "Reduce bird strike risks during takeoff and landing operations",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Centralized Data Hub",
      description: "All wildlife observations and safety data in one secure platform",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Data-Driven Decisions",
      description: "Make informed wildlife management decisions based on real analytics",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "ICAO Compliance",
      description: "Meet international aviation safety standards for wildlife management",
      gradient: "from-orange-500 to-red-500"
    }
  ]

  const stats = [
    { number: "99.7%", label: "Uptime Reliability" },
    { number: "24/7", label: "Live Monitoring" },
    { number: "<30s", label: "Alert Response" },
    { number: "100+", label: "Daily Detections" }
  ]

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75"></div>
                <div className="relative bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <Plane className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Tivat Airport WIDS
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/auth/login" className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors hover:bg-slate-800 rounded-lg">
                Staff Login
              </a>
              <a href="/tv-display" className="group relative px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium text-sm overflow-hidden transition-all hover:scale-105 border border-cyan-500/50">
                <span className="relative z-10 flex items-center gap-2">
                  Live WIDS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">Aerodrom Tivat - ICAO: LYTV</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-3[rem] font-bold transform -rotate-6 transition-all duration-500 ${colors[colorIndex].bg} ${colors[colorIndex].text} ${colors[colorIndex].border} border`}>
                  Airport
                </span> Wildlife Intelligence
              </span>
              <br />
              <span className="text-white">Display System</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-powered platform for real-time wildlife monitoring and bird strike prevention. 
              Protecting flights and enhancing aviation safety at Tivat International Airport.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">{stat.number}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a href="/tv-display" className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Eye className="w-5 h-5" />
                  View Live WIDS
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              
              <a href="/auth/login" className="px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-800 hover:border-slate-600 transition-all backdrop-blur-sm flex items-center justify-center">
                Staff Portal
              </a>
            </div>

            {/* Hero Visual */}
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-slate-800/80 border border-slate-700 rounded-3xl p-8 backdrop-blur-xl">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 flex items-center justify-center overflow-hidden relative border border-slate-700">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                  <div className="relative z-10 text-center p-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-2xl">
                      <Satellite className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Live Airport Monitoring
                    </h3>
                    <p className="text-slate-400">Real-time wildlife activity tracking and alerts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-6">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">System Capabilities</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Comprehensive Wildlife Management
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Advanced features designed specifically for airport wildlife control and aviation safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:border-slate-600 backdrop-blur-sm"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-5 shadow-lg group-hover:shadow-2xl transition-shadow border border-white/10`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-6">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-300">Safety Benefits</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Enhancing Aviation
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Safety Standards
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 mb-10">
                Protecting passengers, aircraft, and wildlife through advanced monitoring technology
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800 transition-all hover:border-slate-600 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-lg flex-shrink-0 shadow-lg border border-white/10`}>
                        <div className="text-white">{benefit.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-slate-800 border border-slate-700 rounded-3xl p-8 backdrop-blur-xl">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 flex items-center justify-center overflow-hidden relative border border-slate-700">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                  
                  <div className="relative z-10 text-center p-12">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-8 shadow-2xl border border-white/10">
                      <Plane className="w-16 h-16 text-white" />
                    </div>
                    
                    <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Tivat Airport
                    </h3>
                    
                    <p className="text-slate-300 text-lg mb-8">
                      Wildlife Intelligence & Safety
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1">ICAO</div>
                        <div className="text-xs text-slate-400">LYTV</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400 mb-1">WIDS</div>
                        <div className="text-xs text-slate-400">Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-3xl blur-2xl opacity-30"></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-3xl p-12 text-center backdrop-blur-xl">
              <AlertTriangle className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Live Wildlife
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Monitoring Active
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Real-time bird activity tracking and safety alerts operational at Tivat International Airport
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/tv-display" className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 border border-cyan-500/50">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Eye className="w-5 h-5" />
                    View Live Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                
                <a href="/auth/login" className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-750 hover:border-slate-600 transition-all flex items-center justify-center">
                  Staff Access
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75"></div>
                  <div className="relative bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <Plane className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <span className="text-xl font-bold">Tivat Airport WIDS</span>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <span>Wildlife Intelligence Display System</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold transform -rotate-6 transition-all duration-500 ${colors[colorIndex].bg} ${colors[colorIndex].text} ${colors[colorIndex].border} border`}>
                  Airport
                </span>
              </p>
            </div>
            
            <div className="text-slate-400 text-sm">
              <p>&copy; 2024 Tivat International Airport. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}