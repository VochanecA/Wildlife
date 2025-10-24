"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface PDFExportButtonProps {
  report: any
  sightings: any[]
  hazards: any[]
}

export function PDFExportButton({ report, sightings, hazards }: PDFExportButtonProps) {
  const { toast } = useToast()

  const generatePDF = () => {
    try {
      const doc = new jsPDF()
      const reportData = report.data as any

      // Title
      doc.setFontSize(20)
      doc.text(report.title, 14, 22)
      
      // Report info
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Period: ${new Date(report.period_start).toLocaleDateString('bs-BA')} - ${new Date(report.period_end).toLocaleDateString('bs-BA')}`, 14, 32)
      doc.text(`Generisano: ${new Date(report.generated_at).toLocaleDateString('bs-BA')}`, 14, 38)

      let yPosition = 50

      // Summary Statistics
      doc.setFontSize(16)
      doc.setTextColor(0)
      doc.text("Sažetak Statistike", 14, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      const summaryData = [
        ['Ukupno zapažanja', reportData.totalSightings || 0],
        ['Ukupno opasnosti', reportData.totalHazards || 0],
        ['Ukupno jedinki', reportData.totalAnimals || 0],
        ['Različitih vrsta', reportData.uniqueSpecies || 0]
      ]

      autoTable(doc, {
        startY: yPosition,
        head: [['Metrika', 'Vrijednost']],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }
      })

      yPosition = (doc as any).lastAutoTable.finalY + 10

      // Sightings by Severity
      if (reportData.sightingsBySeverity) {
        doc.setFontSize(14)
        doc.text("Zapažanja po Ozbiljnosti", 14, yPosition)
        yPosition += 8

        const severityData: (string | number)[][] = Object.entries(reportData.sightingsBySeverity).map(([severity, count]) => [
          severity.charAt(0).toUpperCase() + severity.slice(1),
          count as number
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Ozbiljnost', 'Broj']],
          body: severityData,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // Top Species
      if (reportData.topSpecies && reportData.topSpecies.length > 0) {
        doc.setFontSize(14)
        doc.text("Najčešće Vrste", 14, yPosition)
        yPosition += 8

        const speciesData = reportData.topSpecies.map((species: any, index: number) => [
          index + 1,
          species.species,
          species.count
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['#', 'Vrsta', 'Broj Zapažanja']],
          body: speciesData,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // Hazards by Priority
      if (reportData.hazardsByPriority) {
        doc.setFontSize(14)
        doc.text("Opasnosti po Prioritetu", 14, yPosition)
        yPosition += 8

        const priorityData = Object.entries(reportData.hazardsByPriority).map(([priority, count]): [string, number] => [
          priority.charAt(0).toUpperCase() + priority.slice(1),
          count as number
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Prioritet', 'Broj']],
          body: priorityData,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [239, 68, 68] }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // Recent Sightings
      if (sightings.length > 0) {
        doc.setFontSize(14)
        doc.text("Nedavna Zapažanja", 14, yPosition)
        yPosition += 8

        const recentSightingsData = sightings.slice(0, 10).map(sighting => [
          sighting.species,
          sighting.location,
          sighting.count,
          sighting.severity.charAt(0).toUpperCase() + sighting.severity.slice(1),
          new Date(sighting.created_at).toLocaleDateString('bs-BA')
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Vrsta', 'Lokacija', 'Broj', 'Ozbiljnost', 'Datum']],
          body: recentSightingsData,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [34, 197, 94] }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // Recent Hazards
      if (hazards.length > 0) {
        doc.setFontSize(14)
        doc.text("Nedavne Opasnosti", 14, yPosition)
        yPosition += 8

        const recentHazardsData = hazards.slice(0, 10).map(hazard => [
          hazard.title,
          hazard.location,
          hazard.priority.charAt(0).toUpperCase() + hazard.priority.slice(1),
          hazard.severity.charAt(0).toUpperCase() + hazard.severity.slice(1),
          new Date(hazard.created_at).toLocaleDateString('bs-BA')
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Naslov', 'Lokacija', 'Prioritet', 'Ozbiljnost', 'Datum']],
          body: recentHazardsData,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [239, 68, 68] }
        })
      }

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(100)
        doc.text(
          `Strana ${i} od ${pageCount} • Generisano: ${new Date().toLocaleString('bs-BA')}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }

      // Save PDF
      doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`)

      toast({
        title: "PDF generisan",
        description: "Izvještaj je uspješno preuzet u PDF formatu",
      })

    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri generisanju PDF-a",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={generatePDF}>
      <Download className="w-4 h-4 mr-2" />
      Preuzmi PDF
    </Button>
  )
}