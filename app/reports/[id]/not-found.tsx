import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Izvještaj nije pronađen</h1>
          <p className="text-muted-foreground mb-6">
            Traženi izvještaj ne postoji ili je obrisan.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/reports">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Nazad na Izvještaje
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}