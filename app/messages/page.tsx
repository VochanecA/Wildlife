"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, MailOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewMessageDialog } from "@/components/new-message-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Message } from "@/lib/types"

const mockMessages: Message[] = [
  {
    id: "1",
    from: "Sarah Johnson",
    to: "Current User",
    subject: "Urgent: Geese activity near Runway 27",
    content:
      "Hi team, I've observed increased geese activity near Runway 27 this morning. We should coordinate dispersal efforts immediately. The flock size is approximately 30 birds. Please advise on the best approach.",
    timestamp: new Date("2025-01-21T08:30:00"),
    read: false,
    priority: "urgent",
  },
  {
    id: "2",
    from: "Mike Chen",
    to: "Current User",
    subject: "Weekly equipment inspection completed",
    content:
      "The weekly inspection of all wildlife dispersal equipment has been completed. All pyrotechnics are accounted for and in good condition. Acoustic deterrents tested successfully. Report attached.",
    timestamp: new Date("2025-01-20T16:45:00"),
    read: false,
    priority: "normal",
  },
  {
    id: "3",
    from: "John Smith",
    to: "Current User",
    subject: "Training session scheduled",
    content:
      "Reminder: Wildlife hazard management training session is scheduled for next Tuesday at 10:00 AM in Conference Room B. Please confirm your attendance.",
    timestamp: new Date("2025-01-20T14:20:00"),
    read: true,
    priority: "normal",
  },
  {
    id: "4",
    from: "Airport Operations",
    to: "Current User",
    subject: "Monthly report submission deadline",
    content:
      "This is a reminder that the monthly wildlife management report is due by January 31st. Please ensure all sightings, hazards, and actions are documented in the system.",
    timestamp: new Date("2025-01-19T09:00:00"),
    read: true,
    priority: "high",
  },
  {
    id: "5",
    from: "Sarah Johnson",
    to: "Current User",
    subject: "Habitat assessment findings",
    content:
      "Completed the habitat assessment of the north field. Found several areas with standing water that may attract waterfowl. Recommend drainage improvements. Full report available in the system.",
    timestamp: new Date("2025-01-18T11:30:00"),
    read: true,
    priority: "normal",
  },
]

export default function MessagesPage() {
  const [messages] = useState<Message[]>(mockMessages)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeTab, setActiveTab] = useState("inbox")

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
        return "bg-chart-5 text-white"
      case "normal":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Team communication and notifications</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="inbox" className="flex-1">
                Inbox ({unreadMessages.length})
              </TabsTrigger>
              <TabsTrigger value="read" className="flex-1">
                Read
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {unreadMessages.map((message) => (
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
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(message.from)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-semibold text-sm truncate">{message.from}</p>
                              {message.priority !== "normal" && (
                                <Badge className={`${getPriorityColor(message.priority)} text-xs`}>
                                  {message.priority}
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
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="read" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {readMessages.map((message) => (
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
                                  {message.priority}
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
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="h-[680px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(selectedMessage.from)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{selectedMessage.subject}</CardTitle>
                      {selectedMessage.priority !== "normal" && (
                        <Badge className={getPriorityColor(selectedMessage.priority)}>{selectedMessage.priority}</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-muted-foreground">From:</span>{" "}
                        <span className="font-medium">{selectedMessage.from}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedMessage.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </CardContent>
              <div className="border-t p-4 flex gap-2">
                <Button>Reply</Button>
                <Button variant="outline">Forward</Button>
              </div>
            </Card>
          ) : (
            <Card className="h-[680px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <NewMessageDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
