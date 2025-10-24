"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, AlertTriangle } from "lucide-react"

interface RiskMapProps {
  predictions: any[]
  detailed?: boolean
}

export function RiskMap({ predictions, detailed = false }: RiskMapProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-500 border-red-700"
      case "high":
        return "bg-orange-500 border-orange-600"
      case "medium":
        return "bg-yellow-500 border-yellow-600"
      case "low":
        return "bg-green-500 border-green-600"
      default:
        return "bg-gray-400 border-gray-500"
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "critical":
        return "Kritičan"
      case "high":
        return "Visok"
      case "medium":
        return "Srednji"
      case "low":
        return "Nizak"
      default:
        return risk
    }
  }

  // Simplified airport map representation
  const airportZones = [
    { id: 1, name: "Pista 14", x: 20, y: 30, width: 60, height: 15 },
    { id: 2, name: "Pista 32", x: 20, y: 50, width: 60, height: 15 },
    { id: 3, name: "Terminal", x: 30, y: 10, width: 40, height: 15 },
    { id: 4, name: "Hangari", x: 10, y: 70, width: 30, height: 20 },
    { id: 5, name: "Parking", x: 60, y: 70, width: 30, height: 20 },
  ]

  return (
    <div className="space-y-4">
      {/* Map Visualization */}
      <div className="relative bg-blue-50 border-2 border-blue-200 rounded-lg h-96">
        {/* Airport Layout */}
        {airportZones.map((zone) => (
          <div
            key={zone.id}
            className="absolute border border-gray-400 bg-white bg-opacity-80 rounded cursor-pointer hover:bg-opacity-100 transition-all"
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
            }}
            title={zone.name}
          >
            <div className="text-xs p-1 font-medium text-gray-700">
              {zone.name}
            </div>
          </div>
        ))}

        {/* Risk Predictions */}
        {predictions.map((prediction, index) => {
          // Simplified positioning based on coordinates
          const x = 10 + (index * 15) % 70
          const y = 20 + (index * 20) % 60

          return (
            <div
              key={prediction.id}
              className={`absolute w-8 h-8 rounded-full border-2 ${getRiskColor(prediction.risk_level)} flex items-center justify-center cursor-pointer transform hover:scale-125 transition-transform`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              title={`${prediction.location} - ${getRiskLabel(prediction.risk_level)} Rizik`}
            >
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          )
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border">
          <div className="text-sm font-medium mb-2">Legenda Rizika:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs">Kritičan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-xs">Visok</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs">Srednji</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs">Nizak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Predictions List */}
      {detailed && predictions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{prediction.location}</div>
                      <div className="text-sm text-muted-foreground">
                        {prediction.species || "Različite vrste"} • 
                        {(prediction.confidence * 100).toFixed(0)}% sigurnosti
                      </div>
                    </div>
                  </div>
                  <Badge className={getRiskColor(prediction.risk_level)}>
                    {getRiskLabel(prediction.risk_level)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {predictions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-2" />
          <p>Nema podataka za prikaz mape</p>
          <p className="text-sm">Generišite predikcije da biste vidjeli mapu rizika</p>
        </div>
      )}
    </div>
  )
}