// app/map/MapComponent.tsx - ROBUST VERSION
"use client"

import { useEffect, useState } from 'react'

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

interface MapComponentProps {
  markers: MapMarker[]
  center: [number, number]
  onMarkerClick: (marker: MapMarker) => void
}

export default function MapComponent({ markers = [], center, onMarkerClick }: MapComponentProps) {
  const [Map, setMap] = useState<any>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    // Dynamically import leaflet only on client side
    const initMap = async () => {
      try {
        const L = await import('leaflet')
        const { MapContainer, TileLayer, Marker, Popup, useMap } = await import('react-leaflet')
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Custom icons
        const createCustomIcon = (color: string) => {
          return new L.DivIcon({
            html: `
              <div style="
                background-color: ${color};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>
            `,
            className: 'custom-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })
        }

        const icons = {
          sighting: createCustomIcon('#3b82f6'),
          hazard: createCustomIcon('#ef4444'),
          task: createCustomIcon('#10b981'),
        }

        const MapContent = () => {
          const map = useMap()
          
          useEffect(() => {
            map.setView(center, map.getZoom())
          }, [center, map])

          return null
        }

        const DynamicMap = () => (
          <MapContainer
            key={`map-${center[0]}-${center[1]}`}
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapContent />

            {markers && markers.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.lat, marker.lng]}
                icon={icons[marker.type]}
                eventHandlers={{
                  click: () => onMarkerClick(marker),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-sm mb-1">{marker.title}</h3>
                    <div className="space-y-1 text-xs">
                      <p><strong>Tip:</strong> 
                        {marker.type === "sighting" && " Zapažanje"}
                        {marker.type === "hazard" && " Opasnost"}
                        {marker.type === "task" && " Zadatak"}
                      </p>
                      
                      {marker.species && (
                        <p><strong>Vrsta:</strong> {marker.species}</p>
                      )}
                      
                      {marker.count && (
                        <p><strong>Broj jedinki:</strong> {marker.count}</p>
                      )}
                      
                      {marker.severity && (
                        <p><strong>Ozbiljnost:</strong> 
                          {marker.severity === "critical" && " Kritično"}
                          {marker.severity === "high" && " Visoko"}
                          {marker.severity === "medium" && " Srednje"}
                          {marker.severity === "low" && " Nisko"}
                        </p>
                      )}
                      
                      {marker.priority && (
                        <p><strong>Prioritet:</strong> 
                          {marker.priority === "urgent" && " Hitan"}
                          {marker.priority === "high" && " Visok"}
                          {marker.priority === "medium" && " Srednji"}
                          {marker.priority === "low" && " Nizak"}
                        </p>
                      )}
                      
                      {marker.location && (
                        <p><strong>Lokacija:</strong> {marker.location}</p>
                      )}
                      
                      <p><strong>Vrijeme:</strong> {marker.timestamp.toLocaleDateString()}</p>
                      
                      {marker.description && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {marker.description.length > 100 
                            ? `${marker.description.substring(0, 100)}...` 
                            : marker.description
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )

        setMap(() => DynamicMap)
      } catch (error) {
        console.error('Error loading map:', error)
        setMapError('Greška pri učitavanju mape')
      }
    }

    initMap()
  }, [center, markers, onMarkerClick])

  if (mapError) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>{mapError}</p>
        </div>
      </div>
    )
  }

  if (!Map) {
    return (
      <div className="h-full w-full bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Učitavanje mape...</p>
        </div>
      </div>
    )
  }

  return <Map />
}