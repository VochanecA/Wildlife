// components/message-detail.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Reply, Trash2, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import React from "react"

interface MessageDetailProps {
  message: {
    id: string
    from: string
    subject: string
    content: string
    timestamp: Date
    priority: string
    read: boolean
    sender_id: string
  }
  onMarkAsRead: (messageId: string) => void
}

export function MessageDetail({ message, onMarkAsRead }: MessageDetailProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Oznaci poruku kao procitanu kada se komponenta mount-uje
  React.useEffect(() => {
    if (!message.read) {
      onMarkAsRead(message.id)
    }
  }, [message.id, message.read, onMarkAsRead])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive text-destructive-foreground"
      case "high":
        return "bg-orange-500 text-white"
      case "normal":
        return "bg-blue-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDelete = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", message.id)

      if (error) throw error

      toast({
        title: "Poruka obrisana",
        description: "Poruka je uspješno obrisana",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri brisanju poruke",
        variant: "destructive",
      })
    }
  }

  const handleReply = () => {
    // Ovdje možete implementirati funkcionalnost za odgovaranje
    toast({
      title: "Funkcija u razvoju",
      description: "Funkcija za odgovaranje će biti dostupna uskoro",
    })
  }

  return (
    <Card className="h-[680px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(message.from)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg truncate">{message.subject}</CardTitle>
                <Badge className={getPriorityColor(message.priority)}>
                  {getPriorityText(message.priority)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Od:</span>
                  <span>{message.from}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{message.timestamp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        </div>
      </CardContent>

      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReply}>
              <Reply className="w-4 h-4 mr-2" />
              Odgovori
            </Button>
            <Button variant="outline" size="sm" onClick={handleReply}>
              <Reply className="w-4 h-4 mr-2" />
              Prosledi
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Obriši
          </Button>
        </div>
      </div>
    </Card>
  )
}