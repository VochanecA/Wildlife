// components/bird-sounds-player.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, Download } from "lucide-react"

interface BirdSound {
  id: string
  name: string
  scientificName: string
  description: string
  duration: string
  frequency: string
  effectiveness: string
  image: string
  audioUrl: string
}

const birdSounds: BirdSound[] = [
  {
    id: 'seagull',
    name: 'Galeb',
    scientificName: 'Larus spp.',
    description: 'Sredozemni galeb - najčešća vrsta na aerodromu',
    duration: '20 sekundi',
    frequency: '2-8 kHz',
    effectiveness: 'Visoka (85%)',
    image: '/wildlife/seagull.jpg',
    audioUrl: '/sounds/seagull-repellent.mp3' // Zamijeni sa pravim URL-om
  },
  {
    id: 'swallow',
    name: 'Lastavica',
    scientificName: 'Hirundo rustica',
    description: 'Selica sa niskim letom - opasna po avione',
    duration: '22 sekunde',
    frequency: '5-12 kHz',
    effectiveness: 'Srednja (70%)',
    image: '/wildlife/swallow.jpg',
    audioUrl: '/sounds/swallow-repellent.mp3'
  },
  {
    id: 'falcon',
    name: 'Soko',
    scientificName: 'Falco peregrinus',
    description: 'Brzi grabljivac - kritičan rizik',
    duration: '18 sekundi',
    frequency: '8-15 kHz',
    effectiveness: 'Srednja (65%)',
    image: '/wildlife/falcon.jpg',
    audioUrl: '/sounds/falcon-repellent.mp3'
  },
  {
    id: 'pigeon',
    name: 'Golub',
    scientificName: 'Columba livia',
    description: 'Gradski golub - čest u hangarima',
    duration: '25 sekundi',
    frequency: '3-10 kHz',
    effectiveness: 'Visoka (80%)',
    image: '/wildlife/pigeon.jpg',

    audioUrl: '/sounds/pigeon-repellent.mp3'
  },
  {
    id: 'crow',
    name: 'Vrana',
    scientificName: 'Corvus corax',
    description: 'Pametna vrsta - teška za kontrolu',
    duration: '20 sekundi',
    frequency: '4-9 kHz',
    effectiveness: 'Srednja (60%)',
    image: '/wildlife/corvux.jpg',
    audioUrl: '/sounds/crow-repellent.mp3'
  },
  {
    id: 'sparrow',
    name: 'Vrabac',
    scientificName: 'Passer domesticus',
    description: 'Mala ptica - česta u travnatim površinama',
    duration: '15 sekundi',
    frequency: '6-14 kHz',
    effectiveness: 'Visoka (90%)',
    image: '/wildlife/sparow.jpg',
    audioUrl: '/sounds/sparrow-repellent.mp3'
  }
]

export function BirdSoundsPlayer() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      setCurrentlyPlaying(null)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const playSound = (bird: BirdSound) => {
    if (currentlyPlaying === bird.id) {
      // Pauziraj trenutni zvuk
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
    } else {
      // Zaustavi prethodni zvuk i pokreni novi
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Simuliraj audio reprodukciju (zamijeni sa pravim audio fajlovima)
      const audio = new Audio(bird.audioUrl)
      audioRef.current = audio
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        // Fallback: simuliraj reprodukciju ako audio fajl ne postoji
        setTimeout(() => {
          setCurrentlyPlaying(null)
          setProgress(0)
        }, 20000) // 20 sekundi simulacije
      })

      setCurrentlyPlaying(bird.id)
      setProgress(0)
    }
  }

  const downloadSound = (bird: BirdSound) => {
    // Simuliraj download (u pravoj implementaciji koristi pravi download)
    const link = document.createElement('a')
    link.href = bird.audioUrl
    link.download = `${bird.name.toLowerCase()}-repellent.mp3`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎵 Audio Repelent Biblioteka
        </h2>
        <p className="text-gray-600">
          Odaberite vrstu i pustite repelent zvuk za kontrolu
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {birdSounds.map((bird) => (
          <Card 
            key={bird.id} 
            className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
              currentlyPlaying === bird.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <CardHeader className="p-0">
              <div className="relative">
                <img
                  src={bird.image}
                  alt={bird.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {bird.duration}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <CardTitle className="text-lg text-gray-900">
                    {bird.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {bird.scientificName}
                  </CardDescription>
                </div>

                <p className="text-sm text-gray-700">
                  {bird.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold">Frekvencija:</span>
                    <br />
                    <span className="text-gray-600">{bird.frequency}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Efikasnost:</span>
                    <br />
                    <span className="text-gray-600">{bird.effectiveness}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                {currentlyPlaying === bird.id && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Controls */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => playSound(bird)}
                    className={`flex-1 ${
                      currentlyPlaying === bird.id 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    size="sm"
                  >
                    {currentlyPlaying === bird.id ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Zaustavi
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Pusti ({bird.duration})
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => downloadSound(bird)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audio element za reprodukciju */}
      <audio ref={audioRef} className="hidden" />
      
      {/* Instructions */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Volume2 className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Uputstvo za upotrebu
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Koristite zvučnike sa dobrim frekventnim odzivom</p>
                <p>• Rotirajte zvukove svakih 2-3 sata da spriječite navikavanje</p>
                <p>• Kombinujte sa vizuelnim repelentima za bolju efikasnost</p>
                <p>• Prilagodite jačinu zvuka prema vremenskim uslovima</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}