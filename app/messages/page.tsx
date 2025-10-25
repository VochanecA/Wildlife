// app/messages/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewMessageDialog } from "@/components/new-message-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Mail, MailOpen, Reply, Trash2, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: string
}

interface Message {
  id: string
  from: string
  to: string
  subject: string
  content: string
  timestamp: Date
  read: boolean
  priority: string
  sender_id: string
  originalData: any
}

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  
  // Koristite useSearchParams hook
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const activeTab = searchParams.get('tab') || 'inbox'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .neq("id", user.id)
        .order("full_name")
      
      setAllUsers(usersData || [])

      // Fetch messages
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Fetch sender profiles
      let userProfiles: { [key: string]: { full_name: string } } = {}
      
      if (messagesData && messagesData.length > 0) {
        const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))]
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", senderIds)

        if (profiles) {
          userProfiles = profiles.reduce((acc, profile) => {
            acc[profile.id] = { full_name: profile.full_name }
            return acc
          }, {} as { [key: string]: { full_name: string } })
        }
      }

      // Transform messages for display
      const transformedMessages: Message[] = messagesData?.map(msg => ({
        id: msg.id,
        from: userProfiles[msg.sender_id]?.full_name || "Nepoznato",
        to: "Trenutni korisnik",
        subject: msg.subject,
        content: msg.body,
        timestamp: new Date(msg.created_at),
        read: msg.is_read || false,
        priority: msg.priority,
        sender_id: msg.sender_id,
        originalData: msg
      })) || []

      setMessages(transformedMessages)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri učitavanju podataka",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId)

      if (error) throw error

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ))
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, read: true } : null)
      }

      toast({
        title: "Poruka označena kao pročitana",
        description: "Poruka je označena kao pročitana",
      })
    } catch (error) {
      console.error("Error marking message as read:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri označavanju poruke",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (messageId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)

      if (error) throw error

      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }

      toast({
        title: "Poruka obrisana",
        description: "Poruka je uspješno obrisana",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri brisanju poruke",
        variant: "destructive"
      })
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
  }

  const handleReplySubmit = async (replyData: {
    recipient_id: string
    subject: string
    body: string
    priority: string
  }) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Greška",
          description: "Morate biti prijavljeni",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: replyData.recipient_id,
          subject: replyData.subject,
          body: replyData.body,
          priority: replyData.priority,
          is_read: false,
        })

      if (error) throw error

      toast({
        title: "Odgovor poslan",
        description: "Vaš odgovor je uspješno poslan",
      })

      setReplyingTo(null)
      fetchData() // Refresh messages
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Greška",
        description: "Došlo je do greške pri slanju odgovora",
        variant: "destructive"
      })
    }
  }

  // Filter messages based on search query and active tab
  const filteredMessages = messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const unreadMessages = filteredMessages.filter((m) => !m.read)
  const readMessages = filteredMessages.filter((m) => m.read)

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Poruke</h1>
            <p className="text-muted-foreground">Komunikacija unutar tima i notifikacije</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground mt-2">Učitavanje poruka...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no data, show empty state
  if (messages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Poruke</h1>
            <p className="text-muted-foreground">Komunikacija unutar tima i notifikacije</p>
          </div>
          <NewMessageDialog users={allUsers}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Poruka
            </Button>
          </NewMessageDialog>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2">Nema poruka</p>
            <p className="text-sm text-muted-foreground mb-4">Započnite slanjem prve poruke</p>
            <NewMessageDialog users={allUsers}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Pošalji Prvu Poruku
              </Button>
            </NewMessageDialog>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Poruke</h1>
          <p className="text-muted-foreground">Komunikacija unutar tima i notifikacije</p>
        </div>
        <NewMessageDialog users={allUsers}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Poruka
          </Button>
        </NewMessageDialog>
      </div>

      <div className="flex gap-4">
        <form className="relative flex-1" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Pretraži poruke..."
            defaultValue={searchQuery}
            className="pl-9"
          />
          <input type="hidden" name="tab" value={activeTab} />
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="inbox" asChild>
                <a href={`?tab=inbox${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}>
                  Primljene ({unreadMessages.length})
                </a>
              </TabsTrigger>
              <TabsTrigger value="read" asChild>
                <a href={`?tab=read${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}>
                  Pročitane
                </a>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {unreadMessages.length > 0 ? (
                    unreadMessages.map((message) => (
                      <Card
                        key={message.id}
                        className={`cursor-pointer transition-colors hover:bg-accent ${
                          selectedMessage?.id === message.id ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          setSelectedMessage(message)
                          if (!message.read) {
                            handleMarkAsRead(message.id)
                          }
                        }}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getInitials(message.from)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="font-semibold text-sm truncate">{message.from}</p>
                                {message.priority !== "normal" && (
                                  <Badge className={`${getPriorityColor(message.priority)} text-xs`}>
                                    {getPriorityText(message.priority)}
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-sm truncate mb-1">{message.subject}</p>
                              <p className="text-xs text-muted-foreground">{message.timestamp.toLocaleString()}</p>
                            </div>
                            {!message.read && <Mail className="w-4 h-4 text-primary flex-shrink-0" />}
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <MailOpen className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Nema nepročitanih poruka</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="read" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {readMessages.length > 0 ? (
                    readMessages.map((message) => (
                      <Card
                        key={message.id}
                        className={`cursor-pointer transition-colors hover:bg-accent ${
                          selectedMessage?.id === message.id ? "bg-accent" : ""
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                {getInitials(message.from)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="font-semibold text-sm truncate">{message.from}</p>
                                {message.priority !== "normal" && (
                                  <Badge className={`${getPriorityColor(message.priority)} text-xs`}>
                                    {getPriorityText(message.priority)}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm truncate mb-1 text-muted-foreground">{message.subject}</p>
                              <p className="text-xs text-muted-foreground">{message.timestamp.toLocaleString()}</p>
                            </div>
                            <MailOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Mail className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Nema pročitanih poruka</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="h-[680px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(selectedMessage.from)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg truncate">{selectedMessage.subject}</CardTitle>
                        <Badge className={getPriorityColor(selectedMessage.priority)}>
                          {getPriorityText(selectedMessage.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Od:</span>
                          <span>{selectedMessage.from}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{selectedMessage.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-6 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.content}
                  </div>
                </div>
              </CardContent>

              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReply(selectedMessage)}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Odgovori
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Obriši
                  </Button>
                </div>
              </div>
            </Card>
          ) : unreadMessages.length > 0 || readMessages.length > 0 ? (
            <Card className="h-[680px] flex flex-col">
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Odaberite poruku za pregled</p>
                  <p className="text-sm">Kliknite na bilo koju poruku sa lijeve strane da biste vidjeli njen sadržaj</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[680px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nema poruka za prikaz</p>
                <p className="text-sm">Poruke koje primate će se pojaviti ovdje</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Reply Dialog */}
      {replyingTo && (
        <NewMessageDialog
          open={!!replyingTo}
          onOpenChange={(open) => !open && setReplyingTo(null)}
          users={allUsers}
          initialData={{
            recipient_id: replyingTo.sender_id,
            subject: `Re: ${replyingTo.subject}`,
            body: `\n\n--- Originalna poruka ---\nOd: ${replyingTo.from}\nDatum: ${replyingTo.timestamp.toLocaleString()}\n\n${replyingTo.content}`,
            priority: "normal"
          }}
          onSubmit={handleReplySubmit}
        />
      )}
    </div>
  )
}