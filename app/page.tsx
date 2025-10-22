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
  ChevronRight
} from "lucide-react"

export default function ModernLandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Evidentiranje Zapažanja",
      description: "Brzo i jednostavno evidentiranje zapažanja divljači sa tačnom lokacijom",
      color: "from-blue-500 to-cyan-500",
      items: ["GPS lokacija", "Fotografije i opisi", "Kategorizacija vrsta"]
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Praćenje Opasnosti",
      description: "Detaljno praćenje i upravljanje izvještajima o potencijalnim opasnostima",
      color: "from-emerald-500 to-teal-500",
      items: ["Prioriteti opasnosti", "Status praćenja", "Dodela zadataka"]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Timski Rad",
      description: "Koordinacija timova i efikasna komunikacija između članova osoblja",
      color: "from-purple-500 to-pink-500",
      items: ["Dodela uloga", "Poruke i notifikacije", "Izvještaji tima"]
    },
    {
      icon: <Wifi className="w-6 h-6" />,
      title: "Offline Rad",
      description: "Potpuna funkcionalnost i bez internet konekcije na terenu",
      color: "from-orange-500 to-red-500",
      items: ["Lokalno skladištenje", "Automatska sinhronizacija", "PWA podrška"]
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analitika i Izvještaji",
      description: "Detaljni izvještaji i analize podataka za donošenje odluka",
      color: "from-rose-500 to-pink-600",
      items: ["Statistike zapažanja", "Trendovi aktivnosti", "PDF izvoz"]
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile First",
      description: "Optimizovano za rad na mobilnim uređajima u svim uslovima",
      color: "from-indigo-500 to-purple-600",
      items: ["Responsive dizajn", "Brzo učitavanje", "Intuitivan interfejs"]
    }
  ]

  const benefits = [
    {
      icon: <Plane className="w-5 h-5" />,
      title: "Povećana Bezbednost Letova",
      description: "Smanjite rizik od sudara sa divljači tokom poletanja i slijetanja uz pravovremeno upozorenje.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Centralizovani Podaci",
      description: "Svi podaci o zapažanjima, opasnostima i aktivnostima na jednom mjestu.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Donosenje Oslonjem na Podatke",
      description: "Analizirajte trendove i donosite informisane odluke za upravljanje divljači.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Sprovedba Standarda",
      description: "Zadovoljite međunarodne standarde bezbjednosti za upravljanje divljači na aerodromima.",
      gradient: "from-orange-500 to-red-500"
    }
  ]

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-slate-950"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75"></div>
                <div className="relative bg-slate-900 p-2 rounded-lg">
                  <Plane className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Wildlife Management
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/auth/login" className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Prijavite se
              </a>
              <a href="/dashboard" className="group relative px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium text-sm overflow-hidden transition-all hover:scale-105">
                <span className="relative z-10 flex items-center gap-2">
                  Započnite <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">Aerodrom Tivat</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Wildlife Management
              </span>
              <br />
              <span className="text-white">Nove Generacije</span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Napredna AI-powered platforma za upravljanje sigurnošću divljači i monitoring opasnosti. 
              Real-time praćenje koje štiti živote i poboljšava bezbjednost letova.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a href="/auth/login" className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Prijavite se
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              
              <a href="/dashboard" className="px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-800 hover:border-slate-600 transition-all backdrop-blur-sm flex items-center justify-center">
                Pogledajte Demo
              </a>
            </div>

            {/* Hero Visual */}
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-30"></div>
              <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
                  <div className="relative z-10 text-center p-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6 shadow-2xl">
                      <Plane className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Smart Monitoring
                    </h3>
                    <p className="text-slate-400">AI-powered wildlife detection & tracking</p>
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
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">Moćne Mogućnosti</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sve što Vam Treba
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Sveobuhvatno rješenje za upravljanje divljači i prevenciju opasnosti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900 transition-all duration-300 hover:scale-105 hover:border-slate-700 backdrop-blur-sm"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-5 shadow-lg group-hover:shadow-2xl transition-shadow`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">Prednosti</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Zašto Aerodrom Tivat
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Bira Nas
                </span>
              </h2>
              
              <p className="text-xl text-slate-400 mb-10">
                Poboljšajte bezbjednost i efikasnost sa sistemom koji postavlja nove standarde
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="group relative bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:bg-slate-900 transition-all hover:border-slate-700 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-lg flex-shrink-0 shadow-lg`}>
                        <div className="text-white">{benefit.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
                  
                  <div className="relative z-10 text-center p-12">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl mb-8 shadow-2xl animate-pulse">
                      <Plane className="w-16 h-16 text-white" />
                    </div>
                    
                    <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Aerodrom Tivat
                    </h3>
                    
                    <p className="text-slate-400 text-lg mb-8">
                      Napredni Wildlife Management
                    </p>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">24/7</div>
                        <div className="text-xs text-slate-500">Monitoring</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-1">AI</div>
                        <div className="text-xs text-slate-500">Powered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-pink-400 mb-1">99%</div>
                        <div className="text-xs text-slate-500">Uptime</div>
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
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-50"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center backdrop-blur-xl">
              <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-6" />
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Spremni za
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Budućnost?
                </span>
              </h2>
              
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Pridružite se timu Aerodroma Tivat i unaprijedite upravljanje sigurnošću divljači uz najmoderniju tehnologiju
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/auth/login" className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    Započnite Sada
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                
                <a href="/dashboard" className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-750 hover:border-slate-600 transition-all flex items-center justify-center">
                  Kreirajte Nalog
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75"></div>
                  <div className="relative bg-slate-900 p-2 rounded-lg">
                    <Plane className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <span className="text-xl font-bold">Aerodrom Tivat</span>
              </div>
              <p className="text-slate-500 text-sm">
                Wildlife Management Platforma
              </p>
            </div>
            
            <div className="text-slate-500 text-sm">
              <p>&copy; 2024 Aerodrom Tivat. Sva prava zadržana.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}