'use client'

import { useState, useEffect } from 'react'
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
  Activity
} from "lucide-react"
import Image from 'next/image'

// Optimized icons - only import what's used
const icons = {
  Plane, Shield, MapPin, BarChart3, Sparkles, Zap, ChevronRight, 
  Bird, Eye, Radio, Satellite, Brain, Activity
}

export default function ModernLandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [colorIndex, setColorIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Optimized colors array - removed black for better contrast
  const colors = [
    { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
    { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
    { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
    { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
    { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' }
  ]

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Optimized intervals with cleanup
  useEffect(() => {
    setIsLoaded(true)
    
    const colorInterval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length)
    }, 5000)

    return () => clearInterval(colorInterval)
  }, [colors.length])

  // Optimized features data
  const features = [
    {
      icon: <icons.Bird className="w-6 h-6" aria-hidden="true" />,
      title: "Real-time Bird Detection",
      description: "Instant notification system for bird activity within airport perimeter",
      color: "from-blue-500 to-cyan-500",
      items: ["Live tracking", "Automated alerts", "Species identification"]
    },
    {
      icon: <icons.MapPin className="w-6 h-6" aria-hidden="true" />,
      title: "Precise Location Mapping",
      description: "GPS-enabled wildlife sightings with exact coordinates on airport map",
      color: "from-emerald-500 to-teal-500",
      items: ["Interactive maps", "Hotspot analysis", "Movement patterns"]
    },
    {
      icon: <icons.Radio className="w-6 h-6" aria-hidden="true" />,
      title: "Acoustic Repellent Control",
      description: "Remote activation of bird deterrent systems across airport areas",
      color: "from-purple-500 to-pink-500",
      items: ["Zone control", "Schedule management", "Effectiveness tracking"]
    },
    {
      icon: <icons.Brain className="w-6 h-6" aria-hidden="true" />,
      title: "AI-Powered Analytics",
      description: "Advanced machine learning for wildlife behavior prediction and risk assessment",
      color: "from-orange-500 to-red-500",
      items: ["Pattern recognition", "Risk forecasting", "Predictive modeling"]
    },
    {
      icon: <icons.BarChart3 className="w-6 h-6" aria-hidden="true" />,
      title: "Comprehensive Reporting",
      description: "Detailed analytics and automated reporting for wildlife management decisions",
      color: "from-rose-500 to-pink-600",
      items: ["Custom reports", "Trend analysis", "Export capabilities"]
    },
    {
      icon: <icons.Satellite className="w-6 h-6" aria-hidden="true" />,
      title: "WIDS Live Display",
      description: "Public information system for real-time wildlife activity monitoring",
      color: "from-indigo-500 to-purple-600",
      items: ["TV dashboard", "Public alerts", "Live data feed"]
    }
  ]

  const benefits = [
    {
      icon: <icons.Shield className="w-5 h-5" aria-hidden="true" />,
      title: "Enhanced Flight Safety",
      description: "Reduce bird strike risks during takeoff and landing operations through proactive monitoring",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <icons.Activity className="w-5 h-5" aria-hidden="true" />,
      title: "Intelligent Wildlife Monitoring",
      description: "Advanced analytics and real-time tracking for comprehensive wildlife management",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <icons.BarChart3 className="w-5 h-5" aria-hidden="true" />,
      title: "Data-Driven Wildlife Analysis",
      description: "Make informed wildlife management decisions based on comprehensive analytics and insights",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <icons.Shield className="w-5 h-5" aria-hidden="true" />,
      title: "ICAO Compliance & Standards",
      description: "Meet international aviation safety standards for wildlife hazard management",
      gradient: "from-orange-500 to-red-500"
    }
  ]

  const stats = [
    { number: "99.7%", label: "System Uptime" },
    { number: "24/7", label: "Live Monitoring" },
    { number: "<30s", label: "Alert Response" },
    { number: "AI", label: "Powered Analytics" }
  ]

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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75"></div>
                <div className="relative bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <icons.Plane className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Tivat Airport WIDS
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/auth/login" 
                className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label="Staff login"
              >
                Staff Login
              </a>
              <a 
                href="/tv-display" 
                className="group relative px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium text-sm overflow-hidden transition-all hover:scale-105 border border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="View live WIDS dashboard"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Live WIDS <icons.ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        {/* Background Wildlife Image with Blur and Overlay */}
        {/* <div className="absolute inset-0 -z-10 overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 opacity-70"></div>
          )}
        </div> */}
        
        <div className="max-w-7xl mx-auto relative z-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-8 backdrop-blur-sm">
              <icons.Sparkles className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span className="text-sm text-slate-300">Aerodrom Tivat - ICAO: LYTV</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
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
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-base sm:text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="View live wildlife information display system"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <icons.Eye className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  View Live WIDS
                  <icons.ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </a>
              
              <a 
                href="/auth/login" 
                className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-800/50 border border-slate-700 rounded-xl font-semibold text-base sm:text-lg hover:bg-slate-800 hover:border-slate-600 transition-all backdrop-blur-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Access analytics portal"
              >
                <icons.BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
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
              <icons.Zap className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span className="text-sm text-slate-300">Integrated System Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-4 sm:mb-5 shadow-lg group-hover:shadow-2xl transition-shadow border border-white/10`}>
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
                      <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" aria-hidden="true"></span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
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
              <icons.Shield className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span className="text-sm text-slate-300">Comprehensive Benefits</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl mb-3 sm:mb-4 shadow-lg group-hover:shadow-2xl transition-shadow border border-white/10 mx-auto`}>
                  {benefit.icon}
                </div>
                
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white group-hover:text-cyan-400 transition-colors">
                  {benefit.title}
                </h3>
                
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {benefit.description}
                </p>

                <div className="mt-3 sm:mt-4">
                  <icons.ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-hover:text-cyan-400 transition-colors mx-auto" aria-hidden="true" />
                </div>

                <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75"></div>
                  <div className="relative bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <icons.Plane className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  </div>
                </div>
                <span className="text-lg sm:text-xl font-bold">Tivat Airport WIDS</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                Wildlife Monitoring & Analytics Platform
              </p>
            </div>
            
            <div className="text-slate-400 text-xs sm:text-sm">
              <p>&copy; {new Date().getFullYear()} Tivat International Airport. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}