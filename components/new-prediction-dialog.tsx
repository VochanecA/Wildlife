"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Brain, Loader2, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface NewPredictionDialogProps {
  children?: React.ReactNode
  models: any[]
}

// AI Prediction Prompt specijalizovan za predikciju rizika
const PREDICTION_AI_PROMPT = `Ti si AI model za predikciju rizika od divljih životinja na Aerodromu Tivat. Tvoj zadatak je:

ANALIZIRAJ i PREDVIDI rizik na osnovu sljedećih parametara:
- Lokacija na aerodromu
- Vrsta životinje (ako je navedena)
- Istorijske pojave
- Sezonski faktori
- Vremenski uslovi

ODGOVORI U JSON FORMATU:
{
  "risk_level": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "reasoning": "Detaljno obrazloženje predikcije",
  "recommendations": ["preporuka1", "preporuka2", ...],
  "time_frame": "kratkorocno|srednjorocno|dugorocno"
}

SPECIFIČNO ZA AERODROM TIVAT:
- Lokacija: obalni aerodrom, blizina mora
- Sezonske migracije: proleće/jesen
- Lokalne vrste: galebovi, lastavice, sokoli, zečevi
- Klima: mediteranska, uticaj vjetra

KRITERIJUMI ZA PROCJENU RIZIKA:
- KRITIČAN: Velike ptice grabljivice, jate ptica >50, blizina piste
- VISOK: Srednje ptice, jate 20-50, taxiway područja
- SREDNJI: Male ptice, pojedinačne životinje, perimetar
- NIZAK: Gmizavci, insekti, udaljene zone

BUDI REALAN I PRECIZAN U PROCJENI!`

export function NewPredictionDialog({ children, models }: NewPredictionDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [modelId, setModelId] = useState("")
  const [location, setLocation] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [species, setSpecies] = useState("")
  const [predictedDate, setPredictedDate] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  const analyzeWithAI = async () => {
    if (!location) {
      toast({
        title: "Greška",
        description: "Unesite lokaciju za AI analizu",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setAiAnalysis(null)

    try {
      const analysisPrompt = `
LOKACIJA: ${location}
${latitude && longitude ? `KOORDINATE: ${latitude}, ${longitude}` : ''}
${species ? `VRSTA: ${species}` : 'VRSTA: Nije specificirano'}
${additionalInfo ? `DODATNE INFORMACIJE: ${additionalInfo}` : ''}
DATUM PREDIKCIJE: ${predictedDate || 'Nije specificirano'}

Analiziraj rizik i predvidi opasnost za navedenu lokaciju na Aerodromu Tivat.`

      const response = await fetch('/api/ai/wildlife-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: analysisPrompt,
          location,
          species,
          coordinates: latitude && longitude ? `${latitude},${longitude}` : null,
          additionalInfo
        })
      })

      if (!response.ok) {
        throw new Error('AI servis nije dostupan')
      }

      const data = await response.json()
      
      if (data.prediction) {
        setAiAnalysis(data.prediction)
        toast({
          title: "AI Analiza završena",
          description: "Predikcija rizika je generisana",
        })
      } else {
        throw new Error('Nevažeći odgovor od AI servisa')
      }

    } catch (error) {
      console.error('AI Analysis error:', error)
      toast({
        title: "Greška pri AI analizi",
        description: "Koristim osnovnu predikciju",
        variant: "destructive",
      })
      // Fallback na osnovnu predikciju
      setAiAnalysis(generateFallbackPrediction())
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackPrediction = () => {
    // Osnovna predikcija bazirana na lokaciji i vrsti
    let riskLevel = "medium"
    let confidence = 0.6
    let reasoning = "Osnovna procjena na osnovu unesenih podataka"
    const recommendations = [
      "Preporučena standardna patrola",
      "Provjera repelent sistema u oblasti"
    ]

    // Jednostavna logika za određivanje rizika
    if (location.toLowerCase().includes("pista") || location.toLowerCase().includes("runway")) {
      riskLevel = "high"
      confidence = 0.7
      reasoning = "Lokacija u blizini piste zahtijeva povećanu pažnju"
    } else if (location.toLowerCase().includes("taxi") || location.toLowerCase().includes("apron")) {
      riskLevel = "medium"
      confidence = 0.65
      reasoning = "Operativna zona sa umjerenim rizikom"
    } else if (location.toLowerCase().includes("perimetar") || location.toLowerCase().includes("ograda")) {
      riskLevel = "low"
      confidence = 0.5
      reasoning = "Perimetarna zona sa niskim rizikom"
    }

    // Prilagodi na osnovu vrste
    if (species) {
      if (species.toLowerCase().includes("soko") || species.toLowerCase().includes("orao")) {
        riskLevel = "critical"
        confidence = 0.8
        reasoning += " - Prisustvo velikih ptica grabljivica značajno povećava rizik"
      } else if (species.toLowerCase().includes("galeb")) {
        riskLevel = "high"
        confidence = 0.75
        reasoning += " - Galebovi su česta pojava sa visokim rizikom"
      }
    }

    return {
      risk_level: riskLevel,
      confidence,
      reasoning,
      recommendations,
      time_frame: "kratkorocno"
    }
  }

  const generatePrediction = async () => {
    if (!modelId || !location) {
      toast({
        title: "Greška",
        description: "Molimo popunite obavezna polja",
        variant: "destructive",
      })
      return
    }

    if (!aiAnalysis) {
      toast({
        title: "Upozorenje",
        description: "Prvo izvršite AI analizu",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Niste prijavljeni")

      // Save prediction to database
      const { error } = await supabase
        .from("risk_predictions")
        .insert({
          model_id: modelId,
          location,
          latitude: latitude ? parseFloat(latitude) : 42.4044, // Default Tivat coordinates
          longitude: longitude ? parseFloat(longitude) : 18.7234,
          risk_level: aiAnalysis.risk_level,
          confidence: aiAnalysis.confidence,
          predicted_date: predictedDate || new Date().toISOString().split('T')[0],
          species: species || null,
        })

      if (error) throw error

      toast({
        title: "Predikcija sačuvana",
        description: `Rizik: ${getRiskLabel(aiAnalysis.risk_level)} (${(aiAnalysis.confidence * 100).toFixed(0)}% sigurnosti)`,
      })

      setOpen(false)
      setModelId("")
      setLocation("")
      setLatitude("")
      setLongitude("")
      setSpecies("")
      setPredictedDate("")
      setAdditionalInfo("")
      setAiAnalysis(null)
      router.refresh()

    } catch (error) {
      console.error("Error saving prediction:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri čuvanju predikcije",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-destructive text-destructive-foreground"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-100 text-gray-800"
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const activeModels = models.filter(m => m.is_active)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Predikcija Rizika
          </DialogTitle>
          <DialogDescription>
            Koristite AI za predviđanje rizika od divljih životinja na aerodromu
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="model">AI Model *</Label>
            <Select value={modelId} onValueChange={setModelId} required>
              <SelectTrigger id="model">
                <SelectValue placeholder="Odaberite AI model" />
              </SelectTrigger>
              <SelectContent>
                {activeModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} ({model.model_type}) - {(model.accuracy * 100).toFixed(1)}% tačnost
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeModels.length === 0 && (
              <p className="text-sm text-destructive">Nema aktivnih modela</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Lokacija *</Label>
              <Input
                id="location"
                placeholder="npr. Pista 14 - Sjeverni kraj"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">Vrsta životinje (opciono)</Label>
              <Input
                id="species"
                placeholder="npr. Kanadske guske"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Geografska širina</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="npr. 42.4044"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Geografska dužina</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="npr. 18.7234"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="predictedDate">Datum predikcije</Label>
            <Input
              id="predictedDate"
              type="date"
              value={predictedDate}
              onChange={(e) => setPredictedDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Dodatne informacije</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Dodatni detalji, istorijske pojave, vremenski uslovi..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
            />
          </div>

          {/* AI Analysis Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">AI Analiza Rizika</Label>
              <Button 
                onClick={analyzeWithAI} 
                disabled={isGenerating || !location}
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? "Analiziranje..." : "Analiziraj AI"}
              </Button>
            </div>

            {aiAnalysis && (
              <div className="space-y-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-semibold">Nivo Rizika:</span>
                    </div>
                    <Badge className={`mt-1 ${getRiskColor(aiAnalysis.risk_level)}`}>
                      {getRiskLabel(aiAnalysis.risk_level)}
                    </Badge>
                  </div>
                  <div>
                    <div className="font-semibold">Sigurnost:</div>
                    <div className={`font-bold ${getConfidenceColor(aiAnalysis.confidence)}`}>
                      {(aiAnalysis.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Info className="w-4 h-4" />
                    Obrazloženje:
                  </div>
                  <p className="text-sm">{aiAnalysis.reasoning}</p>
                </div>

                {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      <CheckCircle className="w-4 h-4" />
                      Preporuke:
                    </div>
                    <ul className="text-sm space-y-1">
                      {aiAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!aiAnalysis && !isGenerating && (
              <div className="text-center py-6 text-muted-foreground">
                <Brain className="w-8 h-8 mx-auto mb-2" />
                <p>Kliknite "Analiziraj AI" za predikciju rizika</p>
                <p className="text-sm">AI će analizirati lokaciju, vrstu i druge faktore</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Otkaži
          </Button>
          <Button 
            onClick={generatePrediction} 
            disabled={isGenerating || !aiAnalysis || activeModels.length === 0}
          >
            {isGenerating ? "Čuvanje..." : "Sačuvaj Predikciju"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}