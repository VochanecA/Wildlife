import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { Download, Calendar, FileText, ArrowLeft, BarChart3, Users, AlertTriangle, Bird, MapPin } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PDFExportButton } from "@/components/pdf-export-button"

interface ReportPageProps {
  params: Promise<{ id: string }>
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch report
  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !report) {
    notFound()
  }

  // Fetch additional data for detailed view
  const { data: sightings } = await supabase
    .from("wildlife_sightings")
    .select("*")
    .gte("created_at", report.period_start + 'T00:00:00Z')
    .lte("created_at", report.period_end + 'T23:59:59Z')

  const { data: hazards } = await supabase
    .from("hazard_reports")
    .select("*")
    .gte("created_at", report.period_start + 'T00:00:00Z')
    .lte("created_at", report.period_end + 'T23:59:59Z')

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-blue-100 text-blue-800"
      case "weekly":
        return "bg-green-100 text-green-800"
      case "monthly":
        return "bg-purple-100 text-purple-800"
      case "quarterly":
        return "bg-orange-100 text-orange-800"
      case "yearly":
        return "bg-red-100 text-red-800"
      case "custom":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "daily":
        return "Dnevni"
      case "weekly":
        return "Nedeljni"
      case "monthly":
        return "Mjesečni"
      case "quarterly":
        return "Kvartalni"
      case "yearly":
        return "Godišnji"
      case "custom":
        return "Prilagođeni"
      default:
        return type
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('bs-BA')
  }

  const reportData = report.data as any

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{report.title}</h1>
            <p className="text-muted-foreground">
              Period: {formatDate(report.period_start)} - {formatDate(report.period_end)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <PDFExportButton report={report} sightings={sightings || []} hazards={hazards || []} />
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Report Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informacije o Izvještaju</CardTitle>
              <CardDescription>Osnovne informacije o generisanom izvještaju</CardDescription>
            </div>
            <Badge className={getReportTypeColor(report.report_type)}>
              {getReportTypeLabel(report.report_type)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-blue-900">
                  {formatDate(report.period_start)}
                </div>
                <div className="text-sm text-blue-700">Datum početka</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-green-900">
                  {formatDate(report.period_end)}
                </div>
                <div className="text-sm text-green-700">Datum završetka</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-purple-900">
                  {new Date(report.generated_at).toLocaleDateString('bs-BA')}
                </div>
                <div className="text-sm text-purple-700">Generisano</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold text-orange-900">
                  {sightings?.length || 0}
                </div>
                <div className="text-sm text-orange-700">Ukupno zapažanja</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sightings Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bird className="w-5 h-5" />
              Statistika Zapažanja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.totalSightings || 0}
                </div>
                <div className="text-sm text-muted-foreground">Ukupno zapažanja</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {reportData.totalAnimals || 0}
                </div>
                <div className="text-sm text-muted-foreground">Ukupno jedinki</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">
                  {reportData.uniqueSpecies || 0}
                </div>
                <div className="text-sm text-muted-foreground">Različitih vrsta</div>
              </div>
            </div>

            {reportData.sightingsBySeverity && (
              <div>
                <h4 className="font-medium mb-2">Zapažanja po ozbiljnosti:</h4>
                <div className="space-y-2">
                  {Object.entries(reportData.sightingsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{severity}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportData.topSpecies && reportData.topSpecies.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Najčešće vrste:</h4>
                <div className="space-y-2">
                  {reportData.topSpecies.map((species: any, index: number) => (
                    <div key={species.species} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm">{species.species}</span>
                      </div>
                      <Badge variant="secondary">{species.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hazards Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Statistika Opasnosti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">
                  {reportData.totalHazards || 0}
                </div>
                <div className="text-sm text-muted-foreground">Ukupno opasnosti</div>
              </div>
            </div>

            {reportData.hazardsByPriority && (
              <div>
                <h4 className="font-medium mb-2">Opasnosti po prioritetu:</h4>
                <div className="space-y-2">
                  {Object.entries(reportData.hazardsByPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{priority}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Hazards */}
            {hazards && hazards.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Nedavne opasnosti:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {hazards.slice(0, 5).map((hazard) => (
                    <div key={hazard.id} className="p-2 border rounded text-sm">
                      <div className="font-medium">{hazard.title}</div>
                      <div className="text-muted-foreground">{hazard.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sightings */}
      {sightings && sightings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Nedavna Zapažanja
            </CardTitle>
            <CardDescription>
              Poslednjih {Math.min(sightings.length, 5)} zapažanja u izabranom periodu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sightings.slice(0, 5).map((sighting) => (
                <div key={sighting.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{sighting.species}</div>
                    <div className="text-sm text-muted-foreground">
                      {sighting.location} • {sighting.count} jedinki
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {sighting.severity}
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