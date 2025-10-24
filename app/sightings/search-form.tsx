"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

interface SearchParams {
  search?: string
  location?: string
  species?: string
  date?: string
}

interface SearchFormProps {
  searchParams: SearchParams
}

export function SearchForm({ searchParams }: SearchFormProps) {
  const handleReset = () => {
    window.location.href = '/sightings'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Pretraživanje Zapažanja
        </CardTitle>
        <CardDescription>Pretražite zapažanja po različitim kriterijumima</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">Opšta pretraga</label>
            <Input
              id="search"
              name="search"
              placeholder="Vrsta, lokacija, napomene..."
              defaultValue={searchParams.search || ''}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="species" className="text-sm font-medium">Vrsta životinje</label>
            <Input
              id="species"
              name="species"
              placeholder="Naziv vrste..."
              defaultValue={searchParams.species || ''}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">Lokacija</label>
            <Input
              id="location"
              name="location"
              placeholder="Naziv lokacije..."
              defaultValue={searchParams.location || ''}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">Datum</label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={searchParams.date || ''}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex gap-2">
            <Button type="submit" className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Pretraži
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Poništi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}