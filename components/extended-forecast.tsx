// components/extended-forecast.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getExtendedForecast, getWeatherInfo } from "@/lib/weather"
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  CloudFog,
  HelpCircle,
  Umbrella,
  Wind,
  Sunrise,
  Sunset,
  Gauge,
  RefreshCw
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface ExtendedForecastProps {
  initialData: Awaited<ReturnType<typeof getExtendedForecast>>
}

export function ExtendedForecast({ initialData }: ExtendedForecastProps) {
  const [forecastData, setForecastData] = useState(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const refreshForecast = async () => {
    setIsRefreshing(true)
    try {
      const newData = await getExtendedForecast()
      setForecastData(newData)
      toast({
        title: "Prognoza ažurirana",
        description: "Vremenska prognoza je uspješno osvježena",
      })
    } catch (error) {
      toast({
        title: "Greška",
        description: "Došlo je do greške pri osvježavanju prognoze",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Formatiranje datuma koji je konzistentan između servera i klijenta
  const formatDate = (date: Date) => {
    if (!isMounted) {
      // Prikaz tokom SSR-a - koristimo ISO format koji je konzistentan
      return date.toISOString().split('T')[0].split('-').reverse().join('.')
    }
    
    // Prikaz na klijentu - koristimo lokalni format
    return date.toLocaleDateString('bs-BA', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  const formatWeekday = (date: Date, isToday: boolean) => {
    if (!isMounted) {
      // Prikaz tokom SSR-a
      return isToday ? 'Danas' : date.toLocaleDateString('en-US', { weekday: 'short' })
    }
    
    // Prikaz na klijentu
    return isToday ? 'Danas' : date.toLocaleDateString('bs-BA', { weekday: 'short' })
  }

  if (!forecastData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">7-Dnevna Prognoza</CardTitle>
          <CardDescription>Aerodrom Tivat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm text-gray-500">Podaci o prognozi nisu dostupni</p>
            <Button onClick={refreshForecast} disabled={isRefreshing} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Pokušaj ponovo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { daily } = forecastData;

  // Provjera da li su svi potrebni podaci dostupni
  const hasSunData = daily.sunrise && daily.sunset && daily.sunrise.length > 0 && daily.sunset.length > 0;
  const hasPrecipitationData = daily.precipitation_sum && daily.precipitation_probability_max;
  const hasWindData = daily.wind_speed_10m_max;

  const getWeatherIcon = (iconName: string, size = "w-5 h-5") => {
    const iconProps = { className: `${size}` };
    
    switch (iconName) {
      case 'sun': return <Sun {...iconProps} className={`${size} text-yellow-500`} />
      case 'cloud-sun': return <CloudSun {...iconProps} className={`${size} text-orange-400`} />
      case 'cloud': return <Cloud {...iconProps} className={`${size} text-gray-500`} />
      case 'cloud-rain': return <CloudRain {...iconProps} className={`${size} text-blue-500`} />
      case 'cloud-drizzle': return <CloudRain {...iconProps} className={`${size} text-blue-400`} />
      case 'cloud-lightning': return <CloudLightning {...iconProps} className={`${size} text-purple-500`} />
      case 'cloud-fog': return <CloudFog {...iconProps} className={`${size} text-gray-400`} />
      case 'cloud-snow': return <CloudSnow {...iconProps} className={`${size} text-blue-200`} />
      default: return <HelpCircle {...iconProps} className={`${size} text-gray-400`} />
    }
  }

  const formatTime = (timestamp: number) => {
    try {
      return new Date(timestamp * 1000).toLocaleTimeString('bs-BA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'N/A';
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">7-Dnevna Prognoza</CardTitle>
            <CardDescription>Detaljna vremenska prognoza za narednih 7 dana</CardDescription>
          </div>
          <Button 
            onClick={refreshForecast} 
            disabled={isRefreshing} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Ažuriranje...' : 'Osveži'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {daily.time.map((date, index) => {
            const weatherInfo = getWeatherInfo(daily.weather_code[index]);
            const isToday = index === 0;
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-center w-16">
                    <div className="font-medium text-sm">
                      {formatWeekday(date, isToday)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(date)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getWeatherIcon(weatherInfo.icon, "w-6 h-6")}
                    <div className="w-20">
                      <div className="text-xs text-gray-600 leading-tight">
                        {weatherInfo.description}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  {/* Temperature */}
                  <div className="text-right w-16">
                    <div className="font-semibold">{Math.round(daily.temperature_2m_max[index])}°</div>
                    <div className="text-gray-500 text-xs">{Math.round(daily.temperature_2m_min[index])}°</div>
                  </div>

                  {/* Precipitation */}
                  {hasPrecipitationData && daily.precipitation_probability_max[index] > 0 && (
                    <div className="flex items-center space-x-1 w-12">
                      <Umbrella className="w-3 h-3 text-blue-500" />
                      <div className="text-xs">
                        <div>{Math.round(daily.precipitation_sum[index] || 0)}mm</div>
                        <div className="text-gray-500">{Math.round(daily.precipitation_probability_max[index] || 0)}%</div>
                      </div>
                    </div>
                  )}

                  {/* Wind */}
                  {hasWindData && (
                    <div className="flex items-center space-x-1 w-12">
                      <Wind className="w-3 h-3 text-gray-500" />
                      <div className="text-xs">
                        {Math.round(daily.wind_speed_10m_max[index])} km/h
                      </div>
                    </div>
                  )}

                  {/* Sunrise/Sunset - samo za danas i ako su podaci dostupni */}
                  {isToday && hasSunData && (
                    <div className="flex items-center space-x-2 text-xs w-20">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Sunrise className="w-3 h-3 text-orange-500" />
                          <span>{formatTime(daily.sunrise[index])}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Sunset className="w-3 h-3 text-red-500" />
                          <span>{formatTime(daily.sunset[index])}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UV Index za danas */}
                  {isToday && daily.uv_index_max && (
                    <div className="flex items-center space-x-1 text-xs">
                      <Gauge className="w-3 h-3 text-purple-500" />
                      <div>
                        <div>UV</div>
                        <div className="font-medium">{Math.round(daily.uv_index_max[index])}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span>🌡️ Max/Min temperatura</span>
              </div>
              <div className="flex items-center space-x-2">
                <Umbrella className="w-3 h-3" />
                <span>Padavine (mm/%)</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Wind className="w-3 h-3" />
                <span>Brzina vjetra (km/h)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sunrise className="w-3 h-3" />
                <span>Izlasci/zalasci sunca</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}