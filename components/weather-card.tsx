// components/weather-card.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  CloudFog,
  HelpCircle,
  RefreshCw
} from "lucide-react"
import { getWeatherData, getWeatherInfo } from "@/lib/weather"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface WeatherCardProps {
  initialData: Awaited<ReturnType<typeof getWeatherData>>
}

export function WeatherCard({ initialData }: WeatherCardProps) {
  const [weatherData, setWeatherData] = useState(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const refreshWeather = async () => {
    setIsRefreshing(true)
    try {
      const newData = await getWeatherData()
      setWeatherData(newData)
      toast({
        title: "Vrijeme ažurirano",
        description: "Trenutni vremenski podaci su osvježeni",
      })
    } catch (error) {
      toast({
        title: "Greška",
        description: "Došlo je do greške pri osvježavanju vremena",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Formatiranje vremena koje je konzistentno
  const formatTime = (date: Date) => {
    if (!isMounted) {
      // Prikaz tokom SSR-a
      return date.toISOString().split('T')[1].slice(0, 5)
    }
    
    // Prikaz na klijentu
    return date.toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })
  }

  if (!weatherData) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Vremenska Prognoza</CardTitle>
          <CardDescription>Aerodrom Tivat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm text-gray-500">Podaci o vremenu nisu dostupni</p>
            <Button onClick={refreshWeather} disabled={isRefreshing} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Pokušaj ponovo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { current } = weatherData;
  const weatherInfo = getWeatherInfo(current.weather_code);

  const getWeatherIcon = (iconName: string) => {
    const iconProps = { className: "w-6 h-6" };
    
    switch (iconName) {
      case 'sun': return <Sun {...iconProps} className="text-yellow-500" />
      case 'cloud-sun': return <CloudSun {...iconProps} className="text-orange-400" />
      case 'cloud': return <Cloud {...iconProps} className="text-gray-500" />
      case 'cloud-rain': return <CloudRain {...iconProps} className="text-blue-500" />
      case 'cloud-drizzle': return <CloudRain {...iconProps} className="text-blue-400" />
      case 'cloud-lightning': return <CloudLightning {...iconProps} className="text-purple-500" />
      case 'cloud-fog': return <CloudFog {...iconProps} className="text-gray-400" />
      case 'cloud-snow': return <CloudSnow {...iconProps} className="text-blue-200" />
      default: return <HelpCircle {...iconProps} className="text-gray-400" />
    }
  }

  // Pronađi maksimalnu i minimalnu temperaturu za danas
  const todayTemperatures = weatherData.hourly.temperature_2m.slice(0, 24);
  const maxTemp = Math.max(...todayTemperatures);
  const minTemp = Math.min(...todayTemperatures);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Vremenska Prognoza</CardTitle>
            <CardDescription>Aerodrom Tivat</CardDescription>
          </div>
          <Button 
            onClick={refreshWeather} 
            disabled={isRefreshing} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Ažuriranje...' : 'Osveži'}
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          Ažurirano: {formatTime(current.time)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getWeatherIcon(weatherInfo.icon)}
            <div>
              <div className="text-2xl font-bold">{Math.round(current.temperature_2m)}°C</div>
              <div className="text-sm text-gray-600">{weatherInfo.description}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Osjećaj:</span>
              <span className="font-medium">{Math.round(current.apparent_temperature)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vlažnost:</span>
              <span className="font-medium">{Math.round(current.relative_humidity_2m)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Vjetar:</span>
              <span className="font-medium">{Math.round(current.wind_speed_10m)} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Padavine:</span>
              <span className="font-medium">{current.precipitation} mm</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Max: {Math.round(maxTemp)}°C</span>
            <span className="text-gray-500">Min: {Math.round(minTemp)}°C</span>
          </div>
        </div>

        {/* Jednostavan prikaz sljedećih nekoliko sati */}
        <div className="pt-2">
          <div className="text-xs text-gray-500 mb-2">Sljedećih sati:</div>
          <div className="flex space-x-3 overflow-x-auto pb-1">
            {weatherData.hourly.time.slice(0, 6).map((time, index) => (
              <div key={index} className="flex flex-col items-center text-xs">
                <span className="text-gray-500">
                  {formatTime(time)}
                </span>
                <div className="my-1">
                  {getWeatherIcon(getWeatherInfo(weatherData.hourly.weather_code[index]).icon)}
                </div>
                <span className="font-medium">
                  {Math.round(weatherData.hourly.temperature_2m[index])}°
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}