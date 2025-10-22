// components/new-task-dialog.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NewTaskDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface User {
  id: string
  full_name: string
}

export function NewTaskDialog({ children, open: externalOpen, onOpenChange: externalOnOpenChange }: NewTaskDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [taskType, setTaskType] = useState("")
  const [priority, setPriority] = useState("")
  const [dueDate, setDueDate] = useState<Date>()
  const [assignedTo, setAssignedTo] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name")
      
      if (profiles) {
        setUsers(profiles)
      }
    }

    if (open) {
      fetchUsers()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("Current user:", user)

      if (userError || !user) {
        console.error("User error:", userError)
        toast({
          title: "Greška",
          description: "Morate biti prijavljeni da biste kreirali zadatak",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Prepare task data - samo kolone koje postoje u bazi
      const taskData = {
        user_id: user.id,
        title: title,
        description: description,
        task_type: taskType,
        priority: priority,
        status: "pending",
        assigned_to: assignedTo,
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
        // location kolona je uklonjena jer ne postoji u bazi
      }

      console.log("Inserting task data:", taskData)

      // Insert task
      const { data, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select()

      console.log("Insert result - data:", data)
      console.log("Insert result - error:", error)

      if (error) {
        console.error("Error inserting task:", error)
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        let errorMessage = "Došlo je do greške pri kreiranju zadatka"
        if (error.code === '42501') {
          errorMessage = "Nemate dozvolu za kreiranje zadataka. Proverite RLS politike."
        } else if (error.code === '23503') {
          errorMessage = "Nevažeći korisnik za dodjelu. Proverite assigned_to vrednost."
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast({
          title: "Greška",
          description: errorMessage,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Zadatak kreiran",
        description: "Zadatak je uspješno zakazan.",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setTaskType("")
      setPriority("")
      setDueDate(undefined)
      setAssignedTo(null)
      
      setIsSubmitting(false)
      setOpen(false)
      
      // Refresh the page to show new data
      router.refresh()

    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Greška",
        description: "Došlo je do neočekivane greške",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kreiraj Novi Zadatak</DialogTitle>
          <DialogDescription>Zakažite zadatak upravljanja divljači</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Naslov Zadatka *</Label>
              <Input 
                id="title" 
                placeholder="npr. Jutarnji pregled piste" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis *</Label>
              <Textarea 
                id="description" 
                placeholder="Detaljan opis zadatka (uključujući lokaciju ako je potrebno)" 
                rows={3} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskType">Tip Zadatka *</Label>
                <Select value={taskType} onValueChange={setTaskType} required>
                  <SelectTrigger id="taskType">
                    <SelectValue placeholder="Odaberite tip" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Dnevni</SelectItem>
                    <SelectItem value="weekly">Nedjeljni</SelectItem>
                    <SelectItem value="monthly">Mjesečni</SelectItem>
                    <SelectItem value="yearly">Godišnji</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioritet *</Label>
                <Select value={priority} onValueChange={setPriority} required>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Odaberite prioritet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nizak</SelectItem>
                    <SelectItem value="medium">Srednji</SelectItem>
                    <SelectItem value="high">Visok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rok *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Odaberite datum</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignTo">Dodijeli</Label>
                <Select value={assignedTo || undefined} onValueChange={setAssignedTo}>
                  <SelectTrigger id="assignTo">
                    <SelectValue placeholder="Nije dodijeljeno" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lokacija polje je uklonjeno jer ne postoji u bazi */}
            {/* Ako želite da korisnici unesu lokaciju, možete je dodati u opis */}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Otkaži
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kreiranje..." : "Kreiraj Zadatak"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}