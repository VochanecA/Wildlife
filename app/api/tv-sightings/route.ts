// app/api/tv-sightings/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Dohvati zapažanja iz poslednjih 10 sati
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()

    const { data: sightingsData, error } = await supabase
      .from("wildlife_sightings")
      .select("*")
      .gte("created_at", tenHoursAgo)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Helper function za koordinate
    const getApproximateCoordinates = (location: string) => {
      const locationMap: { [key: string]: { lat: number; lng: number } } = {
        'pista 27': { lat: 42.4043, lng: 18.7235 },
        'pista 31': { lat: 42.4060, lng: 18.7250 },
        'rolna staza b': { lat: 42.4030, lng: 18.7220 },
        'terminal': { lat: 42.4020, lng: 18.7210 },
        'hangar 3': { lat: 42.4050, lng: 18.7240 },
        'sjeverno polje': { lat: 42.4070, lng: 18.7260 },
        'južno polje': { lat: 42.4010, lng: 18.7200 },
        'istočni perimetar': { lat: 42.4040, lng: 18.7270 },
        'zapadni perimetar': { lat: 42.4040, lng: 18.7190 },
        'pista': { lat: 42.4043, lng: 18.7235 },
        'runway': { lat: 42.4043, lng: 18.7235 },
      }
      const normalizedLocation = location.toLowerCase()
      return locationMap[normalizedLocation] || null
    }

    const transformedSightings = (sightingsData || []).map(sighting => ({
      id: sighting.id,
      lat: Number(sighting.latitude) || getApproximateCoordinates(sighting.location)?.lat || 42.4043,
      lng: Number(sighting.longitude) || getApproximateCoordinates(sighting.location)?.lng || 18.7235,
      species: sighting.species,
      count: sighting.count || 1,
      location: sighting.location,
      timestamp: sighting.created_at,
      sound_used: sighting.sound_used || false,
      notes: sighting.notes,
      severity: sighting.severity || 'medium'
    }))

    return NextResponse.json({
      sightings: transformedSightings,
      lastUpdate: new Date().toISOString()
    })

  } catch (err) {
    console.error("API Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}