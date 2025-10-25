// components/bird-sounds-stats-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, TrendingUp, Clock, Play, Bird, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

interface BirdSoundsStats {
  totalPlaybacks: number
  totalDuration: number
  mostUsedSound: string
  dailyAverage: number
  usageByTimeOfDay: { period: string; count: number; percentage: number }[]
}

async function getBirdSoundsStats(userId: string): Promise<BirdSoundsStats | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('bird_sound_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return null
    }

    // Grupisi po vrstama
    const speciesMap = new Map<string, number>()
    const timeOfDayMap = new Map<string, number>()
    const daysSet = new Set<string>()
    
    data.forEach(usage => {
      // Broj po vrstama
      speciesMap.set(usage.bird_species, (speciesMap.get(usage.bird_species) || 0) + 1)
      
      // Broj po dobu dana
      const date = new Date(usage.created_at)
      const hour = date.getHours()
      
      let timePeriod = ''
      if (hour >= 5 && hour < 12) timePeriod = 'Jutro'
      else if (hour >= 12 && hour < 17) timePeriod = 'Podne'
      else if (hour >= 17 && hour < 21) timePeriod = 'Veče'
      else timePeriod = 'Noć'
      
      timeOfDayMap.set(timePeriod, (timeOfDayMap.get(timePeriod) || 0) + 1)
      
      // Dani za dnevni prosjek
      daysSet.add(date.toDateString())
    })

    // Najkorišteniji zvuk
    const mostUsed = Array.from(speciesMap.entries()).reduce((max, [species, count]) => 
      count > max.count ? { species, count } : max, { species: 'Nema podataka', count: 0 }
    )

    // Statistika po dobu dana
    const totalCount = data.length
    const usageByTimeOfDay = Array.from(timeOfDayMap.entries()).map(([period, count]) => ({
      period,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    })).sort((a, b) => b.count - a.count)

    // Dnevni prosjek
    const dailyAverage = data.length / Math.max(daysSet.size, 1)

    return {
      totalPlaybacks: data.length,
      totalDuration: data.reduce((sum, usage) => sum + usage.duration_seconds, 0),
      mostUsedSound: mostUsed.species,
      dailyAverage: Math.round(dailyAverage * 10) / 10,
      usageByTimeOfDay: usageByTimeOfDay.slice(0, 2) // Samo top 2 perioda
    }
  } catch (error) {
    console.error('Error fetching bird sounds stats:', error)
    return null
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function getSoundIcon(species: string) {
  if (species.includes('Galeb')) return <Bird className="w-4 h-4 text-blue-500" />
  if (species.includes('Lastavica')) return <Bird className="w-4 h-4 text-green-500" />
  if (species.toLowerCase().includes('gunshot')) return <Zap className="w-4 h-4 text-red-500" />
  return <Volume2 className="w-4 h-4 text-gray-500" />
}

function getTimePeriodIcon(period: string) {
  switch (period) {
    case 'Jutro':
      return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
    case 'Podne':
      return <div className="w-2 h-2 bg-orange-500 rounded-full" />
    case 'Veče':
      return <div className="w-2 h-2 bg-blue-500 rounded-full" />
    default:
      return <div className="w-2 h-2 bg-indigo-500 rounded-full" />
  }
}

export async function BirdSoundsStatsCard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const stats = await getBirdSoundsStats(user.id)

  if (!stats) {
    return (
      <Link href="/bird-sounds" className="block">
        {/* Header sa gradient pozadinom od plavog ka zelenom */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Repelent Zvukovi</h3>
              <p className="text-blue-100 mt-1">Nema korištenja zvukova</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-blue-200 text-sm">Započnite korištenje repelent zvukova</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href="/bird-sounds" className="block">
      {/* Glavni container sa gradient headerom od plavog ka zelenom */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Header sa gradient pozadinom od plavog ka zelenom */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-full">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Repelent Zvukovi</h3>
                <p className="text-blue-100 mt-1">
                  {stats.totalPlaybacks} puštanja • {formatDuration(stats.totalDuration)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Content */}
        <div className="p-6 space-y-4">
          {/* Ukupno puštanja */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800 block">UKUPNO PUSTANJA</span>
                <span className="text-xs text-gray-600">Sva korištenja</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-lg font-bold px-4 py-2 rounded-full min-w-[4rem] flex items-center justify-center shadow-lg">
              {stats.totalPlaybacks}
            </div>
          </div>

          {/* Dnevni prosjek */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800 block">DNEVNI PROSJEK</span>
                <span className="text-xs text-gray-600">Puštanja po danu</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold px-4 py-2 rounded-full min-w-[4rem] flex items-center justify-center shadow-lg">
              {stats.dailyAverage}
            </div>
          </div>

          {/* Najkorišteniji zvuk */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg">
                {getSoundIcon(stats.mostUsedSound)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-gray-800 block truncate">NAJKORIŠTENIJI</span>
                <span className="text-xs text-gray-600 truncate">{stats.mostUsedSound}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-full flex items-center justify-center shadow-lg">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>

          {/* Aktivnost po periodu dana */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-800">AKTIVNOST PO PERIODU</span>
              </div>
            </div>
            <div className="space-y-3">
              {stats.usageByTimeOfDay.map((timePeriod) => (
                <div key={timePeriod.period} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    {getTimePeriodIcon(timePeriod.period)}
                    <span className="text-sm font-medium text-gray-700">{timePeriod.period}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-800">{timePeriod.count}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {timePeriod.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar za aktivnost */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span>Nivo aktivnosti</span>
              <span className="font-semibold">
                {stats.totalPlaybacks > 50 ? 'Visok' : 
                 stats.totalPlaybacks > 20 ? 'Srednji' : 'Nizak'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 shadow-inner"
                style={{
                  width: `${Math.min((stats.totalPlaybacks / 100) * 100, 100)}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100+</span>
            </div>
          </div>

          {/* Footer sa call-to-action */}
          <div className="mt-4 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium inline-block hover:from-blue-600 hover:to-green-600 transition-all duration-300">
              Pogledaj detaljnu statistiku →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}