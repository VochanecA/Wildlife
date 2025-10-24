import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { Plus, Brain, AlertTriangle, Map, BarChart3, Activity, Target, Zap, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { NewPredictionDialog } from "@/components/new-prediction-dialog"
import { RiskMap } from "@/components/risk-map"

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const activeTab = typeof params.tab === 'string' ? params.tab : 'overview'

  // Fetch prediction models - kreiraj default model ako ne postoji
  let { data: models } = await supabase
    .from("prediction_models")
    .select("*")
    .order("created_at", { ascending: false })

  // Ako nema modela, kreiraj default AI model
  if (!models || models.length === 0) {
    const { data: newModel } = await supabase
      .from("prediction_models")
      .insert({
        name: "DeepSeek Wildlife Risk Predictor",
        model_type: "neural_network",
        accuracy: 0.82,
        parameters: {
          algorithm: "transformer",
          training_data: "historical_sightings",
          features: ["location", "species", "season", "weather"],
          version: "1.0"
        },
        is_active: true
      })
      .select()
      .single()

    models = newModel ? [newModel] : []
  }

  // Fetch risk predictions
  const { data: predictions } = await supabase
    .from("risk_predictions")
    .select(`
      *,
      prediction_models (
        name,
        model_type
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  // Fetch recent sightings for context
  const { data: recentSightings } = await supabase
    .from("wildlife_sightings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

  // Fetch hazards for correlation analysis
  const { data: recentHazards } = await supabase
    .from("hazard_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-600 text-white"
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

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  // Calculate statistics
  const totalPredictions = predictions?.length || 0
  const activeModels = models?.filter(m => m.is_active).length || 0
  const highRiskPredictions = predictions?.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length || 0
  const avgConfidence = predictions && predictions.length > 0 
    ? predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length 
    : 0

  // Calculate risk distribution
  const riskDistribution = {
    critical: predictions?.filter(p => p.risk_level === 'critical').length || 0,
    high: predictions?.filter(p => p.risk_level === 'high').length || 0,
    medium: predictions?.filter(p => p.risk_level === 'medium').length || 0,
    low: predictions?.filter(p => p.risk_level === 'low').length || 0
  }

  // Get recent high-risk predictions for alerts
  const recentHighRisk = predictions
    ?.filter(p => (p.risk_level === 'high' || p.risk_level === 'critical') && 
      new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    .slice(0, 5) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Predikcije Rizika</h1>
          <p className="text-muted-foreground">
            Napredne AI predikcije rizika od divljih životinja koristeći DeepSeek model
          </p>
        </div>
        <NewPredictionDialog models={models || []}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Zap className="w-4 h-4 mr-2" />
            Nova AI Predikcija
          </Button>
        </NewPredictionDialog>
      </div>

      {/* Alerts for recent high risk */}
      {recentHighRisk.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-semibold text-red-900">
                  Novi visoki rizici u poslednjih 24h
                </div>
                <div className="text-sm text-red-700">
                  {recentHighRisk.length} predikcija zahtijevaju pažnju
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Predikcije</CardTitle>
            <Brain className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredictions}</div>
            <p className="text-xs text-muted-foreground">
              {recentHighRisk.length > 0 ? `${recentHighRisk.length} novih` : 'Sve stabilno'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visok Rizik</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskPredictions}</div>
            <p className="text-xs text-muted-foreground">
              {riskDistribution.critical} kritičnih
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prosječna Sigurnost</CardTitle>
            <BarChart3 className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgConfidence * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Tačnost predikcija</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Modeli</CardTitle>
            <Target className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModels}</div>
            <p className="text-xs text-muted-foreground">Aktivni DeepSeek modeli</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview" asChild>
            <a href="?tab=overview">Pregled</a>
          </TabsTrigger>
          <TabsTrigger value="map" asChild>
            <a href="?tab=map">Mapa Rizika</a>
          </TabsTrigger>
          <TabsTrigger value="models" asChild>
            <a href="?tab=models">AI Modeli</a>
          </TabsTrigger>
          <TabsTrigger value="predictions" asChild>
            <a href="?tab=predictions">Sve Predikcije</a>
          </TabsTrigger>
          <TabsTrigger value="analytics" asChild>
            <a href="?tab=analytics">Analitika</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Risk Map Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Mapa Rizika - AI Predikcije
                </CardTitle>
                <CardDescription>
                  Vizuelni prikaz AI predviđenih rizika na aerodromu Tivat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskMap predictions={predictions || []} />
              </CardContent>
            </Card>

            {/* Recent High Risk Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Nedavni Visoki Rizici
                </CardTitle>
                <CardDescription>
                  AI predikcije sa visokim i kritičnim nivoom rizika
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions?.filter(p => p.risk_level === 'high' || p.risk_level === 'critical')
                    .slice(0, 5)
                    .map((prediction) => (
                      <div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {prediction.location}
                            <Badge variant="outline" className={getConfidenceBadge(prediction.confidence)}>
                              {(prediction.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {prediction.species || "Različite vrste"} • 
                            {new Date(prediction.created_at).toLocaleDateString('bs-BA')}
                          </div>
                        </div>
                        <Badge className={getRiskColor(prediction.risk_level)}>
                          {getRiskLabel(prediction.risk_level)}
                        </Badge>
                      </div>
                    ))}

                  {!predictions?.some(p => p.risk_level === 'high' || p.risk_level === 'critical') && (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-medium">Nema predikcija visokog rizika</p>
                      <p className="text-sm">Sve AI predikcije pokazuju nizak do srednji rizik</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Model Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  DeepSeek AI Performanse
                </CardTitle>
                <CardDescription>
                  Pregled aktivnih AI modela i njihove tačnosti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {models?.filter(m => m.is_active).map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Brain className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{model.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {model.model_type} • DeepSeek AI
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : "82.0%"}
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Aktivni
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {!models?.some(m => m.is_active) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">Nema aktivnih AI modela</p>
                      <p className="text-sm">Kreirajte novi AI model za predikciju rizika</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Interaktivna Mapa AI Predikcija
              </CardTitle>
              <CardDescription>
                Detaljna mapa sa svim AI predikcijama rizika na aerodromu Tivat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RiskMap predictions={predictions || []} detailed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">DeepSeek AI Modeli</h3>
              <p className="text-muted-foreground">Upravljajte AI modelima za predikciju rizika</p>
            </div>
            <NewPredictionDialog models={models || []}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova AI Predikcija
              </Button>
            </NewPredictionDialog>
          </div>

          <div className="grid gap-4">
            {models?.map((model) => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-blue-600" />
                          {model.name}
                        </CardTitle>
                        {model.is_active && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Aktivni
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="capitalize">
                        {model.model_type} • DeepSeek AI • Kreiran {new Date(model.created_at).toLocaleDateString('bs-BA')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Tačnost</div>
                      <div className="text-2xl font-bold text-green-600">
                        {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : "82.0%"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Status</div>
                      <div>
                        <Badge variant={model.is_active ? "default" : "secondary"}>
                          {model.is_active ? "Aktivni" : "Neaktivan"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Parametri</div>
                      <div className="text-sm">
                        {model.parameters ? Object.keys(model.parameters).length + " parametara" : "Standardni"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Tip</div>
                      <div className="text-sm font-medium text-blue-600">
                        DeepSeek AI
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!models || models.length === 0) && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Nema AI modela</p>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Sistem će automatski kreirati DeepSeek AI model<br />za predikciju rizika
                  </p>
                  <NewPredictionDialog models={[]}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Kreiraj Prvu Predikciju
                    </Button>
                  </NewPredictionDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Sve AI Predikcije</h3>
              <p className="text-muted-foreground">Kompletan istorijat DeepSeek AI predikcija rizika</p>
            </div>
            <NewPredictionDialog models={models || []}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Nova AI Predikcija
              </Button>
            </NewPredictionDialog>
          </div>

          <div className="grid gap-4">
            {predictions?.map((prediction) => (
              <Card key={prediction.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{prediction.location}</CardTitle>
                        <Badge className={getRiskColor(prediction.risk_level)}>
                          {getRiskLabel(prediction.risk_level)}
                        </Badge>
                        <Badge variant="outline" className={getConfidenceBadge(prediction.confidence)}>
                          {(prediction.confidence * 100).toFixed(0)}% sigurnosti
                        </Badge>
                      </div>
                      <CardDescription>
                        {prediction.species || "Različite vrste"} • 
                        DeepSeek AI Model • {new Date(prediction.created_at).toLocaleDateString('bs-BA')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Koordinate</div>
                      <div className="text-sm font-mono">
                        {prediction.latitude.toFixed(4)}, {prediction.longitude.toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Datum Predikcije</div>
                      <div className="text-sm">
                        {new Date(prediction.predicted_date).toLocaleDateString('bs-BA')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">AI Model</div>
                      <div className="text-sm font-medium text-blue-600">
                        DeepSeek AI
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Kreirano</div>
                      <div className="text-sm">
                        {new Date(prediction.created_at).toLocaleDateString('bs-BA')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!predictions || predictions.length === 0) && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Zap className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Nema AI predikcija</p>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Generišite prvu AI predikciju koristeći<br />DeepSeek model za analizu rizika
                  </p>
                  <NewPredictionDialog models={models || []}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Zap className="w-4 h-4 mr-2" />
                      Generiši AI Predikciju
                    </Button>
                  </NewPredictionDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Distribucija Rizika
                </CardTitle>
                <CardDescription>
                  Pregled AI predikcija po nivou rizika
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{riskDistribution.critical}</div>
                    <div className="text-sm text-red-700">Kritičan</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{riskDistribution.high}</div>
                    <div className="text-sm text-orange-700">Visok</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{riskDistribution.medium}</div>
                    <div className="text-sm text-yellow-700">Srednji</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{riskDistribution.low}</div>
                    <div className="text-sm text-green-700">Nizak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Performance Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performanse DeepSeek AI
                </CardTitle>
                <CardDescription>
                  Tačnost i pouzdanost AI predikcija tokom vremena
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Prosječna tačnost modela</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {models && models.length > 0 
                        ? `${(models.reduce((acc, m) => acc + (m.accuracy || 0.82), 0) / models.length * 100).toFixed(1)}%`
                        : "82.0%"
                      }
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Ukupno AI predikcija</span>
                    <Badge variant="secondary">{totalPredictions}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="font-medium">Prosječna sigurnost</span>
                    <Badge variant="secondary">{(avgConfidence * 100).toFixed(1)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Dodajte ovu komponentu na vrhu fajla ako je potrebno
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}