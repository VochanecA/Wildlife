// components/messages-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MailOpen, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export async function MessagesCard() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Fetch total messages count
  const { count: totalMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)

  // Fetch unread messages count
  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false)

  const hasUnreadMessages = (unreadMessagesCount || 0) > 0

  return (
    <Link href="/messages" className="block">
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group h-full bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-l-4 border-l-green-400">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 group-hover:from-green-600 group-hover:to-emerald-700 transition-all duration-300 shadow-md">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">Poruke</CardTitle>
              <p className="text-xs text-green-600 font-medium mt-1">
                {hasUnreadMessages ? "Nove poruke čekaju!" : "Sve je pročitano"}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-green-500 group-hover:text-green-700 group-hover:translate-x-1 transition-transform" />
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-col space-y-4">
            {/* New Messages Badge - UOČLJIVIJI */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  {hasUnreadMessages && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-800 block">NOVE PORUKE</span>
                  <span className="text-xs text-gray-500">Nepročitane</span>
                </div>
              </div>
              <div className="bg-red-500 text-white text-sm font-bold px-3 py-2 rounded-full min-w-[3rem] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <span className="drop-shadow-sm">{unreadMessagesCount || 0}</span>
              </div>
            </div>

            {/* Total Messages Badge - UOČLJIVIJI */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <MailOpen className="w-5 h-5 text-green-600" />
                <div>
                  <span className="text-sm font-bold text-gray-800 block">UKUPNO PORUKA</span>
                  <span className="text-xs text-gray-500">Sve poruke</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-3 py-2 rounded-full min-w-[3rem] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <span className="drop-shadow-sm">{totalMessagesCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Status Text - POBOLJŠAN */}
          <div className={`mt-4 p-3 rounded-lg text-center ${
            hasUnreadMessages 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            <p className={`text-sm font-semibold ${
              hasUnreadMessages ? 'text-red-700' : 'text-green-700'
            }`}>
              {hasUnreadMessages 
                ? `🚨 Imate ${unreadMessagesCount} nepročitanih poruka!` 
                : "✅ Sve poruke su pročitane"
              }
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {hasUnreadMessages ? "Kliknite da pročitate" : "Nema novih poruka"}
            </p>
          </div>

          {/* Progress Bar Indikator */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progres čitanja</span>
              <span>
                {totalMessagesCount ? 
                  Math.round(((totalMessagesCount - (unreadMessagesCount || 0)) / totalMessagesCount) * 100) : 100
                }%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: totalMessagesCount ? 
                    `${((totalMessagesCount - (unreadMessagesCount || 0)) / totalMessagesCount) * 100}%` 
                    : '100%'
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}