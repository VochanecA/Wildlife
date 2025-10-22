// app/messages/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewMessageDialog } from "@/components/new-message-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Mail, MailOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const searchQuery = typeof params.search === 'string' ? params.search : ''
  const activeTab = typeof params.tab === 'string' ? params.tab : 'inbox'

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
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
            <p className="text-lg font-medium mb-2 text-destructive">Morate biti prijavljeni</p>
            <p className="text-sm text-muted-foreground">Prijavite se da biste vidjeli poruke</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch messages where current user is recipient
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching messages:", error)
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
            <p className="text-lg font-medium mb-2 text-destructive">Greška pri učitavanju podataka</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch sender profiles
  let userProfiles: { [key: string]: { full_name: string } } = {}
  
  if (messages && messages.length > 0) {
    const senderIds = [...new Set(messages.map(msg => msg.sender_id))]
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
  const transformedMessages = messages?.map(msg => ({
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

  // Filter messages based on search query and active tab
  const filteredMessages = transformedMessages.filter(
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
        return "bg-chart-5 text-white"
      case "normal":
        return "bg-muted text-muted-foreground"
      case "low":
        return "bg-chart-3 text-white"
      default:
        return "bg-muted text-muted-foreground"
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

  // If no data, show empty state
  if (!messages || messages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Poruke</h1>
            <p className="text-muted-foreground">Komunikacija unutar tima i notifikacije</p>
          </div>
          <NewMessageDialog>
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
            <NewMessageDialog>
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
        <NewMessageDialog>
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
                <a href="?tab=inbox">Primljene ({unreadMessages.length})</a>
              </TabsTrigger>
              <TabsTrigger value="read" asChild>
                <a href="?tab=read">Pročitane</a>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {unreadMessages.length > 0 ? (
                    unreadMessages.map((message) => (
                      <Card
                        key={message.id}
                        className="cursor-pointer transition-colors hover:bg-accent"
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
                        className="cursor-pointer transition-colors hover:bg-accent"
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
          {unreadMessages.length > 0 || readMessages.length > 0 ? (
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
    </div>
  )
}