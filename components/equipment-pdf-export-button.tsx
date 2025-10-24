"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface EquipmentPDFExportButtonProps {
  reportData: any
}

export function EquipmentPDFExportButton({ reportData }: EquipmentPDFExportButtonProps) {
  const { toast } = useToast()

  const generatePDF = () => {
    try {
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(20)
      doc.text("Izvještaj o Stanju Opreme", 14, 22)
      
      // Report info
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generisano: ${new Date(reportData.generated_at).toLocaleDateString('bs-BA')} ${new Date(reportData.generated_at).toLocaleTimeString('bs-BA')}`, 14, 32)

      let yPosition = 45

      // Ukupan pregled statusa
      doc.setFontSize(16)
      doc.setTextColor(0)
      doc.text("Ukupan Pregled Statusa", 14, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      const statusData = [
        ['Dostupno', reportData.statusSummary.available],
        ['U upotrebi', reportData.statusSummary.in_use],
        ['Na održavanju', reportData.statusSummary.maintenance],
        ['Povučeno', reportData.statusSummary.retired],
        ['Ukupno', reportData.statusSummary.total]
      ]

      autoTable(doc, {
        startY: yPosition,
        head: [['Status', 'Broj opreme']],
        body: statusData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Pregled po kategorijama
      doc.setFontSize(16)
      doc.text("Pregled po Kategorijama", 14, yPosition)
      yPosition += 10

      const categoryData = Object.entries(reportData.categories).map(([category, data]: [string, any]) => [
        getCategoryDisplayName(category),
        data.available,
        data.in_use,
        data.maintenance,
        data.retired,
        data.total
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Kategorija', 'Dostupno', 'U upotrebi', 'Održavanje', 'Povučeno', 'Ukupno']],
        body: categoryData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] }
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Oprema koja zahtijeva održavanje
      if (reportData.maintenanceNeeded.length > 0) {
        doc.setFontSize(16)
        doc.text("Oprema za Održavanje", 14, yPosition)
        yPosition += 8

        const maintenanceData = reportData.maintenanceNeeded.map((item: any, index: number) => [
          index + 1,
          item.name,
          getCategoryDisplayName(item.type),
          item.location || 'N/A',
          item.next_maintenance ? new Date(item.next_maintenance).toLocaleDateString('bs-BA') : 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['#', 'Naziv', 'Kategorija', 'Lokacija', 'Datum održavanja']],
          body: maintenanceData,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [245, 158, 11] }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Oprema trenutno u upotrebi
      if (reportData.equipmentInUse.length > 0) {
        doc.setFontSize(16)
        doc.text("Oprema u Upotrebi", 14, yPosition)
        yPosition += 8

        const inUseData = reportData.equipmentInUse.map((item: any, index: number) => [
          index + 1,
          item.name,
          getCategoryDisplayName(item.type),
          item.location || 'N/A',
          item.last_maintenance ? new Date(item.last_maintenance).toLocaleDateString('bs-BA') : 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['#', 'Naziv', 'Kategorija', 'Lokacija', 'Zadnje održavanje']],
          body: inUseData,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Detaljan spisak sve opreme
      doc.setFontSize(16)
      doc.text("Detaljan Spisak Opreme", 14, yPosition)
      yPosition += 8

      const equipmentData = reportData.equipment.map((item: any, index: number) => [
        index + 1,
        item.name,
        getCategoryDisplayName(item.type),
        getStatusDisplayName(item.status),
        item.location || 'N/A',
        item.last_maintenance ? new Date(item.last_maintenance).toLocaleDateString('bs-BA') : 'N/A',
        item.next_maintenance ? new Date(item.next_maintenance).toLocaleDateString('bs-BA') : 'N/A'
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Naziv', 'Kategorija', 'Status', 'Lokacija', 'Zadnje održ.', 'Sljedeće održ.']],
        body: equipmentData,
        theme: 'grid',
        styles: { fontSize: 7 },
        headStyles: { fillColor: [100, 116, 139] }
      })

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
      doc.save(`izvjestaj_stanje_opreme_${new Date().toISOString().split('T')[0]}.pdf`)

      toast({
        title: "PDF generisan",
        description: "Izvještaj o opremi je uspješno preuzet",
      })

    } catch (error) {
      console.error("Error generating equipment PDF:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri generisanju PDF-a",
        variant: "destructive",
      })
    }
  }

  // Helper funkcije za prikaz naziva
  const getCategoryDisplayName = (category: string) => {
    const categories: { [key: string]: string } = {
      repellent: 'Repelent',
      camera: 'Kamera',
      trap: 'Zamka',
      sensor: 'Senzor',
      vehicle: 'Vozilo',
      other: 'Ostalo'
    }
    return categories[category] || category
  }

  const getStatusDisplayName = (status: string) => {
    const statuses: { [key: string]: string } = {
      available: 'Dostupno',
      in_use: 'U upotrebi',
      maintenance: 'Na održavanju',
      retired: 'Povučeno'
    }
    return statuses[status] || status
  }

  return (
    <Button onClick={generatePDF}>
      <Download className="w-4 h-4 mr-2" />
      Preuzmi PDF Izvještaj
    </Button>
  )
}