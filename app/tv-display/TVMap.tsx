// app/tv-display/TVMap.tsx
"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix za ikonice u Leafletu
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

interface TVMapProps {
  sightings: TVSighting[]
  getSightingColor: (timestamp: string) => string
  isRecentSighting: (timestamp: string) => boolean
}

export default function TVMap({ sightings, getSightingColor, isRecentSighting }: TVMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Inicijalizacija mape
    mapRef.current = L.map(mapContainerRef.current).setView([42.4043, 18.7235], 15)

    // Dodaj OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapRef.current)

    // Dodaj airport area polygon
    const airportBounds = L.polygon([
      [42.4080, 18.7180],
      [42.4080, 18.7280],
      [42.4000, 18.7280],
      [42.4000, 18.7180]
    ], {
      color: 'rgba(0, 0, 0, 0.3)',
      fillColor: 'rgba(100, 100, 100, 0.1)',
      fillOpacity: 0.2,
      weight: 2
    }).addTo(mapRef.current)

    // Dodaj runway
    const runway = L.polygon([
      [42.4050, 18.7220],
      [42.4050, 18.7250],
      [42.4035, 18.7250],
      [42.4035, 18.7220]
    ], {
      color: 'rgba(255, 255, 255, 0.8)',
      fillColor: 'rgba(255, 255, 255, 0.3)',
      fillOpacity: 0.5,
      weight: 1
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Ukloni stare markere
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Dodaj nove markere
    sightings.forEach(sighting => {
      const color = getSightingColor(sighting.timestamp)
      const isRecent = isRecentSighting(sighting.timestamp)
      
      // Kreiraj custom ikonicu sa blink efektom za recent sightings
      const icon = L.divIcon({
        className: `custom-marker ${isRecent ? 'blink-marker' : ''}`,
        html: `
          <div class="marker-container">
            <div class="marker-main" style="
              background-color: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 10px;
              position: relative;
              z-index: 2;
            ">
              ${sighting.count}
              ${sighting.sound_used ? `
                <div style="
                  position: absolute;
                  top: -8px;
                  right: -8px;
                  background: purple;
                  border-radius: 50%;
                  width: 16px;
                  height: 16px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: 2px solid white;
                  font-size: 8px;
                ">
                  🔊
                </div>
              ` : ''}
            </div>
            ${isRecent ? `
              <div class="pulse-ring"></div>
              <div class="pulse-ring delay-1"></div>
              <div class="pulse-ring delay-2"></div>
            ` : ''}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })

      const marker = L.marker([sighting.lat, sighting.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #333; font-weight: bold;">${sighting.species}</h3>
            <p style="margin: 4px 0; color: #666;">
              <strong>Lokacija:</strong> ${sighting.location}
            </p>
            <p style="margin: 4px 0; color: #666;">
              <strong>Broj:</strong> ${sighting.count}
            </p>
            <p style="margin: 4px 0; color: #666;">
              <strong>Vrijeme:</strong> ${new Date(sighting.timestamp).toLocaleString('bs-BA')}
            </p>
            ${sighting.sound_used ? `
              <p style="margin: 4px 0; color: purple; font-weight: bold;">
                <strong>🔊 Repelent primjenjen</strong>
              </p>
            ` : ''}
            ${sighting.notes ? `
              <p style="margin: 4px 0; color: #666;">
                <strong>Napomene:</strong> ${sighting.notes}
              </p>
            ` : ''}
          </div>
        `)

      markersRef.current.push(marker)
    })

  }, [sightings, getSightingColor, isRecentSighting])

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full"
    />
  )
}