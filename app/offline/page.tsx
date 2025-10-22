"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WifiOff, Wifi, RefreshCw, Database, AlertCircle, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { syncService } from "@/lib/sync-service"
import { OfflineWildlifeSighting, OfflineHazardReport } from "@/lib/offline-db"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [offlineData, setOfflineData] = useState<{
    sightings: OfflineWildlifeSighting[];
    reports: OfflineHazardReport[];
  }>({
    sightings: [],
    reports: []
  })

  useEffect(() => {
    const initialize = async () => {
      setIsOnline(navigator.onLine)
      const count = await syncService.getPendingSyncCount()
      setPendingSync(count)
      
      // Učitaj offline podatke za prikaz
      const data = await syncService.getAllOfflineData()
      setOfflineData({
        sightings: data.sightings,
        reports: data.reports
      })
      
      setLastSync(new Date())
    }

    initialize()

    const handleOnline = async () => {
      setIsOnline(true)
      // Automatski sinhronizuj kada se vrati konekcija
      const count = await syncService.getPendingSyncCount()
      if (count > 0) {
        await handleSync()
      }
    }

    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      console.log("[v1] Početak sinhronizacije offline podataka...")
      await syncService.syncAllData()
      const count = await syncService.getPendingSyncCount()
      setPendingSync(count)
      setLastSync(new Date())
      
      // Osveži prikaz podataka
      const data = await syncService.getAllOfflineData()
      setOfflineData({
        sightings: data.sightings,
        reports: data.reports
      })
      
      console.log("[v1] Sinhronizacija završena")
    } catch (error) {
      console.error("[v1] Greška pri sinhronizaciji:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Funkcije za dodavanje offline podataka
  const addSampleWildlifeSighting = async () => {
    const sighting: Omit<OfflineWildlifeSighting, 'id' | 'createdAt' | 'updatedAt' | 'synced'> = {
      species: "Kanadska guska",
      count: Math.floor(Math.random() * 10) + 1,
      location: "Jezero u parku",
      latitude: 44.7866 + (Math.random() - 0.5) * 0.01,
      longitude: 20.4489 + (Math.random() - 0.5) * 0.01,
      severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
      notes: "Primjećeno ujutro"
    }
    
    await syncService.addWildlifeSighting(sighting)
    const count = await syncService.getPendingSyncCount()
    setPendingSync(count)
    
    // Osveži prikaz
    const data = await syncService.getAllOfflineData()
    setOfflineData({
      sightings: data.sightings,
      reports: data.reports
    })
  }

  const addSampleHazardReport = async () => {
    const report: Omit<OfflineHazardReport, 'id' | 'createdAt' | 'updatedAt' | 'synced'> = {
      title: "Stajaća voda",
      description: "Velika količina stajaće vode koja može privući komarce",
      location: "Zapadni dio parka",
      latitude: 44.7876 + (Math.random() - 0.5) * 0.01,
      longitude: 20.4499 + (Math.random() - 0.5) * 0.01,
      severity: "medium",
      priority: "medium",
      status: "open"
    }
    
    await syncService.addHazardReport(report)
    const count = await syncService.getPendingSyncCount()
    setPendingSync(count)
    
    // Osveži prikaz
    const data = await syncService.getAllOfflineData()
    setOfflineData({
      sightings: data.sightings,
      reports: data.reports
    })
  }

  const clearAllData = async () => {
    if (confirm("Da li ste sigurni da želite obrisati sve offline podatke?")) {
      await syncService.clearAllOfflineData()
      setPendingSync(0)
      setOfflineData({ sightings: [], reports: [] })
    }
  }

  // Formatiranje vremena
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'upravo sada'
    if (diffMins < 60) return `prije ${diffMins} minuta`
    if (diffHours < 24) return `prije ${diffHours} sati`
    return `prije ${diffDays} dana`
  }

  // Prikaži loading stanje dok se client-side hydratacija ne završi
  if (lastSync === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Offline Režim</h1>
            <p className="text-muted-foreground">Upravljajte offline podacima i sinhronizacijom</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Učitavanje...
          </Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offline Režim</h1>
          <p className="text-muted-foreground">Upravljajte offline podacima i sinhronizacijom</p>
        </div>
        <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      {!isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Trenutno ste offline</AlertTitle>
          <AlertDescription>
            Možete nastaviti sa radom. Vaše promjene će se sinhronizovati kada se ponovo povežete na internet.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Sinhronizacije</CardTitle>
            <CardDescription>Informacije o sinhronizaciji podataka</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Promjene na čekanju</span>
              </div>
              <Badge variant="outline">{pendingSync}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Posljednja sinhronizacija</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {lastSync ? lastSync.toLocaleString() : 'Nikad'}
              </span>
            </div>
            <Button 
              onClick={handleSync} 
              disabled={!isOnline || pendingSync === 0 || isSyncing}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sinhronizacija...' : 'Sinhronizuj Sada'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offline Akcije</CardTitle>
            <CardDescription>Dodajte podatke offline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={addSampleWildlifeSighting}
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj zapažanje divljači
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={addSampleHazardReport}
            >
              <Plus className="w-4 h-4 mr-2" />
              Prijavi opasnost
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive"
              onClick={clearAllData}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Obriši sve podatke
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Offline Mogućnosti</CardTitle>
            <CardDescription>Funkcije dostupne offline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chart-3" />
                <div>
                  <p className="text-sm font-medium">Evidentiranje zapažanja divljači</p>
                  <p className="text-xs text-muted-foreground">Kreirajte nove izvještaje o zapažanjima offline</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chart-3" />
                <div>
                  <p className="text-sm font-medium">Podnošenje izvještaja o opasnostima</p>
                  <p className="text-xs text-muted-foreground">Dokumentujte opasnosti bez konekcije</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chart-3" />
                <div>
                  <p className="text-sm font-medium">Završavanje zadataka</p>
                  <p className="text-xs text-muted-foreground">Označite zadatke kao završene offline</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chart-3" />
                <div>
                  <p className="text-sm font-medium">Pregled keširanih podataka</p>
                  <p className="text-xs text-muted-foreground">Pristupite prethodno učitanim informacijama</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistika</CardTitle>
            <CardDescription>Pregled offline podataka</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Zapažanja divljači</span>
                <Badge variant="secondary">{offlineData.sightings.length}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Izvještaji o opasnostima</span>
                <Badge variant="secondary">{offlineData.reports.length}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Nesinhronizovano</span>
                <Badge variant={pendingSync > 0 ? "destructive" : "default"}>
                  {pendingSync}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sinhronizacija na čekanju</CardTitle>
          <CardDescription>Promjene koje čekaju sinhronizaciju</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingSync > 0 ? (
            <div className="space-y-3">
              {offlineData.sightings
                .filter(sighting => !sighting.synced)
                .map((sighting, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Zapažanje divljači - {sighting.species}</p>
                      <p className="text-xs text-muted-foreground">
                        Kreirano {formatTimeAgo(sighting.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline">Na čekanju</Badge>
                  </div>
                ))}
              {offlineData.reports
                .filter(report => !report.synced)
                .map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Izvještaj o opasnosti - {report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Kreirano {formatTimeAgo(report.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline">Na čekanju</Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Sve promjene su sinhronizovane</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Svi Offline Podaci</CardTitle>
          <CardDescription>Pregled svih lokalno pohranjenih podataka</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Zapažanja divljači */}
            <div>
              <h4 className="font-medium mb-3">Zapažanja divljači ({offlineData.sightings.length})</h4>
              {offlineData.sightings.length > 0 ? (
                <div className="space-y-2">
                  {offlineData.sightings.map((sighting, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sighting.species}</p>
                        <p className="text-xs text-muted-foreground">
                          {sighting.count} jedinki • {sighting.location} • {formatTimeAgo(sighting.createdAt)}
                        </p>
                      </div>
                      <Badge variant={sighting.synced ? "default" : "destructive"}>
                        {sighting.synced ? 'Sinhronizovano' : 'Na čekanju'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nema zapažanja divljači
                </p>
              )}
            </div>

            {/* Izvještaji o opasnostima */}
            <div>
              <h4 className="font-medium mb-3">Izvještaji o opasnostima ({offlineData.reports.length})</h4>
              {offlineData.reports.length > 0 ? (
                <div className="space-y-2">
                  {offlineData.reports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.severity} prioritet • {formatTimeAgo(report.createdAt)}
                        </p>
                      </div>
                      <Badge variant={report.synced ? "default" : "destructive"}>
                        {report.synced ? 'Sinhronizovano' : 'Na čekanju'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nema izvještaja o opasnostima
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PWA Instalacija</CardTitle>
          <CardDescription>Instalirajte kao Progressive Web App</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Instalirajte ovu aplikaciju na vašem uređaju za offline pristup i native app iskustvo. PWA uključuje:
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Offline pristup podacima i sinhronizacija</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Pozadinska sinhronizacija kada se konekcija vrati</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Push notifikacije za hitna upozorenja</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Ikona na početnom ekranu za brzi pristup</span>
              </li>
            </ul>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Uputstva za instalaciju</AlertTitle>
              <AlertDescription>
                Potražite opciju "Instaliraj" ili "Dodaj na početni ekran" u meniju vašeg pretraživača da instalirate ovu aplikaciju.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}