// app/map/SimpleMap.tsx
"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapMarker {
  id: string
  type: "sighting" | "hazard" | "task"
  lat: number
  lng: number
  title: string
  description?: string
  severity?: string
  priority?: string
  location?: string
  species?: string
  count?: number
  timestamp: Date
  status?: string
}

interface SimpleMapProps {
  markers: MapMarker[]
  center: [number, number]
  onMarkerClick: (marker: MapMarker) => void
}

export default function SimpleMap({ markers = [], center, onMarkerClick }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, 15)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current)
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    markers.forEach(marker => {
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${getMarkerColor(marker.type)};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
        `,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: 600; font-size: 0.875rem; margin-bottom: 4px;">${marker.title}</h3>
            <div style="font-size: 0.75rem;">
              <p><strong>Tip:</strong> ${getTypeText(marker.type)}</p>
              ${marker.species ? `<p><strong>Vrsta:</strong> ${marker.species}</p>` : ''}
              ${marker.count ? `<p><strong>Broj jedinki:</strong> ${marker.count}</p>` : ''}
              ${marker.severity ? `<p><strong>Ozbiljnost:</strong> ${getSeverityText(marker.severity)}</p>` : ''}
              ${marker.priority ? `<p><strong>Prioritet:</strong> ${getPriorityText(marker.priority)}</p>` : ''}
              ${marker.location ? `<p><strong>Lokacija:</strong> ${marker.location}</p>` : ''}
              <p><strong>Vrijeme:</strong> ${marker.timestamp.toLocaleDateString()}</p>
              ${marker.description ? `<p style="margin-top: 8px; color: #6b7280; font-size: 0.7rem;">${marker.description.length > 100 ? marker.description.substring(0, 100) + '...' : marker.description}</p>` : ''}
            </div>
          </div>
        `)

      leafletMarker.on('click', () => {
        onMarkerClick(marker)
      })

      markersRef.current.push(leafletMarker)
    })

    // Update map center
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom())
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => {
          mapInstanceRef.current?.removeLayer(marker)
        })
        markersRef.current = []
      }
    }
  }, [markers, center, onMarkerClick])

  // Helper functions
  const getMarkerColor = (type: string) => {
    switch (type) {
      case "sighting": return '#3b82f6' // blue
      case "hazard": return '#ef4444'   // red
      case "task": return '#10b981'     // green
      default: return '#6b7280'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "critical": return "Kritično"
      case "high": return "Visoko"
      case "medium": return "Srednje"
      case "low": return "Nisko"
      default: return severity
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent": return "Hitan"
      case "high": return "Visok"
      case "medium": return "Srednji"
      case "low": return "Nizak"
      default: return priority
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "sighting": return "Zapažanje"
      case "hazard": return "Opasnost"
      case "task": return "Zadatak"
      default: return type
    }
  }

  return <div ref={mapRef} className="h-full w-full" />
}