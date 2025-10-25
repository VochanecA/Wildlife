// components/new-message-dialog.tsx
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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface User {
  id: string
  full_name: string
  email?: string
  role?: string
}

interface NewMessageDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  users?: User[]
  initialData?: {
    recipient_id?: string
    subject?: string
    body?: string
    priority?: string
  }
  onSubmit?: (data: {
    recipient_id: string
    subject: string
    body: string
    priority: string
  }) => Promise<void> | void
}

export function NewMessageDialog({ 
  children, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange,
  users: externalUsers,
  initialData,
  onSubmit: externalOnSubmit
}: NewMessageDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const [recipientId, setRecipientId] = useState("")
  const [priority, setPriority] = useState("normal")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [internalUsers, setInternalUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  // Koristi eksterne korisnike ako su prosleđeni, inače učitaj korisnike
  const users = externalUsers && externalUsers.length > 0 ? externalUsers : internalUsers

  // Inicijalizuj polja sa initialData kada se dijalog otvori
  useEffect(() => {
    if (open && initialData) {
      if (initialData.recipient_id) setRecipientId(initialData.recipient_id)
      if (initialData.subject) setSubject(initialData.subject)
      if (initialData.body) setContent(initialData.body)
      if (initialData.priority) setPriority(initialData.priority)
    }
  }, [open, initialData])

  // Resetuj formu kada se dijalog zatvori
  useEffect(() => {
    if (!open) {
      setRecipientId("")
      setPriority("normal")
      setSubject("")
      setContent("")
    }
  }, [open])

  // Fetch users for recipient selection samo ako nisu prosleđeni eksterni korisnici
  useEffect(() => {
    const fetchUsers = async () => {
      // Ako su već prosleđeni korisnici, ne učitavaj ponovo
      if (externalUsers && externalUsers.length > 0) {
        return
      }

      if (!open) return // Ne učitavaj ako dijalog nije otvoren

      setIsLoadingUsers(true)
      
      try {
        const supabase = createClient()
        
        // Prvo provjeri da li je korisnik autentifikovan
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !currentUser) {
          console.error("Auth error:", authError)
          toast({
            title: "Greška",
            description: "Morate biti prijavljeni",
            variant: "destructive",
          })
          return
        }

        console.log("Fetching users for message dialog...")
        
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .neq("id", currentUser.id) // Isključi trenutnog korisnika
          .order("full_name")
        
        if (error) {
          console.error("Error fetching users:", error)
          toast({
            title: "Greška",
            description: "Došlo je do greške pri učitavanju korisnika",
            variant: "destructive",
          })
          return
        }

        console.log("Users fetched:", profiles?.length)
        
        if (profiles) {
          setInternalUsers(profiles)
        }
      } catch (error) {
        console.error("Unexpected error fetching users:", error)
        toast({
          title: "Greška",
          description: "Došlo je do neočekivane greške pri učitavanju korisnika",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [open, externalUsers, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!recipientId) {
      toast({
        title: "Greška",
        description: "Morate odabrati primaoca",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Ako je prosleđen externalOnSubmit, koristi ga (za reply slučaj)
      if (externalOnSubmit) {
        await externalOnSubmit({
          recipient_id: recipientId,
          subject: subject,
          body: content,
          priority: priority
        })
        
        // Reset form
        setRecipientId("")
        setPriority("normal")
        setSubject("")
        setContent("")
        
        setIsSubmitting(false)
        setOpen(false)
        return
      }

      // Originalna logika za slanje poruke
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        toast({
          title: "Greška",
          description: "Morate biti prijavljeni da biste poslali poruku",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Insert message
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          subject: subject,
          body: content,
          priority: priority,
          is_read: false,
        })

      if (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Greška",
          description: "Došlo je do greške pri slanju poruke",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Poruka poslana",
        description: "Vaša poruka je uspješno poslana.",
      })

      // Reset form
      setRecipientId("")
      setPriority("normal")
      setSubject("")
      setContent("")
      
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
          <DialogTitle>Nova Poruka</DialogTitle>
          <DialogDescription>Pošaljite poruku članu tima</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="to">Prima *</Label>
                <Select value={recipientId} onValueChange={setRecipientId} required disabled={isLoadingUsers}>
                  <SelectTrigger id="to">
                    <SelectValue placeholder={
                      isLoadingUsers ? "Učitavanje korisnika..." : "Odaberite primaoca"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.full_name}</span>
                            {user.email && (
                              <span className="text-xs text-muted-foreground">
                                {user.email} {user.role ? `• ${user.role}` : ''}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        {isLoadingUsers ? "Učitavanje korisnika..." : "Nema dostupnih korisnika"}
                      </SelectItem>
                    )}
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
                    <SelectItem value="normal">Normalan</SelectItem>
                    <SelectItem value="high">Visok</SelectItem>
                    <SelectItem value="urgent">Hitan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Naslov *</Label>
              <Input 
                id="subject" 
                placeholder="Naslov poruke" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Poruka *</Label>
              <Textarea 
                id="content" 
                placeholder="Unesite vašu poruku ovdje..." 
                rows={8} 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Otkaži
            </Button>
            <Button type="submit" disabled={isSubmitting || !recipientId}>
              {isSubmitting ? "Slanje..." : "Pošalji Poruku"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}