"use client"

import { useState } from "react"
import { TopBar } from "@/components/top-bar"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Bot, Paperclip, Mic, CornerDownLeft } from "lucide-react"
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import { ChatMessageList } from "@/components/ui/chat-message-list"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export default function HomeChatPage() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const handleAttachFile = () => {}
  const handleMicrophoneClick = () => {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setQuery("")
    setLoading(true)

    try {
      const res = await fetch("/api/homechat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
      })
      const data = await res.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response || "Sorry, I couldn't process your query.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Error: Unable to get response.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="md:flex">
      <Sidebar />
      <main className="min-h-dvh flex flex-col flex-1 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <TopBar />
        <div className="flex-1 p-4 md:p-6" />
        <ExpandableChat
          size="lg"
          position="bottom-right"
          icon={<Bot className="h-6 w-6" />}
        >
          <ExpandableChatHeader className="flex-col text-center justify-center">
            <h1 className="text-xl font-semibold">CITYZEN CHAT</h1>
            <p className="text-sm text-muted-foreground">
              Ask about city services and reports
            </p>
          </ExpandableChatHeader>

          <ExpandableChatBody>
            <ChatMessageList>
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  variant={message.type === "user" ? "sent" : "received"}
                >
                  <ChatBubbleAvatar
                    className="h-8 w-8 shrink-0"
                    src={
                      message.type === "user"
                        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                    }
                    fallback={message.type === "user" ? "US" : "AI"}
                  />
                  <ChatBubbleMessage
                    variant={message.type === "user" ? "sent" : "received"}
                  >
                    {message.content}
                  </ChatBubbleMessage>
                </ChatBubble>
              ))}

              {loading && (
                <ChatBubble variant="received">
                  <ChatBubbleAvatar
                    className="h-8 w-8 shrink-0"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                    fallback="AI"
                  />
                  <ChatBubbleMessage isLoading />
                </ChatBubble>
              )}
            </ChatMessageList>
          </ExpandableChatBody>

          <ExpandableChatFooter>
            <form
              onSubmit={handleSubmit}
              className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
            >
              <ChatInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your message..."
                className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center p-3 pt-0 justify-between">
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={handleAttachFile}
                  >
                    <Paperclip className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={handleMicrophoneClick}
                  >
                    <Mic className="size-4" />
                  </Button>
                </div>
                <Button type="submit" size="sm" className="ml-auto gap-1.5">
                  Send Message
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </form>
          </ExpandableChatFooter>
        </ExpandableChat>
        <BottomNav />
      </main>
    </div>
  )
}