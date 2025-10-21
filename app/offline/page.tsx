"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WifiOff, Wifi, RefreshCw, Database, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(3)
  const [lastSync, setLastSync] = useState(new Date())

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSync = () => {
    console.log("[v0] Syncing offline data...")
    setPendingSync(0)
    setLastSync(new Date())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offline Mode</h1>
          <p className="text-muted-foreground">Manage offline data and synchronization</p>
        </div>
        <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      {!isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>You are currently offline</AlertTitle>
          <AlertDescription>
            You can continue working. Your changes will be synchronized when you reconnect to the internet.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
            <CardDescription>Data synchronization information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Pending Changes</span>
              </div>
              <Badge variant="outline">{pendingSync}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Sync</span>
              </div>
              <span className="text-sm text-muted-foreground">{lastSync.toLocaleString()}</span>
            </div>
            <Button onClick={handleSync} disabled={!isOnline || pendingSync === 0} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offline Capabilities</CardTitle>
            <CardDescription>Features available offline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chart-3" />
                <div>
                  <p className="text-sm font-medium">Record Wildlife Sightings</p>
                  <p className="text-xs text-muted-foreground">Create new sighting reports offline</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chart-3" />
                <div>
                  <p className="text-sm font-medium">Submit Hazard Reports</p>
                  <p className="text-xs text-muted-foreground">Document hazards without connectivity</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chart-3" />
                <div>
                  <p className="text-sm font-medium">Complete Tasks</p>
                  <p className="text-xs text-muted-foreground">Mark tasks as complete offline</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-chart-3" />
                <div>
                  <p className="text-sm font-medium">View Cached Data</p>
                  <p className="text-xs text-muted-foreground">Access previously loaded information</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Synchronization</CardTitle>
          <CardDescription>Changes waiting to be synced</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingSync > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Wildlife Sighting - Canada Geese</p>
                  <p className="text-xs text-muted-foreground">Created 2 hours ago</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Task Completion - Morning Inspection</p>
                  <p className="text-xs text-muted-foreground">Created 1 hour ago</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Hazard Report - Standing Water</p>
                  <p className="text-xs text-muted-foreground">Created 30 minutes ago</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>All changes have been synchronized</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PWA Installation</CardTitle>
          <CardDescription>Install as a Progressive Web App</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Install this application on your device for offline access and a native app experience. The PWA includes:
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Offline data access and synchronization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Background sync when connection is restored</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Push notifications for urgent alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Home screen icon for quick access</span>
              </li>
            </ul>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Installation Instructions</AlertTitle>
              <AlertDescription>
                Look for the "Install" or "Add to Home Screen" option in your browser menu to install this application.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
