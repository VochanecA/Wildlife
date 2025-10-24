import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { Plus, Download, Calendar, FileText, BarChart3, Users, AlertTriangle, Bird } from "lucide-react"
import Link from "next/link"
import { GenerateReportDialog } from "@/components/generate-report-dialog"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const activeTab = typeof params.tab === 'string' ? params.tab : 'all'

  // Fetch reports
  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .order("generated_at", { ascending: false })

  // Fetch current user for generating reports
  const { data: { user } } = await supabase.auth.getUser()

  if (error) {
    console.error("Error fetching reports:", error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Izvještaji</h1>
            <p className="text-muted-foreground">Generišite i pregledajte izvještaje o aktivnostima</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2 text-destructive">Greška pri učitavanju podataka</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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

  // Filter reports based on active tab
  const filteredReports = reports?.filter((report) => {
    return activeTab === "all" || report.report_type === activeTab
  }) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Izvještaji</h1>
          <p className="text-muted-foreground">Generišite i pregledajte izvještaje o aktivnostima</p>
        </div>
        <GenerateReportDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Generiši Izvještaj
          </Button>
        </GenerateReportDialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno Izvještaja</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Generisano do sada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dnevni</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports?.filter(r => r.report_type === 'daily').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Izvještaji</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mjesečni</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports?.filter(r => r.report_type === 'monthly').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Izvještaji</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Godišnji</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports?.filter(r => r.report_type === 'yearly').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Izvještaji</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all" asChild>
            <a href="?tab=all">Svi</a>
          </TabsTrigger>
          <TabsTrigger value="daily" asChild>
            <a href="?tab=daily">Dnevni</a>
          </TabsTrigger>
          <TabsTrigger value="weekly" asChild>
            <a href="?tab=weekly">Nedeljni</a>
          </TabsTrigger>
          <TabsTrigger value="monthly" asChild>
            <a href="?tab=monthly">Mjesečni</a>
          </TabsTrigger>
          <TabsTrigger value="quarterly" asChild>
            <a href="?tab=quarterly">Kvartalni</a>
          </TabsTrigger>
          <TabsTrigger value="yearly" asChild>
            <a href="?tab=yearly">Godišnji</a>
          </TabsTrigger>
          <TabsTrigger value="custom" asChild>
            <a href="?tab=custom">Prilagođeni</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredReports.length > 0 ? (
            <div className="grid gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{report.title}</CardTitle>
                          <Badge className={getReportTypeColor(report.report_type)}>
                            {getReportTypeLabel(report.report_type)}
                          </Badge>
                        </div>
                        <CardDescription>
                          Period: {formatDate(report.period_start)} - {formatDate(report.period_end)}
                        </CardDescription>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Generisano: {new Date(report.generated_at).toLocaleString('bs-BA')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/reports/${report.id}`}>
                            <FileText className="w-4 h-4 mr-2" />
                            Pregled
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Preuzmi
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ReportPreview data={report.data} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Nema izvještaja</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeTab === 'all' 
                    ? "Generišite prvi izvještaj da biste počeli sa praćenjem aktivnosti" 
                    : `Nema ${getReportTypeLabel(activeTab).toLowerCase()} izvještaja`
                  }
                </p>
                <GenerateReportDialog>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Generiši Izvještaj
                  </Button>
                </GenerateReportDialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Komponenta za pregled podataka izvještaja
function ReportPreview({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.totalSightings !== undefined && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bird className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-blue-900">{data.totalSightings}</div>
            <div className="text-sm text-blue-700">Zapažanja</div>
          </div>
        </div>
      )}

      {data.totalHazards !== undefined && (
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div className="font-semibold text-red-900">{data.totalHazards}</div>
            <div className="text-sm text-red-700">Opasnosti</div>
          </div>
        </div>
      )}

      {data.totalAnimals !== undefined && (
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-green-900">{data.totalAnimals}</div>
            <div className="text-sm text-green-700">Jedinki</div>
          </div>
        </div>
      )}

      {data.uniqueSpecies !== undefined && (
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-purple-900">{data.uniqueSpecies}</div>
            <div className="text-sm text-purple-700">Vrsta</div>
          </div>
        </div>
      )}
    </div>
  )
}