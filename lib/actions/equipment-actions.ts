"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateEquipmentStatus(equipmentId: string, status: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("equipment")
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq("id", equipmentId)
      .select()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/equipment")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Internal server error" }
  }
}