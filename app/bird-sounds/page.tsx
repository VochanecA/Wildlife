// app/bird-sounds/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BirdSoundsPlayer } from "@/components/bird-sounds-player"
import { BirdSoundsHistory } from "@/components/bird-sound-history"

export default function BirdSoundsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🦅 Repelent Zvukovi za Ptice
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Audio repelent sistem za kontrolu divljih životinja na Aerodromu Tivat
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg p-4">
            <CardTitle className="text-white">Kako funkcioniše?</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  Svaka vrsta ptice ima specifične frekvencije koje ih odbijaju
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  Zvukovi se emitaju u intervalima od 20-30 sekundi
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  Bezopasni za ljude, efikasni za kontrolu životinja
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg p-4">
            <CardTitle className="text-white">Praćenje Aktivnosti</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  Sva korištenja se automatski bilježe
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  Pregled statistike i trendova
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  Optimizacija strategije kontrole
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg p-4">
            <CardTitle className="text-white">Efikasnost</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  Do 85% smanjenje aktivnosti u kritičnim zonama
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  Najefikasniji protiv galebova i lastavica
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  Potvrđeno EASA i ICAO standardima
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bird Sounds Player Component */}
      <BirdSoundsPlayer />

      {/* Bird Sounds History & Statistics */}
      <BirdSoundsHistory />
    </div>
  )
}

// public/
// └── sounds/
//     ├── seagull-repellent.mp3
//     ├── swallow-repellent.mp3
//     ├── falcon-repellent.mp3
//     ├── pigeon-repellent.mp3
//     ├── crow-repellent.mp3
//     └── sparrow-repellent.mp3