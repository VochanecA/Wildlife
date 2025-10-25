// app/tv-display/page.tsx
"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { Volume2, Clock, MapPin, RefreshCw, AlertTriangle } from "lucide-react"

// Dynamic import za mapu
const TVMap = dynamic(() => import('./TVMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-20 h-20 mx-auto text-gray-400 mb-4" />
        <p className="text-2xl font-semibold text-gray-600">Učitavanje mape...</p>
      </div>
    </div>
  )
})

interface TVSighting {
  id: string
  lat: number
  lng: number
  species: string
  count: number
  location: string
  timestamp: string
  sound_used: boolean
  notes?: string
  severity: string
}

export default function TVDisplayPage() {
  const [sightings, setSightings] = useState<TVSighting[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)

  const fetchSightings = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/tv-sightings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 0 } // Onemogući cache
      })

      if (!response.ok) {
        throw new Error('Failed to fetch sightings')
      }

      const data = await response.json()
      
      if (data.sightings) {
        setSightings(data.sightings)
      }
      
      if (data.lastUpdate) {
        setLastUpdate(new Date(data.lastUpdate))
      }

    } catch (err) {
      console.error("Error fetching TV display data:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    // Prvi fetch
    fetchSightings()

    // Auto-refresh svakih 60 sekundi
    const interval = setInterval(fetchSightings, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Filtriraj zapažanja za breaking news (poslednjih sat vremena)
  const breakingNewsSightings = sightings.filter(sighting => {
    const now = new Date()
    const sightingTime = new Date(sighting.timestamp)
    const diffHours = (now.getTime() - sightingTime.getTime()) / (1000 * 60 * 60)
    return diffHours <= 1 // Poslednjih sat vremena
  })

  // Rotiraj breaking news svakih 10 sekundi
  useEffect(() => {
    if (breakingNewsSightings.length === 0) return

    const newsInterval = setInterval(() => {
      setCurrentNewsIndex(prev => 
        prev === breakingNewsSightings.length - 1 ? 0 : prev + 1
      )
    }, 10000) // 10 sekundi

    return () => clearInterval(newsInterval)
  }, [breakingNewsSightings.length])

  // Kategorizacija po vremenu
  const getSightingColor = (timestamp: string): string => {
    const now = new Date()
    const sightingTime = new Date(timestamp)
    const diffHours = (now.getTime() - sightingTime.getTime()) / (1000 * 60 * 60)

    if (diffHours <= 0.5) return 'red'     // Poslednjih 30 minuta
    if (diffHours <= 1) return 'orange'    // Poslednjih sat vremena
    if (diffHours <= 3) return 'yellow'    // Poslednja 3 sata
    if (diffHours <= 6) return 'blue'      // Poslednjih 6 sati
    return 'green'                         // Poslednjih 10 sati
  }

  // Provjera da li je zapažanje unutar poslednjih 30 minuta za blink efekt
  const isRecentSighting = (timestamp: string): boolean => {
    const now = new Date()
    const sightingTime = new Date(timestamp)
    const diffMinutes = (now.getTime() - sightingTime.getTime()) / (1000 * 60)
    return diffMinutes <= 30
  }

  // Formatiranje vremena za breaking news
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const sightingTime = new Date(timestamp)
    const diffMinutes = Math.floor((now.getTime() - sightingTime.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'upravo sada'
    if (diffMinutes === 1) return 'prije 1 minut'
    if (diffMinutes < 60) return `prije ${diffMinutes} minuta`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours === 1) return 'prije 1 sat'
    return `prije ${diffHours} sata`
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-20 h-20 mx-auto text-gray-400 mb-4 animate-pulse" />
          <p className="text-2xl font-semibold text-gray-600">Učitavanje Wildlife Display System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Wildlife Information Display System</h1>
            <p className="text-gray-300 mt-1">Aerodrom Tivat - Real-time Bird Activity Monitoring</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{lastUpdate.toLocaleTimeString('bs-BA')}</span>
              </div>
              <div className="text-gray-300">
                {sightings.length} aktivnih zapažanja
              </div>
              <button 
                onClick={fetchSightings}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Osvježavam...' : 'Osvježi'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-700 text-white p-3 border-b border-gray-600">
        <div className="flex justify-center items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
            <span>Poslednjih 30 minuta (BLINK)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>Poslednjih sat vremena</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Poslednja 3 sata</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Poslednjih 6 sati</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Poslednjih 10 sati</span>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span>Primjenjen repelent</span>
          </div>
        </div>
      </div>

      {/* Main Map */}
      <div className="flex-1">
        <TVMap 
          sightings={sightings}
          getSightingColor={getSightingColor}
          isRecentSighting={isRecentSighting}
        />
      </div>

      {/* Breaking News Scroller */}
      {breakingNewsSightings.length > 0 && (
        <div className="bg-red-600 border-t-4 border-red-400">
          <div className="flex items-center px-4 py-2 bg-red-700">
            <div className="flex items-center gap-2 mr-4">
              <AlertTriangle className="w-5 h-5 text-white animate-pulse text-align-center" />
              <span className="font-bold text-yellow-300 text-lg">POSLJEDNJA OPAŽANJA</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex animate-scroll">
                {breakingNewsSightings.map((sighting, index) => (
                  <div
                    key={sighting.id}
                    className={`shrink-0 w-full flex items-center gap-6 px-4 ${
                      index === currentNewsIndex ? 'block' : 'hidden'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        isRecentSighting(sighting.timestamp) ? 'bg-red-300 animate-pulse' : 'bg-orange-300'
                      }`} />
                      <span className="text-white font-semibold text-lg">
                        {sighting.species}
                      </span>
                      <span className="text-red-100 text-lg">
                        Lokacija: {sighting.location}
                      </span>
                      <span className="text-red-100 text-lg">
                        Broj: {sighting.count} jedinki
                      </span>
                      {sighting.sound_used && (
                        <span className="flex items-center gap-1 text-purple-200 text-lg">
                          <Volume2 className="w-4 h-4" />
                          Repelent aktiviran
                        </span>
                      )}
                      <span className="text-red-200 text-lg font-medium">
                        {getTimeAgo(sighting.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-red-200 text-sm">
                {currentNewsIndex + 1} / {breakingNewsSightings.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-800 text-white p-3 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-gray-300">Aerodrom Tivat Wildlife Management System; Ide, code and implementation by Alen, copyright 2025</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Auto-refresh: 60 sekundi
            </span>
            {/* <span>Updateovano u: {lastUpdate.toLocaleTimeString('bs-BA')}</span> */}
            <span>Posljednje ažuriranje: {lastUpdate.toLocaleString('bs-BA')}</span>
          </div>
        </div>
      </div>

      {/* CSS za animacije */}
      <style jsx global>{`
        .marker-container {
          position: relative;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 3px solid red;
          border-radius: 50%;
          animation: pulse 2s infinite;
          z-index: 1;
        }

        .pulse-ring.delay-1 {
          animation-delay: 0.5s;
          width: 50px;
          height: 50px;
        }

        .pulse-ring.delay-2 {
          animation-delay: 1s;
          width: 60px;
          height: 60px;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        .blink-marker .marker-main {
          animation: blink 1.5s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .leaflet-container {
          background: #1a202c;
          font-family: inherit;
        }

        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        /* Animacija za breaking news scroller */
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  )
}