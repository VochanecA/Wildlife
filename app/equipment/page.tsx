import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { Plus, Wrench, Camera, Car, Zap, Settings, MapPin, Calendar, Download } from "lucide-react"
import Link from "next/link"
import { AddEquipmentDialog } from "@/components/add-equipment-dialog"
import { EquipmentPDFExportButton } from "@/components/equipment-pdf-export-button"
import { getEquipmentReport } from "@/lib/equipment"

export default async function EquipmentPage() {
  const supabase = await createClient()

  // Fetch equipment
  const { data: equipment } = await supabase
    .from("equipment")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch equipment usage
  const { data: usage } = await supabase
    .from("equipment_usage")
    .select(`
      *,
      equipment (name, type),
      profiles (full_name)
    `)
    .order("start_time", { ascending: false })
    .limit(10)

  // Get equipment report data for PDF
  const reportData = await getEquipmentReport()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'repellent':
        return <Zap className="w-5 h-5" />
      case 'camera':
        return <Camera className="w-5 h-5" />
      case 'vehicle':
        return <Car className="w-5 h-5" />
      case 'trap':
        return <Settings className="w-5 h-5" />
      case 'sensor':
        return <Wrench className="w-5 h-5" />
      default:
        return <Settings className="w-5 h-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'repellent':
        return "Repelent"
      case 'camera':
        return "Kamera"
      case 'vehicle':
        return "Vozilo"
      case 'trap':
        return "Zamka"
      case 'sensor':
        return "Senzor"
      case 'other':
        return "Ostalo"
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return "bg-green-100 text-green-800"
      case 'in_use':
        return "bg-blue-100 text-blue-800"
      case 'maintenance':
        return "bg-orange-100 text-orange-800"
      case 'retired':
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return "Dostupno"
      case 'in_use':
        return "U upotrebi"
      case 'maintenance':
        return "Na održavanju"
      case 'retired':
        return "Povučeno"
      default:
        return status
    }
  }

  // Calculate statistics
  const totalEquipment = equipment?.length || 0
  const availableEquipment = equipment?.filter(e => e.status === 'available').length || 0
  const maintenanceEquipment = equipment?.filter(e => e.status === 'maintenance').length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Oprema i Resursi</h1>
          <p className="text-muted-foreground">Upravljanje opremom za kontrolu divljih životinja</p>
        </div>
        <div className="flex items-center gap-2">
          {reportData && <EquipmentPDFExportButton reportData={reportData} />}
          <AddEquipmentDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj Opremu
            </Button>
          </AddEquipmentDialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno Opreme</CardTitle>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment}</div>
            <p className="text-xs text-muted-foreground">Jedinica opreme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dostupno</CardTitle>
            <Wrench className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableEquipment}</div>
            <p className="text-xs text-muted-foreground">Spremno za upotrebu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Na Održavanju</CardTitle>
            <Wrench className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceEquipment}</div>
            <p className="text-xs text-muted-foreground">Zahteva servis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">U Upotrebi</CardTitle>
            <Car className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {equipment?.filter(e => e.status === 'in_use').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Aktivno korištenje</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Equipment List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Sva Oprema
            </CardTitle>
            <CardDescription>
              Pregled svih resursa i opreme na aerodromu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equipment && equipment.length > 0 ? (
                equipment.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{getTypeLabel(item.type)}</span>
                          {item.location && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{item.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                      {item.next_maintenance && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Servis: {new Date(item.next_maintenance).toLocaleDateString('bs-BA')}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-2" />
                  <p>Nema opreme</p>
                  <p className="text-sm">Dodajte prvu jedinicu opreme</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Nedavna Upotreba
            </CardTitle>
            <CardDescription>
              Poslednje korištenje opreme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usage && usage.length > 0 ? (
                usage.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{record.equipment?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.profiles?.full_name || "Korisnik"} • 
                        {new Date(record.start_time).toLocaleDateString('bs-BA')}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {getTypeLabel(record.equipment?.type)}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2" />
                  <p>Nema zapisa o upotrebi</p>
                  <p className="text-sm">Započnite korištenje opreme</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Alerts */}
      {equipment && equipment.filter(e => 
        e.next_maintenance && new Date(e.next_maintenance) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ).length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Wrench className="w-5 h-5" />
              Predstojeći Servisi
            </CardTitle>
            <CardDescription className="text-orange-700">
              Oprema koja zahtijeva servis u narednih 7 dana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {equipment
                .filter(e => e.next_maintenance && new Date(e.next_maintenance) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-orange-700">({getTypeLabel(item.type)})</span>
                    </div>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      Servis: {new Date(item.next_maintenance!).toLocaleDateString('bs-BA')}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}