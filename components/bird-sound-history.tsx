// components/bird-sounds-history.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Calendar, 
  BarChart3, 
  Play, 
  Download,
  Volume2,
  AlertTriangle,
  Bird,
  Zap,
  Clock,
  Sun,
  Moon,
  TrendingUp
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface SoundUsage {
  id: string
  bird_species: string
  sound_type: 'bird' | 'gunshot'
  duration_seconds: number
  location: string
  created_at: string
  user_id: string
}

// DODAJEMO: Interfejs za TimeOfDayData
interface TimeOfDayData {
  count: number
  sounds: Map<string, number>
}

interface Statistics {
  totalPlaybacks: number
  totalDuration: number
  mostUsedSound: string
  leastUsedSound: string
  usageBySpecies: { species: string; count: number; totalDuration: number }[]
  usageByPeriod: { period: string; count: number }[]
  usageByTimeOfDay: { 
    period: string; 
    count: number; 
    percentage: number;
    mostUsedSound: string;
    icon: JSX.Element 
  }[]
  peakUsageHour: { hour: string; count: number }
  dailyAverage: number
  weeklyTrend: { day: string; count: number }[]
}

export function BirdSoundsHistory() {
  const [history, setHistory] = useState<SoundUsage[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [searchDate, setSearchDate] = useState('')
  const [searchMonth, setSearchMonth] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'history' | 'statistics'>('history')
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
    fetchStatistics()
  }, [])

  useEffect(() => {
    if (searchDate || searchMonth) {
      fetchHistory()
    }
  }, [searchDate, searchMonth])

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('bird_sound_usage')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      // Primjeni filtere
      if (searchDate) {
        const startDate = new Date(searchDate)
        const endDate = new Date(searchDate)
        endDate.setDate(endDate.getDate() + 1)
        
        query = query
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString())
      }

      if (searchMonth) {
        const [year, month] = searchMonth.split('-')
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
        const endDate = new Date(parseInt(year), parseInt(month), 1)
        
        query = query
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching history:', error)
        toast({
          title: "Greška",
          description: "Došlo je do greške pri učitavanju istorije",
          variant: "destructive"
        })
      } else {
        setHistory(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Dobij sve podatke za statistiku
      const { data, error } = await supabase
        .from('bird_sound_usage')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      if (data && data.length > 0) {
        const stats = calculateStatistics(data)
        setStatistics(stats)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  // DODAJEMO: Funkcija getTimePeriodIcon
  const getTimePeriodIcon = (period: string) => {
    if (period.includes('Jutro')) return <Sun className="w-4 h-4 text-yellow-500" />
    if (period.includes('Podne')) return <Sun className="w-4 h-4 text-orange-500" />
    if (period.includes('Veče')) return <Moon className="w-4 h-4 text-blue-500" />
    return <Moon className="w-4 h-4 text-indigo-500" />
  }

  const calculateStatistics = (data: SoundUsage[]): Statistics => {
    // Grupisi po vrstama
    const speciesMap = new Map<string, { count: number; totalDuration: number }>()
    
    data.forEach(usage => {
      const existing = speciesMap.get(usage.bird_species) || { count: 0, totalDuration: 0 }
      speciesMap.set(usage.bird_species, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + usage.duration_seconds
      })
    })

    const usageBySpecies = Array.from(speciesMap.entries()).map(([species, data]) => ({
      species,
      count: data.count,
      totalDuration: data.totalDuration
    })).sort((a, b) => b.count - a.count)

    // Pronađi najkorišteniji i najmanje korišteni zvuk
    const mostUsed = usageBySpecies[0]
    const leastUsed = usageBySpecies[usageBySpecies.length - 1]

    // Grupisi po mjesecima
    const monthMap = new Map<string, number>()
    data.forEach(usage => {
      const date = new Date(usage.created_at)
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      const existing = monthMap.get(monthKey) || 0
      monthMap.set(monthKey, existing + 1)
    })

    const usageByPeriod = Array.from(monthMap.entries()).map(([period, count]) => ({
      period,
      count
    })).sort((a, b) => b.period.localeCompare(a.period))

    // Analiza po dobu dana
    const timeOfDayMap = new Map<string, TimeOfDayData>()
    const hourMap = new Map<number, number>()
    
    data.forEach(usage => {
      const date = new Date(usage.created_at)
      const hour = date.getHours()
      
      // Grupisi po satima
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
      
      // Grupisi po dobu dana
      let timePeriod = ''
      
      if (hour >= 5 && hour < 12) {
        timePeriod = 'Jutro (5-11h)'
      } else if (hour >= 12 && hour < 17) {
        timePeriod = 'Podne (12-16h)'
      } else if (hour >= 17 && hour < 21) {
        timePeriod = 'Veče (17-20h)'
      } else {
        timePeriod = 'Noć (21-4h)'
      }
      
      const existing = timeOfDayMap.get(timePeriod) || { count: 0, sounds: new Map<string, number>() }
      existing.count++
      existing.sounds.set(usage.bird_species, (existing.sounds.get(usage.bird_species) || 0) + 1)
      timeOfDayMap.set(timePeriod, existing)
    })

    // Najzauzetiji sat
    const peakHourEntry = Array.from(hourMap.entries()).reduce((max, [hour, count]) => 
      count > max.count ? { hour, count } : max, { hour: 0, count: 0 }
    )

    // Statistika po dobu dana - ISPRAVLJENO
    const totalCount = data.length
    const usageByTimeOfDay = Array.from(timeOfDayMap.entries()).map(([period, data]) => {
      // ISPRAVLJENO: Eksplicitno definišemo tipove za reduce
      const mostUsedSound = Array.from(data.sounds.entries()).reduce<{ sound: string; count: number }>(
        (max, entry) => {
          const [sound, count] = entry as [string, number]
          return count > max.count ? { sound, count } : max
        }, 
        { sound: '', count: 0 }
      )
      
      return {
        period,
        count: data.count,
        percentage: totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0,
        mostUsedSound: mostUsedSound.sound || 'Nema podataka',
        icon: getTimePeriodIcon(period)
      }
    }).sort((a, b) => b.count - a.count)

    // Dnevni prosjek
    const daysSet = new Set(data.map(usage => new Date(usage.created_at).toDateString()))
    const dailyAverage = data.length / Math.max(daysSet.size, 1)

    // Sedmični trend - ISPRAVLJENO
    const dayMap = new Map<number, number>()
    data.forEach(usage => {
      const date = new Date(usage.created_at)
      const dayKey = date.getDay() // 0 = Nedjelja, 1 = Ponedjeljak, ..., 6 = Subota
      dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1)
    })

    const weekDays = [
      { day: 1, name: 'Pon' },
      { day: 2, name: 'Uto' },
      { day: 3, name: 'Sri' },
      { day: 4, name: 'Čet' },
      { day: 5, name: 'Pet' },
      { day: 6, name: 'Sub' },
      { day: 0, name: 'Ned' }
    ]

    const weeklyTrend = weekDays.map(dayInfo => ({
      day: dayInfo.name,
      count: dayMap.get(dayInfo.day) || 0
    }))

    return {
      totalPlaybacks: data.length,
      totalDuration: data.reduce((sum, usage) => sum + usage.duration_seconds, 0),
      mostUsedSound: mostUsed?.species || 'Nema podataka',
      leastUsedSound: leastUsed?.species || 'Nema podataka',
      usageBySpecies,
      usageByPeriod: usageByPeriod.slice(0, 6),
      usageByTimeOfDay,
      peakUsageHour: {
        hour: `${peakHourEntry.hour.toString().padStart(2, '0')}:00`,
        count: peakHourEntry.count
      },
      dailyAverage: Math.round(dailyAverage * 10) / 10,
      weeklyTrend
    }
  }

  const clearFilters = () => {
    setSearchDate('')
    setSearchMonth('')
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSoundIcon = (soundType: string, species: string) => {
    if (soundType === 'gunshot') return <Zap className="w-4 h-4 text-red-500" />
    if (species.includes('Galeb')) return <Bird className="w-4 h-4 text-blue-500" />
    if (species.includes('Lastavica')) return <Bird className="w-4 h-4 text-green-500" />
    return <Volume2 className="w-4 h-4 text-gray-500" />
  }

  const getSoundBadge = (soundType: string) => {
    return soundType === 'gunshot' 
      ? <Badge variant="destructive">Gunshot</Badge>
      : <Badge variant="secondary">Ptica</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('history')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <Play className="w-4 h-4 mr-2" />
          Istorija Puštanja
        </Button>
        <Button
          variant={activeTab === 'statistics' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('statistics')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Statistika
        </Button>
      </div>

      {activeTab === 'history' && (
        <>
          {/* Filter Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Pretraga po datumu</label>
                  <Input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Pretraga po mjesecu</label>
                  <Input
                    type="month"
                    value={searchMonth}
                    onChange={(e) => setSearchMonth(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Obriši Filtere
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Istorija Puštanja Zvukova</CardTitle>
              <CardDescription>
                Pregled svih korištenja repelent zvukova {searchDate && `za datum: ${searchDate}`} {searchMonth && `za mjesec: ${searchMonth}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Učitavanje istorije...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <Volume2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nema zabilježenih korištenja zvukova</p>
                  {(searchDate || searchMonth) && (
                    <Button 
                      onClick={clearFilters}
                      variant="outline"
                      className="mt-2"
                    >
                      Obriši filtere
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vrsta</TableHead>
                        <TableHead>Tip</TableHead>
                        <TableHead>Trajanje</TableHead>
                        <TableHead>Lokacija</TableHead>
                        <TableHead>Datum i Vrijeme</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.slice(0, 20).map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getSoundIcon(usage.sound_type, usage.bird_species)}
                              <span className="font-medium">{usage.bird_species}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getSoundBadge(usage.sound_type)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Play className="w-4 h-4 text-green-500" />
                              <span>{formatDuration(usage.duration_seconds)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {usage.location}
                          </TableCell>
                          <TableCell>
                            {formatDate(usage.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'statistics' && statistics && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ukupno Puštanja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.totalPlaybacks}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDuration(statistics.totalDuration)} ukupno trajanje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Najkorišteniji Zvuk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-600">
                  {statistics.mostUsedSound}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Najpopularnija vrsta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Dnevni Prosjek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.dailyAverage}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  puštanja po danu
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Najzauzetiji Sat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-600">
                  {statistics.peakUsageHour.hour}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {statistics.peakUsageHour.count} puštanja
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Time of Day Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Aktivnost po Dobu Dana
                </CardTitle>
                <CardDescription>
                  Kada se najviše koriste repelent zvukovi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.usageByTimeOfDay.map((timePeriod) => (
                    <div key={timePeriod.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {timePeriod.icon}
                        <div>
                          <div className="font-medium">{timePeriod.period}</div>
                          <div className="text-sm text-gray-500">
                            Najviše: {timePeriod.mostUsedSound}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{timePeriod.count}</div>
                        <div className="text-sm text-gray-500">
                          {timePeriod.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend - ISPRAVLJENO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Sedmični Trend
                </CardTitle>
                <CardDescription>
                  Aktivnost po danima u sedmici
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics.weeklyTrend.map((day) => {
                    const maxCount = Math.max(...statistics.weeklyTrend.map(d => d.count))
                    const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                    
                    return (
                      <div key={day.day} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 w-full">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-blue-600">{day.day}</span>
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <div className="font-bold text-sm">{day.count}</div>
                          <div className="text-xs text-gray-500">
                            {percentage > 0 ? `${Math.round(percentage)}%` : '0%'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Dodatne informacije */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700 font-medium">Ukupno ove sedmice:</span>
                    <span className="text-blue-700 font-bold">
                      {statistics.weeklyTrend.reduce((sum, day) => sum + day.count, 0)} puštanja
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage by Species and Period */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Korištenje po Vrstama</CardTitle>
                <CardDescription>
                  Pregled najčešće korištenih repelent zvukova
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.usageBySpecies.map((item, index) => (
                    <div key={item.species} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{item.species}</div>
                          <div className="text-sm text-gray-500">
                            {formatDuration(item.totalDuration)} ukupno
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.count}×</div>
                        <div className="text-sm text-gray-500">puštanja</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Korištenja po Mjesecima</CardTitle>
                <CardDescription>
                  Pregled aktivnosti kroz vrijeme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {statistics.usageByPeriod.map((period) => (
                    <div key={period.period} className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border">
                      <div className="text-lg font-bold text-blue-600">{period.count}</div>
                      <div className="text-sm text-gray-600 font-medium">
                        {new Date(period.period + '-01').toLocaleDateString('bs-BA', { 
                          month: 'short', 
                          year: '2-digit' 
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}