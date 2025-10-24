import { createClient } from "@/lib/supabase/server"

export async function recordEquipmentUsage({
  equipmentId,
  userId,
  taskId,
  startTime,
  endTime,
  notes
}: {
  equipmentId: string
  userId: string
  taskId?: string
  startTime: string
  endTime?: string
  notes?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('equipment_usage')
    .insert({
      equipment_id: equipmentId,
      user_id: userId,
      task_id: taskId,
      start_time: startTime,
      end_time: endTime,
      notes
    })

  if (error) {
    console.error('Error recording equipment usage:', error)
    return false
  }

  // Update equipment status to 'in_use'
  await supabase
    .from('equipment')
    .update({ status: 'in_use' })
    .eq('id', equipmentId)

  return true
}

export async function returnEquipment(equipmentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('equipment')
    .update({ status: 'available' })
    .eq('id', equipmentId)

  if (error) {
    console.error('Error returning equipment:', error)
    return false
  }

  return true
}

// lib/equipment.ts - dodajte ove funkcije

export async function getEquipmentReport() {
  const supabase = await createClient()

  // Dobij sve opreme sa podacima
  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('*')
    .order('type')
    .order('name')

  if (error) {
    console.error('Error fetching equipment:', error)
    return null
  }

  // Grupiraj po kategorijama i statusu
  const categories = {
    repellent: { available: 0, in_use: 0, maintenance: 0, retired: 0, total: 0 },
    camera: { available: 0, in_use: 0, maintenance: 0, retired: 0, total: 0 },
    trap: { available: 0, in_use: 0, maintenance: 0, retired: 0, total: 0 },
    sensor: { available: 0, in_use: 0, maintenance: 0, retired: 0, total: 0 },
    vehicle: { available: 0, in_use: 0, maintenance: 0, retired: 0, total: 0 },
    other: { available: 0, in_use: 0, maintenance: 0, retired: 0, total: 0 }
  }

  const statusSummary = {
    available: 0,
    in_use: 0,
    maintenance: 0,
    retired: 0,
    total: 0
  }

  // Obradi podatke
  equipment?.forEach(item => {
    const category = item.type as keyof typeof categories
    const status = item.status as keyof typeof statusSummary

    if (categories[category]) {
      categories[category][status]++
      categories[category].total++
    }

    statusSummary[status]++
    statusSummary.total++
  })

  // Oprema koja zahtijeva održavanje
  const maintenanceNeeded = equipment?.filter(item => 
    item.next_maintenance && new Date(item.next_maintenance) <= new Date()
  ) || []

  // Oprema u upotrebi
  const equipmentInUse = equipment?.filter(item => item.status === 'in_use') || []

  return {
    equipment,
    categories,
    statusSummary,
    maintenanceNeeded,
    equipmentInUse,
    generated_at: new Date().toISOString()
  }
}