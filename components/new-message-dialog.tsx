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

interface NewMessageDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface User {
  id: string
  full_name: string
}

export function NewMessageDialog({ children, open: externalOpen, onOpenChange: externalOnOpenChange }: NewMessageDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const [recipientId, setRecipientId] = useState("")
  const [priority, setPriority] = useState("normal")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [users, setUsers] = useState<User[]>([])

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  // Fetch users for recipient selection
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

      if (userError || !user) {
        toast({
          title: "Greška",
          description: "Morate biti prijavljeni da biste poslali poruku",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!recipientId) {
        toast({
          title: "Greška",
          description: "Morate odabrati primaoca",
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Hitan"
      case "high":
        return "Visok"
      case "normal":
        return "Normalan"
      case "low":
        return "Nizak"
      default:
        return priority
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
                <Select value={recipientId} onValueChange={setRecipientId} required>
                  <SelectTrigger id="to">
                    <SelectValue placeholder="Odaberite primaoca" />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Slanje..." : "Pošalji Poruku"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}