"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "agent"
  content: string
  timestamp: Date
}

interface AgentChatPanelProps {
  sessionId: string | null
}

export function AgentChatPanel({ sessionId }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: "Hello! I'm your AI music producer. Describe the music you want to create and I'll compose it for you.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate agent response (will be replaced with real Temporal workflow communication)
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "I understand. I'll start composing your track with those characteristics.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentMessage])
    }, 1000)
  }

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">AI Assistant</CardTitle>
        <CardDescription className="text-purple-300">Chat with the autonomous agent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  message.role === "agent" ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-white/10"
                }`}
              >
                {message.role === "agent" ? (
                  <Bot className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className={`flex-1 rounded-lg p-3 ${message.role === "agent" ? "bg-white/5" : "bg-purple-500/20"}`}>
                <p className="text-sm text-white">{message.content}</p>
                <p className="mt-1 text-xs text-white/40">{message.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Ask the agent..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="border-white/20 bg-white/5 text-white placeholder:text-white/50"
            disabled={!sessionId}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !sessionId}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
