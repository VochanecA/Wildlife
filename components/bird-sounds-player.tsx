// components/bird-sounds-player.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, Download, AlertTriangle } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

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
  type: 'bird' | 'gunshot'
  warning?: string
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
    audioUrl: '/sounds/seagull-repellent.mp3',
    type: 'bird'
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
    audioUrl: '/sounds/swallow-repellent.mp3',
    type: 'bird'
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
    audioUrl: '/sounds/falcon-repellent.mp3',
    type: 'bird'
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
    audioUrl: '/sounds/pigeon-repellent.mp3',
    type: 'bird'
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
    audioUrl: '/sounds/crow-repellent.mp3',
    type: 'bird'
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
    audioUrl: '/sounds/sparrow-repellent.mp3',
    type: 'bird'
  },
  {
    id: 'gunshot',
    name: 'Gunshot Repelent',
    scientificName: 'Pyro-acoustic',
    description: 'Pirotehnički repelent - za hitne situacije',
    duration: '5 sekundi',
    frequency: 'Impulsni zvuk',
    effectiveness: 'Vrlo visoka (95%)',
    image: '/wildlife/gunshot.jpg',
    audioUrl: '/sounds/gunshot-repellent.mp3',
    type: 'gunshot',
    warning: 'UPOZORENJE: Koristiti samo u hitnim situacijama. Jaki zvuk može uzrokovati paniku.'
  }
]

export function BirdSoundsPlayer() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [isLooping, setIsLooping] = useState<boolean>(false)
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Dobijanje lokacije korisnika
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied or unavailable:', error)
        }
      )
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      if (isLooping && currentlyPlaying) {
        // Ako je loop aktivan, ponovi reprodukciju
        audio.currentTime = 0
        audio.play().catch(console.error)
      } else {
        // Ako nije loop, zaustavi reprodukciju i zabilježi korištenje
        handleStopSound()
      }
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isLooping, currentlyPlaying])

  // Čisti interval kada se komponenta unmount-uje
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Funkcija za bilježenje korištenja zvuka u bazu
  const logSoundUsage = async (bird: BirdSound, durationSeconds: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('User not authenticated')
        return
      }

      const { error } = await supabase
        .from('bird_sound_usage')
        .insert({
          user_id: user.id,
          bird_species: bird.name,
          sound_type: bird.type,
          duration_seconds: durationSeconds,
          location: userLocation ? `Lat: ${userLocation.latitude}, Lng: ${userLocation.longitude}` : 'Aerodrom Tivat',
          latitude: userLocation?.latitude || null,
          longitude: userLocation?.longitude || null,
          notes: `Automatski zabilježeno korištenje repelent zvuka za ${bird.name}`
        })

      if (error) {
        console.error('Error logging sound usage:', error)
      } else {
        console.log('Sound usage logged successfully')
      }
    } catch (error) {
      console.error('Error in logSoundUsage:', error)
    }
  }

  const playSound = async (bird: BirdSound) => {
    if (currentlyPlaying === bird.id) {
      // Pauziraj trenutni zvuk
      handleStopSound()
    } else {
      // Zaustavi prethodni zvuk i pokreni novi
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Kreiraj novi audio element
      const audio = new Audio()
      audio.src = bird.audioUrl
      audio.loop = false // Koristimo manual loop zbog bolje kontrole
      audioRef.current = audio
      
      // Zabilježi početak reprodukcije
      startTimeRef.current = Date.now()
      
      // Pokreni reprodukciju
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        // Fallback: simuliraj reprodukciju ako audio fajl ne postoji
        simulateAudioPlayback(bird)
      })

      setCurrentlyPlaying(bird.id)
      setProgress(0)
      setIsLooping(true) // Automatski uključi loop

      // Prikaži toast poruku
      toast({
        title: "🎵 Repelent aktiviran",
        description: `Zvuk za ${bird.name} je pokrenut (auto-repeat)`,
      })

      // Simuliraj loop ako audio ne postoji
      if (!bird.audioUrl.startsWith('/sounds/')) {
        simulateLoopPlayback(bird)
      }
    }
  }

  const handleStopSound = async () => {
    const stopTime = Date.now()
    let durationSeconds = 0

    // Izračunaj trajanje reprodukcije
    if (startTimeRef.current) {
      durationSeconds = Math.round((stopTime - startTimeRef.current) / 1000)
    }

    // Zabilježi korištenje ako je zvuk pušten barem 1 sekundu
    if (durationSeconds >= 1 && currentlyPlaying) {
      const bird = birdSounds.find(b => b.id === currentlyPlaying)
      if (bird) {
        await logSoundUsage(bird, durationSeconds)
      }
    }

    // Resetuj stanje
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setCurrentlyPlaying(null)
    setProgress(0)
    setIsLooping(false)
    startTimeRef.current = null
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const simulateAudioPlayback = (bird: BirdSound) => {
    const duration = parseInt(bird.duration) * 1000 || 20000
    setProgress(0)
    startTimeRef.current = Date.now()
    
    // Simuliraj progres
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || Date.now())
      const newProgress = (elapsed / duration) * 100
      
      if (newProgress >= 100) {
        setProgress(100)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        // Loop: ponovi nakon kraja
        if (isLooping && currentlyPlaying === bird.id) {
          setTimeout(() => simulateAudioPlayback(bird), 100)
        } else {
          handleStopSound()
        }
      } else {
        setProgress(newProgress)
      }
    }, 100)
  }

  const simulateLoopPlayback = (bird: BirdSound) => {
    const duration = parseInt(bird.duration) * 1000 || 20000
    setProgress(0)
    startTimeRef.current = Date.now()
    
    const playLoop = () => {
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - (startTimeRef.current || Date.now())
        const newProgress = (elapsed / duration) * 100
        
        if (newProgress >= 100) {
          setProgress(100)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          // Ponovi loop ako je još uvijek aktivan
          if (currentlyPlaying === bird.id && isLooping) {
            startTimeRef.current = Date.now()
            setTimeout(playLoop, 100)
          } else {
            handleStopSound()
          }
        } else {
          setProgress(newProgress)
        }
      }, 100)
    }
    
    playLoop()
  }

  const downloadSound = (bird: BirdSound) => {
    // Simuliraj download (u pravoj implementaciji koristi pravi download)
    const link = document.createElement('a')
    link.href = bird.audioUrl
    link.download = `${bird.name.toLowerCase()}-repellent.mp3`
    link.click()

    // Zabilježi download ako želite
    toast({
      title: "📥 Download započet",
      description: `Zvuk za ${bird.name} se preuzima`,
    })
  }

  const getCardStyle = (bird: BirdSound) => {
    if (bird.type === 'gunshot') {
      return 'ring-2 ring-red-500 bg-red-50/20'
    }
    return currentlyPlaying === bird.id ? 'ring-2 ring-blue-500' : ''
  }

  const getButtonStyle = (bird: BirdSound) => {
    if (bird.type === 'gunshot') {
      return currentlyPlaying === bird.id 
        ? 'bg-red-600 hover:bg-red-700' 
        : 'bg-red-500 hover:bg-red-600'
    }
    return currentlyPlaying === bird.id 
      ? 'bg-red-500 hover:bg-red-600' 
      : 'bg-blue-600 hover:bg-blue-700'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎵 Audio Repelent Biblioteka
        </h2>
        <p className="text-gray-600">
          Odaberite vrstu i pustite repelent zvuk za kontrolu (automatski repeat)
        </p>
        <p className="text-sm text-blue-600 mt-2">
          📍 Sva korištenja se automatski bilježe u sistem
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {birdSounds.map((bird) => (
          <Card 
            key={bird.id} 
            className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${getCardStyle(bird)}`}
          >
            <CardHeader className="p-0">
              <div className="relative">
                <img
                  src={bird.image}
                  alt={bird.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className={`absolute top-2 right-2 text-white px-2 py-1 rounded text-xs ${
                  bird.type === 'gunshot' ? 'bg-red-600' : 'bg-black/70'
                }`}>
                  {bird.duration}
                </div>
                {bird.type === 'gunshot' && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    🔥 HITNO
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <CardTitle className={`text-lg ${
                    bird.type === 'gunshot' ? 'text-red-700' : 'text-gray-900'
                  }`}>
                    {bird.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {bird.scientificName}
                  </CardDescription>
                </div>

                <p className="text-sm text-gray-700">
                  {bird.description}
                </p>

                {bird.warning && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700 font-medium">{bird.warning}</p>
                    </div>
                  </div>
                )}

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
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-100 ${
                          bird.type === 'gunshot' ? 'bg-red-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Loop: {isLooping ? 'AKTIVAN' : 'NEAKTIVAN'}</span>
                      <span>Auto-repeat</span>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => playSound(bird)}
                    className={`flex-1 ${getButtonStyle(bird)}`}
                    size="sm"
                  >
                    {currentlyPlaying === bird.id ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Zaustavi Loop
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
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Volume2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Uputstvo za upotrebu - AUTO REPEAT SISTEM
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• <strong>Zvuk se automatski ponavlja</strong> dok se ne zaustavi</p>
                <p>• <strong>Sva korištenja se bilježe</strong> u bazu podataka automatski</p>
                <p>• Koristite zvučnike sa dobrim frekventnim odzivom</p>
                <p>• Rotirajte zvukove svakih 2-3 sata da spriječite navikavanje</p>
                <p>• <strong>Gunshot repelent</strong> - samo za hitne situacije!</p>
                <p>• Kombinujte sa vizuelnim repelentima za bolju efikasnost</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}