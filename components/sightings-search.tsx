"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function SightingsSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    if (searchQuery) {
      params.set("search", searchQuery)
    } else {
      params.delete("search")
    }
    router.push(`/sightings?${params.toString()}`)
  }

  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by species or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="pl-9"
        />
      </div>
      <Button variant="outline" onClick={handleSearch}>
        <Filter className="w-4 h-4 mr-2" />
        Search
      </Button>
    </div>
  )
}
